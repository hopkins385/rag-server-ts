import express from 'express';
import { validateData } from '../middlewares/validationMiddleware';
import { tokenizeRequestSchema } from '../schemas/tokenizeRequestSchema';
import { tokenizeController } from '../controllers/tokenizeController';

const tokenizeRouter = express.Router();

tokenizeRouter.post('/text', validateData(tokenizeRequestSchema, 'body'), tokenizeController);

export default tokenizeRouter;
