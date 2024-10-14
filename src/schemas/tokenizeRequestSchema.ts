// src/schemas/tokenizeRequestSchema.ts
import { z } from 'zod';

export const tokenizeRequestSchema = z.object({
  text: z.string(),
});

export type TokenizeRequest = z.infer<typeof tokenizeRequestSchema>;
