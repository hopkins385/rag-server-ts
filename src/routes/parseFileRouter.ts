import express from 'express';
import { validateData } from '../middlewares/validationMiddleware';
import { parseFileRequestSchema } from '../schemas/parseFileSchema';
import { parseFileController } from '../controllers/parseFileController';

const parseFileRouter = express.Router();

parseFileRouter.get('/', validateData(parseFileRequestSchema, 'query'), parseFileController);

export default parseFileRouter;
