import { embedFileRequestSchema } from '../schemas/embedFileSchema';
import { embedFileController } from '../controllers/embedFileController';
import express from 'express';
import { validateData } from '../middlewares/validationMiddleware';

const embedFileRouter = express.Router();

embedFileRouter.post('/file', validateData(embedFileRequestSchema), embedFileController);

export default embedFileRouter;
