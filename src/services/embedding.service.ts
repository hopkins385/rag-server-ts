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

    const splitter = new RecursiveCharacterSplitter(this.tokenizerService, {
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.split(text);

    // create rag documents
    const documents = chunks.map(chunk => {
      return new RagDocument({
        text: chunk,
        metadata: {
          mediaId: payload.mediaId,
          recordId: payload.recordId,
        },
      });
    });

    // assign the embeddings to the documents
    for (const document of documents) {
      document.embedding = await this.#getEmbedding(document.text);
    }

    // upsert the documents into the vector store
    const { status } = await this.#upsertVectorIndex(documents, { resetCollection: options.resetCollection });
    if (status !== 'completed') {
      throw new Error('Failed to upsert documents into the vector store');
    }

    return documents;
  }

  async #getEmbedding(text: string | string[] | number[] | number[][]): Promise<number[]> {
    let res: OpenAI.Embeddings.CreateEmbeddingResponse;

    if (!text || text.length < 1) {
      logger.info('text for embeeding empty!');
      return [];
    }

    try {
      res = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });
    } catch (e) {
      logger.error(`Failed to fetch embeddings. Error is: ${e}`);
      return [];
    }

    if (!res?.data || !res?.data[0]?.embedding) {
      logger.error(`Embed text response invalid. Response is: ${JSON.stringify(res)}`);
      return [];
    }

    return res.data[0].embedding;
  }

  async #searchVectorStore(payload: { embedding: number[]; recordIds: string[] }): Promise<SearchResultDocument[]> {
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

      const docs = result.map(doc => {
        return {
          mediaId: doc.payload?.mediaId || '',
          recordId: doc.payload?.recordId || '',
          text: doc.payload?.text || '',
        } as SearchResultDocument;
      });

      return docs;
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

  async #upsertVectorIndex(documents: RagDocument[], options: { resetCollection?: boolean } = {}) {
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
          recordId: doc.metadata.recordId,
          mediaId: doc.metadata.recordId,
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
