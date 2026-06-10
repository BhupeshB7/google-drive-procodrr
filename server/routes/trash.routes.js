import express from "express";

const trashRouter = express.Router();

import {
  deleteTrashFile,
  getAllTrashFiles,
  restoreTrashFile,
} from "../controllers/trash.conroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

trashRouter.get("/", authMiddleware, getAllTrashFiles);
trashRouter.delete("/:fileId", authMiddleware, deleteTrashFile);
trashRouter.post("/:fileId/restore", authMiddleware, restoreTrashFile);

export default trashRouter;
