import express from 'express';

import parseFile from './parseFile';
import embedFile from './embedFile';

const router = express.Router();

router.use('/parse', parseFile);
router.use('/embed', embedFile);

export default router;
