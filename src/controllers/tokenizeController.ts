import { tokenizerService } from './../services/index';
import { Request, Response } from 'express';
import { TokenizeRequest } from '../schemas/tokenizeRequestSchema';

export const tokenizeController = async (req: Request, res: Response) => {
  const { text } = req.body as TokenizeRequest;

  try {
    const token = await tokenizerService.getTokens(text);
    res.json(token);
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error' });
  }
};
