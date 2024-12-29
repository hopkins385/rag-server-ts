import { Request, Response } from 'express';
import { ParseFileRequest } from '../schemas/parseFileSchema';
import { configService } from '../config';
import axios from 'axios';
import { readFile } from 'node:fs/promises';
import consola from 'consola';

function getMimeType(filePath: string): string {
  const parts = filePath.split('.');
  const extension = parts[parts.length - 1];
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'eml':
      return 'message/rfc822';
    default:
      return 'application/octet-stream';
  }
}

export const parseFileController = async (req: Request, res: Response) => {
  const { filePath } = req.query as ParseFileRequest;
  console.log('Request received', filePath);

  try {
    const buffer = await readFile(filePath);
    const response = await axios<string>(configService.getFileReaderServerUrl(), {
      method: 'PUT',
      headers: {
        Accept: 'text/plain',
        'Content-Type': getMimeType(filePath),
        // 'X-Tika-PDFOcrStrategy': 'ocr_only',
        // 'X-Tika-PDFOextractInlineImages': true,
      },
      data: buffer,
    });
    res.json({ data: response.data });
  } catch (err: any) {
    consola.error(err?.message);
    res.status(500).json({ status: 'error' });
  }
};
