// src/schemas/embedFileRequestSchema.ts
import { z } from 'zod';

export const embedFileRequestSchema = z.object({
  mediaId: z.string(),
  recordId: z.string(),
  mimeType: z.string(),
  filePath: z.string(),
});

export type EmbedFileRequest = z.infer<typeof embedFileRequestSchema>;
