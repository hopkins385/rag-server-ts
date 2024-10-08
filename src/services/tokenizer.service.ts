import type { TiktokenEncoding, Tiktoken } from 'tiktoken';
import { get_encoding as getEncoding } from 'tiktoken';

export class TokenizerService {
  private model: TiktokenEncoding;

  private encoder: Tiktoken;

  constructor() {
    this.model = 'cl100k_base';
    this.encoder = getEncoding(this.model);
    console.log('TokenizerService instantiated');
  }

  setModel(model: TiktokenEncoding) {
    this.model = model;
    this.encoder = getEncoding(this.model);
  }

  async getTokens(
    content: string | undefined | null,
  ): Promise<{ tokens: Uint32Array; tokenCount: number; charCount: number }> {
    return new Promise((resolve, reject) => {
      if (!content || !content.length) {
        return reject(new Error('TokenizerService getTokens: Content is empty'));
      }

      const tokens = this.encoder.encode(content);
      const tokenCount = tokens.length;
      const charCount = content.length;

      resolve({ tokens, tokenCount, charCount });
    });
  }

  async detokenize(tokens: Uint32Array): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      if (!tokens || !tokens.length) {
        return reject(new Error('TokenizerService detokenize: Tokens are empty'));
      }

      const text = this.encoder.decode(tokens);

      resolve(text);
    });
  }
}
