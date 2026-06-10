import express from "express";
import directoryRouter from "./directory.routes.js";
import fileShareRouter from "./file-share.routes.js";
import fileRouter from "./file.route.js";
import searchRouter from "./search.routes.js";
import trashRouter from "./trash.routes.js";
import userRouter from "./user.routes.js";
import integrationRouter from "./integration.routes.js";
const router = express.Router();

router.use("/user", userRouter);
router.use("/directory", directoryRouter);
router.use("/files", fileRouter);
router.use("/trash", trashRouter);
router.use("/search", searchRouter);
router.use("/share", fileShareRouter);
router.use("/integrations", integrationRouter);

export default router;
