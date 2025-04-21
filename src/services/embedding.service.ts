import { ConfigService } from './config.service';
import type { QdrantClient } from '@qdrant/js-client-rest';
import type { TokenizerService } from './tokenizer.service';
import type OpenAI from 'openai';
import type { CohereClient } from 'cohere-ai';
import consola from 'consola';
import fs from 'fs';
import { RecursiveCharacterSplitter } from '../utils/splitter/RecursiveCharacterSplitter';
import axios from 'axios';
import { RagDocument } from './types';
import { join } from 'path';
import { record } from 'zod';

type Vector = number[];
export type Embedding = Vector;

export interface IEmbedFilePayload {
  mediaId: string;
  recordId: string;
  mimeType: string;
  path: string;
}

interface SearchResultDocument {
  mediaId: string;
  recordId: string;
  text: string;
  score: number;
}

const logger = consola.create({}).withTag('EmbeddingService');

export class EmbeddingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenizerService: TokenizerService,
    private readonly vectorStore: QdrantClient,
    private readonly openai: OpenAI,
    private readonly cohere: CohereClient,
    private readonly collectionName: string = 'documents',
  ) {
    console.log('EmbeddingService instantiated');
  }

  async deleteEmbedFile(payload: { mediaId: string; recordIds: string[] }): Promise<{ status: string }> {
    if (!payload.mediaId || !payload.recordIds || payload.recordIds.length < 1) {
      throw new Error('Invalid payload');
    }
    try {
      const result = await this.vectorStore.delete(this.collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: 'mediaId',
              match: {
                any: [payload.mediaId],
              },
            },
            {
              key: 'recordId',
              match: {
                any: payload.recordIds,
              },
            },
          ],
        },
      });

      return result;
    } catch (e) {
      logger.error('[delete]', e);
      throw new Error('Failed to delete documents from the vector store');
    }
  }

  async embedFile(payload: IEmbedFilePayload, options: { resetCollection?: boolean } = {}): Promise<RagDocument[]> {
    //
    const sanitizedPath = payload.path.replace(/(\.\.(\/|\\))/g, '');
    const filePath = join(process.cwd(), sanitizedPath);
    const buffer = await fs.promises.readFile(filePath);
    let text = '';
    try {
      const res = await axios<string>(this.configService.getFileReaderServerUrl(), {
        method: 'PUT',
        headers: {
          Accept: 'text/plain',
          'Content-Type': payload.mimeType,
        },
        data: buffer,
      });
      text = res.data;
    } catch (err) {
      consola.error(err);
      throw new Error('Failed to get file contents. Is the server reachable?');
    }

    // replace all \n with space
    text = text.replace(/\n/g, ' ');
    // replace all multiple spaces with single space
    text = text.replace(/\s+/g, ' ');
    // remove all leading and trailing spaces
    text = text.trim();

    const splitter = new RecursiveCharacterSplitter(this.tokenizerService, {
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.split(text);

    // create rag documents
    const documents = chunks.map(chunkText => {
      return new RagDocument({
        text: chunkText,
        metadata: {
          mediaId: payload.mediaId,
          recordId: payload.recordId,
        },
      });
    });

    // assign the embeddings to the documents in parallel
    const embeddings = await Promise.all(documents.map(document => this.#getEmbedding(document.text)));
    documents.forEach((document, index) => {
      document.embedding = embeddings[index];
    });

    // upsert the documents into the vector store
    const { status } = await this.#upsertVectorIndex(documents, { resetCollection: options.resetCollection });
    if (status !== 'completed') {
      throw new Error('Failed to upsert documents into the vector store');
    }

    return documents;
  }

  async #getEmbedding(text: string | string[] | number[] | number[][]): Promise<number[]> {
    if (!text || text.length < 1) {
      logger.info('text for embeeding empty!');
      return [];
    }

    try {
      const res = await this.openai.embeddings.create(
        {
          model: 'text-embedding-3-small',
          input: text,
          encoding_format: 'float',
        },
        {
          maxRetries: 3,
        },
      );

      if (!res?.data || !res?.data[0]?.embedding) {
        logger.error(`Embed text response invalid. Response is: ${JSON.stringify(res)}`);
        return [];
      }

      return res.data[0].embedding;
    } catch (e) {
      logger.error(`Failed to fetch embeddings. Error is: ${e}`);
      return [];
    }
  }

  async #searchVectorStore(payload: { embedding: number[]; recordIds: string[] }): Promise<SearchResultDocument[]> {
    const threshold = 0.25;

    try {
      const result = await this.vectorStore.search(this.collectionName, {
        with_payload: {
          include: ['mediaId', 'recordId', 'text'],
        },
        vector: payload.embedding,
        filter: {
          must: [
            {
              key: 'recordId',
              match: {
                any: payload.recordIds,
              },
            },
          ],
        },
        limit: 6,
      });

      if (!result || !result.length) {
        logger.error(`Search response invalid. Response is: ${JSON.stringify(result)}`);
        return [];
      }

      const docs = result.map(doc => {
        return {
          mediaId: doc.payload?.mediaId || '',
          recordId: doc.payload?.recordId || '',
          text: doc.payload?.text || '',
          score: doc.score,
        } as SearchResultDocument;
      });

      logger.info(
        `[search vector] found ${docs.length} documents with docs`,
        docs.map(doc => ({
          mediaId: doc.mediaId,
          recordId: doc.recordId,
          score: doc.score,
        })),
      );

      const filteredDocs = docs.filter(doc => doc.score >= threshold);

      return filteredDocs;
      //
    } catch (e) {
      logger.error('[search vector]', e);
      return [];
    }
  }

  async #createMediaCollection() {
    await this.vectorStore.createCollection(this.collectionName, {
      vectors: {
        size: 1536,
        distance: 'Cosine',
      },
    });

    //  -------- Create payload indexes -------------

    await this.vectorStore.createPayloadIndex(this.collectionName, {
      wait: true,
      field_name: 'recordId',
      field_schema: 'keyword',
    });

    await this.vectorStore.createPayloadIndex(this.collectionName, {
      wait: true,
      field_name: 'mediaId',
      field_schema: 'keyword',
    });

    await this.vectorStore.createPayloadIndex(this.collectionName, {
      wait: true,
      field_name: 'text',
      field_schema: 'text',
    });
  }

  async #upsertVectorIndex(
    documents: RagDocument[],
    options: { resetCollection?: boolean } = {},
  ): Promise<{ status: string }> {
    try {
      const { exists: collectionExists } = await this.#collectionExists(this.collectionName);
      if (!collectionExists) {
        await this.#createMediaCollection();
      } else if (options.resetCollection === true) {
        await this.vectorStore.deleteCollection(this.collectionName);
        await this.#createMediaCollection();
      }

      const embeddingPoints = documents.map(doc => ({
        id: doc.id,
        vector: doc.embedding,
        payload: {
          mediaId: doc.metadata.mediaId,
          recordId: doc.metadata.recordId,
          text: doc.text,
        },
      }));

      return await this.vectorStore.upsert(this.collectionName, {
        wait: true,
        points: embeddingPoints,
      });
    } catch (e) {
      logger.error('[upsert]', e);
      return { status: 'failed' };
    }
  }

  async #collectionExists(collectionName: string) {
    return this.vectorStore.collectionExists(collectionName);
  }

  async #reRankDocuments(payload: {
    query: string;
    documents: SearchResultDocument[];
  }): Promise<SearchResultDocument[]> {
    try {
      const rerank = await this.cohere.rerank({
        documents: payload.documents.map(doc => doc.text),
        query: payload.query,
        topN: 3,
        model: 'rerank-multilingual-v3.0',
      });

      if (!rerank || !rerank.results || !rerank.results.length) {
        logger.error(`Rerank response invalid. Response is: ${JSON.stringify(rerank)}`);
        return [];
      }

      return rerank.results.map(result => {
        const doc = payload.documents.find(d => d.text === result.document?.text);
        return {
          mediaId: doc?.mediaId,
          recordId: doc?.recordId,
          text: doc?.text,
        } as SearchResultDocument;
      });
    } catch (e) {
      logger.error('[reRank]', e);
      return [];
    }
  }

  async searchDocsByQuery(payload: { query: string; recordIds: string[] }): Promise<SearchResultDocument[]> {
    try {
      // get the embedding vectors for the query
      const embedding = await this.#getEmbedding(payload.query);

      // search the vector store
      const documents = await this.#searchVectorStore({ embedding, recordIds: payload.recordIds });

      return documents;

      // rerank the documents based on the query
      const rerankedDocuments = await this.#reRankDocuments({ query: payload.query, documents });
      return rerankedDocuments;
    } catch (e) {
      logger.error('[search docs]', e);
      return [];
    }
  }
}
