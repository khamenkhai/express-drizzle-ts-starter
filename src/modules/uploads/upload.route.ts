import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth.middleware";
import { upload } from "../../shared/middleware/upload.middleware";
import { uploadController } from "./upload.controller";

const uploadRoutes = Router();

uploadRoutes.use(authenticate);

uploadRoutes.post(
  "/single",
  upload.single("file"),
  uploadController.uploadSingle,
);

uploadRoutes.post(
  "/multiple",
  upload.array("files", 10),
  uploadController.uploadMultiple,
);

uploadRoutes.delete("/:key", uploadController.deleteFile);

uploadRoutes.get("/signed-url", uploadController.getSignedUrl);

export default uploadRoutes;
