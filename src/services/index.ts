import { TokenizerService } from './tokenizer.service';
import { EmbeddingService } from './embedding.service';
import qdrant from '../connectors/qdrant';
import openai from '../connectors/openai';
import cohere from '../connectors/cohere';
import { configService } from '../config';

export const tokenizerService = new TokenizerService();
export const embeddingService = new EmbeddingService(configService, tokenizerService, qdrant, openai, cohere);
