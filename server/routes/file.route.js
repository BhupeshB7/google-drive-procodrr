import express from "express";
import {
  deleteBulkFiles,
  deleteFile,
  generateFilesCopyLink,
  getFile,
  getFileAnalytics,
  getFileDetails,
  getFileMetadata,
  getrecentFiles,
  getStarredFiles,
  handleStarred,
  renameFile,
  uploadFileComplete,
  uploadFile,
  uploadFileInitiate,
  markFileAccessed,
} from "../controllers/file.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const fileRouter = express.Router();

fileRouter.get("/public/:fileId/metadata", getFileMetadata);

fileRouter.post("/upload/complete", authMiddleware, uploadFileComplete);
fileRouter.post("/upload/initiate", authMiddleware, uploadFileInitiate);
fileRouter.post("/upload/:parentDirId?", authMiddleware, uploadFile);

fileRouter.get("/recent", authMiddleware, getrecentFiles);
fileRouter.get("/starred", authMiddleware, getStarredFiles);
fileRouter.get("/analytics", authMiddleware, getFileAnalytics);

fileRouter.get("/fileDetails/:fileId", authMiddleware, getFileDetails);
fileRouter.get("/:fileId/metadata", authMiddleware, getFileMetadata);
fileRouter.post("/copy-link/:fileId", authMiddleware, generateFilesCopyLink);
fileRouter.patch("/rename/:fileId", authMiddleware, renameFile);
fileRouter.patch("/starred/:fileId", authMiddleware, handleStarred);

fileRouter.delete("/bulk-delete", authMiddleware, deleteBulkFiles);
fileRouter.delete("/:fileId", authMiddleware, deleteFile);

fileRouter.get("/:fileId", authMiddleware, getFile);
fileRouter.patch("/:id/access", authMiddleware, markFileAccessed);

export default fileRouter;
