import { Request, Response } from 'express';
import { ParseFileRequest } from '../schemas/parseFileSchema';

export const parseFileController = (req: Request, res: Response) => {
  const { filePath } = req.body as ParseFileRequest;
  console.log('Request received', filePath);
  res.json({ chunks: ['😀', '😳', '🙄'] });
};
