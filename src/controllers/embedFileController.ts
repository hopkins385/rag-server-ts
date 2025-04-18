import { Request, Response } from 'express';
import { embeddingService } from '../services';
import type { DeleteEmbedFileRequest, EmbedFileRequest } from '../schemas/embedFileSchema';

export const embedFileController = async (req: Request, res: Response) => {
  const { mediaId, recordId, mimeType, filePath } = req.body as EmbedFileRequest;

  try {
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
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error' });
  }
};

export const deleteEmbedFileController = async (req: Request, res: Response) => {
  const { mediaId, recordIds } = req.body as DeleteEmbedFileRequest;

  try {
    const result = await embeddingService.deleteEmbedFile({ mediaId, recordIds });
    res.json({ status: 'ok' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error' });
  }
};
