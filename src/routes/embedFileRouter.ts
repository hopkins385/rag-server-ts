import { deleteEmbedFileRequestSchema, embedFileRequestSchema } from '../schemas/embedFileSchema';
import { deleteEmbedFileController, embedFileController } from '../controllers/embedFileController';
import express from 'express';
import { validateData } from '../middlewares/validationMiddleware';

const embedFileRouter = express.Router();

embedFileRouter.post('/file', validateData(embedFileRequestSchema, 'body'), embedFileController); //
embedFileRouter.delete('/file', validateData(deleteEmbedFileRequestSchema, 'body'), deleteEmbedFileController); //

export default embedFileRouter;
