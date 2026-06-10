import express from "express";
import {
  getFileShareListController,
  getSharedFilesController,
  removeFileShareController,
  shareFileController,
  updateFileSharePermissionController,
} from "../controllers/file-share.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const fileShareRouter = express.Router();

fileShareRouter.post("/:fileId", authMiddleware, shareFileController);
fileShareRouter.get("/", authMiddleware, getSharedFilesController);
fileShareRouter.get(
  "/:fileId/list",
  authMiddleware,
  getFileShareListController,
);
fileShareRouter.patch(
  "/:shareId/permission",
  authMiddleware,
  updateFileSharePermissionController,
);
fileShareRouter.delete("/:shareId", authMiddleware, removeFileShareController);

export default fileShareRouter;
