// src/schemas/searchVectorSchema.ts
import { z } from 'zod';

export const searchVectorRequestSchema = z.object({
  query: z.string(),
  recordIds: z.array(z.string()),
});

export type SearchVectorRequest = z.infer<typeof searchVectorRequestSchema>;
