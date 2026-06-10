import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  connectGoogleDrive,
  googleDriveCallback,
  listDriveItems,
  importDriveFiles,
  disconnectGoogleDrive,
  getGoogleDriveStatus,
} from "../controllers/integration.controller.js";

const integrationRouter = express.Router();

integrationRouter.get("/google/connect", authMiddleware, connectGoogleDrive);
integrationRouter.get("/google/callback", googleDriveCallback);
integrationRouter.get("/google/list", authMiddleware, listDriveItems);
integrationRouter.get("/google/status", authMiddleware, getGoogleDriveStatus);
integrationRouter.post("/google/import", authMiddleware, importDriveFiles);
integrationRouter.delete(
  "/google/disconnect",
  authMiddleware,
  disconnectGoogleDrive,
);

export default integrationRouter;
