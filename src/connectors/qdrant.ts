import { QdrantClient } from '@qdrant/js-client-rest';
import { configService } from '../config';

const qdrantClientSingleton = () => {
  return new QdrantClient({
    host: configService.getQdrantHost(),
    port: configService.getQdrantPort(),
  });
};

declare const globalThis: {
  qdrantGlobal: ReturnType<typeof qdrantClientSingleton>;
} & typeof global;

const qdrant = globalThis.qdrantGlobal ?? qdrantClientSingleton();

export default qdrant;

if (process.env.NODE_ENV !== 'production') globalThis.qdrantGlobal = qdrant;
