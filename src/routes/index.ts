import express from 'express';

import parseFileRouter from './parseFileRouter';
import embedFileRouter from './embedFileRouter';
import searchRouter from './searchRouter';

const router = express.Router();

router.use('/parse', parseFileRouter);
router.use('/embed', embedFileRouter);
router.use('/search', searchRouter);

export default router;
