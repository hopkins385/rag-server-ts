interface Config {
  appPort: number;
  openaiKey: string;
  cohereKey: string;
  qdrantHost: string;
  qdrantPort: number;
  fileReaderServerUrl: string;
}

export class ConfigService {
  private readonly config: Config;

  constructor(
    config: Partial<Config> = {
      appPort: Number(process.env.APP_PORT) || 3000,
      openaiKey: process.env.OPENAI_API_KEY || '',
      cohereKey: process.env.COHERE_API_KEY || '',
      qdrantHost: process.env.QDRANT_HOST || 'localhost',
      qdrantPort: Number(process.env.QDRANT_PORT) || 6333,
      fileReaderServerUrl: process.env.FILE_READER_SERVER_URL || '',
    },
  ) {
    this.config = config as Config;
    console.log('ConfigService instantiated');
  }

  get<T>(key: string, defaultValue: T): T {
    return process.env[key] ? (process.env[key] as unknown as T) : defaultValue;
  }

  getOpenaiKey(): string {
    return this.config.openaiKey;
  }

  getCohereKey(): string {
    return this.config.cohereKey;
  }

  getQdrantHost(): string {
    return this.config.qdrantHost;
  }

  getQdrantPort(): number {
    return +this.config.qdrantPort;
  }

  getFileReaderServerUrl(): string {
    return this.config.fileReaderServerUrl;
  }

  getAppPort(): number {
    return this.config.appPort;
  }
}
