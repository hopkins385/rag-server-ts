// src/schemas/parseFileRequestSchema.ts
import { z } from 'zod';

export const parseFileRequestSchema = z.object({
  filePath: z.string(),
});

export type ParseFileRequest = z.infer<typeof parseFileRequestSchema>;
