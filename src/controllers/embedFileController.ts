import { Request, Response } from 'express';
import { embeddingService } from '../services';
import type { EmbedFileRequest } from '../schemas/embedFileSchema';

export const embedFileController = async (req: Request, res: Response) => {
  const { mediaId, recordId, mimeType, filePath } = req.body as EmbedFileRequest;
  console.log('Request received', filePath);

  const documents = await embeddingService.embedFile({
    mediaId,
    recordId,
    mimeType,
    path: filePath,
  });

  const response = documents.map(doc => {
    return {
      id: doc.id,
      text: doc.text,
      metadata: {
        recordId: doc.metadata.recordId,
        mediaId: doc.metadata.mediaId,
      },
    };
  });

  res.json(response);
};
