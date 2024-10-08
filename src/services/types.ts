import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { basename, resolve } from 'path';
import { toBase64 } from '../utils/toBase64';

export enum ObjectType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  INDEX = 'INDEX',
  DOCUMENT = 'DOCUMENT',
  IMAGE_DOCUMENT = 'IMAGE_DOCUMENT',
}

export type Metadata = Record<string, any>;

export type BaseNodeParams<T extends Metadata = Metadata> = {
  id?: string | undefined;
  metadata?: T | undefined;
};

export type TextNodeParams<T extends Metadata = Metadata> = BaseNodeParams<T> & {
  text?: string | undefined;
  embedding?: number[] | undefined;
};

/**
 * A document is just a special text node with a docId.
 */
export class RagDocument<T extends Metadata = Metadata> {
  id: string;

  text: string;

  metadata: T;

  embedding: number[];

  constructor(init: TextNodeParams<T> = {}) {
    const { id, metadata, embedding } = init || {};
    this.id = id ?? randomUUID();
    this.text = init.text ?? '';
    this.metadata = metadata ?? ({} as T);
    this.embedding = embedding ?? [];
  }

  get type() {
    return ObjectType.DOCUMENT;
  }
}

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: unknown[]): Promise<RagDocument[]>;
}

/**
 * A FileReader takes file paths and imports data into Document objects.
 */
export abstract class FileReader implements BaseReader {
  abstract loadDataAsContent(fileContent: Uint8Array | Buffer, fileName?: string): Promise<RagDocument[]>;

  async loadData(filePath: string): Promise<RagDocument[]> {
    const fileContent = await readFile(filePath);
    const fileName = basename(filePath);
    const docs = await this.loadDataAsContent(fileContent, fileName);
    docs.forEach(FileReader.addMetaData(filePath));
    return docs;
  }

  static addMetaData(filePath: string) {
    return (doc: RagDocument, index: number) => {
      // generate id as loadDataAsContent is only responsible for the content
      doc.id = `${toBase64(filePath)}_${index + 1}`;
      doc.metadata.file_path = resolve(filePath);
      doc.metadata.file_name = basename(filePath);
    };
  }
}
