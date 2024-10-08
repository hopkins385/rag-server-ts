import { CohereClient } from 'cohere-ai';
import { configService } from '../config';

const cohereClientSingleton = () => {
  return new CohereClient({
    token: configService.getCohereKey(),
  });
};

declare const globalThis: {
  cohereGlobal: ReturnType<typeof cohereClientSingleton>;
} & typeof global;

const cohere = globalThis.cohereGlobal ?? cohereClientSingleton();

export default cohere;

if (process.env.NODE_ENV !== 'production') globalThis.cohereGlobal = cohere;
