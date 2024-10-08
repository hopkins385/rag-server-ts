import express from 'express';
import cors from 'cors';

import routes from './routes';
import { loggerMiddleware } from './middlewares/loggerMiddleware';

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
  }),
);
app.use(express.json());

app.use(loggerMiddleware);

app.use('/api/v1', routes);

export default app;
