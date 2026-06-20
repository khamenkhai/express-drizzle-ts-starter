import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

import { config } from "../../config/env";
import { BadRequestError, NotFoundError } from "../types/error";
import { logger } from "../utils/logger";

const s3Client = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  },
  forcePathStyle: config.s3.forcePathStyle,
});

const ALLOWED_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const generateKey = (originalName: string, folder?: string): string => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const filename = `${timestamp}-${random}${ext}`;
  return folder ? `${folder}/${filename}` : filename;
};

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface UploadOptions {
  folder?: string;
  mimetype?: string;
  size?: number;
}

export const uploadService = {
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestError(
        `File type ${file.mimetype} is not allowed. Allowed: ${ALLOWED_MIMETYPES.join(", ")}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError(`File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const key = generateKey(file.originalname, options.folder);

    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
      },
    });

    await s3Client.send(command);

    const url = `${config.s3.endpoint}/${config.s3.bucket}/${key}`;

    logger.info(`File uploaded: ${key} (${file.size} bytes)`);

    return {
      key,
      url,
      size: file.size,
      mimetype: file.mimetype,
    };
  },

  async deleteFile(key: string): Promise<void> {
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: config.s3.bucket,
          Key: key,
        }),
      );
    } catch {
      throw new NotFoundError("File not found");
    }

    const command = new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    });

    await s3Client.send(command);

    logger.info(`File deleted: ${key}`);
  },

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  getFileUrl(key: string): string {
    return `${config.s3.endpoint}/${config.s3.bucket}/${key}`;
  },

  generateKey,

  isAllowedMimetype(mimetype: string): boolean {
    return ALLOWED_MIMETYPES.includes(mimetype);
  },
};
