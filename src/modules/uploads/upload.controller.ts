import { type Response, type NextFunction } from "express";

import { type AuthRequest } from "../../shared/types";
import { uploadService } from "../../shared/services/upload";
import { BadRequestError } from "../../shared/types/error";

export class UploadController {
  async uploadSingle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError("No file provided");
      }

      const body = req.body as { folder?: string };
      const result = await uploadService.uploadFile(req.file, { folder: body.folder });

      res.status(201).json({
        status: true,
        message: "File uploaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadMultiple(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new BadRequestError("No files provided");
      }

      const body = req.body as { folder?: string };
      const results = await Promise.all(
        req.files.map((file) => uploadService.uploadFile(file, { folder: body.folder })),
      );

      res.status(201).json({
        status: true,
        message: `${results.length} file(s) uploaded successfully`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);
      await uploadService.deleteFile(decodedKey);

      res.status(200).json({
        status: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSignedUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key } = req.query as { key?: string };
      if (!key) {
        throw new BadRequestError("key query parameter is required");
      }

      const url = await uploadService.getSignedDownloadUrl(key);

      res.status(200).json({
        status: true,
        message: "Signed URL generated successfully",
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
