import { searchVectorRequestSchema } from './../schemas/searchVectorSchema';
import express from 'express';
import { validateData } from '../middlewares/validationMiddleware';
import { searchVectorController } from '../controllers/searchVectorController';

const searchRouter = express.Router();

searchRouter.post('/vector', validateData(searchVectorRequestSchema, 'body'), searchVectorController);

export default searchRouter;
