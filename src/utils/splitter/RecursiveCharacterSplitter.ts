import type { TokenizerService } from '../../services/tokenizer.service';

export class RecursiveCharacterSplitter {
  private readonly chunkSize: number;

  private readonly chunkOverlap: number;

  private readonly separator: string;

  private readonly paragraphSeparator: string;

  private readonly secondaryChunkingRegex: RegExp;

  private chunks: string[] = [];

  private tokenizerService: TokenizerService;

  constructor(
    tokenizerService: TokenizerService,
    params: {
      chunkSize?: number;
      chunkOverlap?: number;
      separator?: string;
      paragraphSeparator?: string;
      secondaryChunkingRegex?: string;
    } = {},
  ) {
    this.tokenizerService = tokenizerService;
    this.chunkSize = params.chunkSize ?? 1024;
    this.chunkOverlap = params.chunkOverlap ?? 200;
    if (this.chunkOverlap >= this.chunkSize) {
      throw new Error('Chunk overlap must be smaller than chunk size.');
    }
    this.separator = params.separator ?? ' ';
    this.paragraphSeparator = params.paragraphSeparator ?? '\n\n\n';
    this.secondaryChunkingRegex = new RegExp(params.secondaryChunkingRegex ?? '[^,.;。？！]+[,.;。？！]?');
  }

  async split(text: string, metadata: string = ''): Promise<string[]> {
    const metadataLength = await this.tokenSize(metadata);
    const effectiveChunkSize = this.chunkSize - metadataLength;
    if (effectiveChunkSize <= 0) {
      throw new Error(`Metadata length (${metadataLength}) is longer than chunk size (${this.chunkSize}).`);
    }
    this.chunks = [];
    await this.recursiveSplit(text, effectiveChunkSize);
    return this.postprocessChunks(this.chunks);
  }

  private async recursiveSplit(text: string, chunkSize: number): Promise<void> {
    const tokenSize = await this.tokenSize(text);
    if (tokenSize <= chunkSize) {
      this.chunks.push(text);
      return;
    }

    const splits = this.getSplits(text);
    await this.mergeAndAddChunks(splits, chunkSize);
  }

  private getSplits(text: string): string[] {
    if (text.includes(this.paragraphSeparator)) {
      return text.split(this.paragraphSeparator);
    }
    const sentenceSplits = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentenceSplits.length > 1) return sentenceSplits;
    const regexSplits = text.match(this.secondaryChunkingRegex) || [text];
    if (regexSplits.length > 1) return regexSplits;
    return text.split(this.separator);
  }

  private async mergeAndAddChunks(splits: string[], chunkSize: number): Promise<void> {
    let currentChunk = '';
    let currentSize = 0;

    for (const split of splits) {
      const splitSize = await this.tokenSize(split);
      if (currentSize + splitSize > chunkSize) {
        if (currentChunk) {
          this.chunks.push(currentChunk);
          currentChunk = await this.getOverlap(currentChunk);
          currentSize = await this.tokenSize(currentChunk);
        }
      }
      currentChunk += (currentChunk ? this.separator : '') + split;
      currentSize += splitSize;
    }

    if (currentChunk) {
      this.chunks.push(currentChunk);
    }
  }

  private async getOverlap(text: string): Promise<string> {
    const tokens = await this.tokenize(text);
    let overlapTokens: number[] = [];
    let overlapSize = 0;

    for (let i = tokens.length - 1; i >= 0; i--) {
      if (overlapSize + 1 > this.chunkOverlap) {
        break;
      }
      overlapTokens.unshift(tokens[i]);
      overlapSize++;
    }

    return this.detokenize(new Uint32Array(overlapTokens));
  }

  private postprocessChunks(chunks: string[]): string[] {
    return chunks.map(chunk => chunk.trim()).filter(chunk => chunk !== '');
  }

  private async tokenSize(text: string): Promise<number> {
    if (!text || !text.length) {
      return 0;
    }
    const { tokenCount } = await this.tokenizerService.getTokens(text);
    return tokenCount;
  }

  private async tokenize(text: string): Promise<Uint32Array> {
    if (!text || !text.length) {
      return new Uint32Array();
    }
    const { tokens } = await this.tokenizerService.getTokens(text);
    return tokens;
  }

  private async detokenize(tokens: Uint32Array): Promise<string> {
    if (!tokens || !tokens.length) {
      return '';
    }
    const uint8Array = await this.tokenizerService.detokenize(tokens);
    return new TextDecoder().decode(uint8Array);
  }

  getTotalChunks(): number {
    return this.chunks.length;
  }
}
