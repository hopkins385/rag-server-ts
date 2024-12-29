import { Request, Response } from 'express';
import { embeddingService } from '../services';
import { SearchVectorRequest } from '../schemas/searchVectorSchema';

export const searchVectorController = async (req: Request, res: Response) => {
  const { query, recordIds } = req.body as SearchVectorRequest;

  try {
    const response = await embeddingService.searchDocsByQuery({ query, recordIds });
    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error' });
  }
};
