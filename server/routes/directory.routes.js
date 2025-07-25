import express from "express";
import {
  getDirectory,
  createDirectory,
  renameDirectory,
  deleteDirectory,
  getBreadcrumbPath,
} from "../controllers/directory.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const directoryRouter = express.Router();

directoryRouter.get("/:id?", authMiddleware, getDirectory);
directoryRouter.get("/breadcrumb/:dirId", authMiddleware, getBreadcrumbPath);
directoryRouter.post("/create/:parentDirId?", authMiddleware, createDirectory);
directoryRouter.patch("/rename/:id", authMiddleware, renameDirectory);
directoryRouter.delete("/:id", authMiddleware, deleteDirectory);
export default directoryRouter;
