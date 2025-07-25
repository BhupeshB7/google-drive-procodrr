import express from "express";

const trashRouter = express.Router();

import { getAllTrashFiles } from "../controllers/trash.conroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

trashRouter.get("/", authMiddleware, getAllTrashFiles);

export default trashRouter;