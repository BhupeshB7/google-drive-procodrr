import * as fileShareService from "../service/fileShare.service.js";

export const shareFileController = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { email, permission } = req.body;
    const ownerId = req.user._id;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
        message: "Please provide an email address",
      });
    }

    const result = await fileShareService.shareFile(
      fileId,
      ownerId,
      email,
      permission,
    );

    res.status(201).json({
      message: "File shared successfully",
      share: result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message,
      });
    }
    next(error);
  }
};

export const getSharedFilesController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const result = await fileShareService.getSharedFiles(userId, {
      page,
      limit,
      sort,
      order,
    });

    res.status(200).json({
      message: "Shared files retrieved successfully",
      files: result.data,
      summary: result.summary,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message,
      });
    }
    next(error);
  }
};

export const getFileShareListController = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const ownerId = req.user._id;

    const shares = await fileShareService.getFileShareList(fileId, ownerId);

    res.status(200).json({
      message: "Share list retrieved successfully",
      shares,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message,
      });
    }
    next(error);
  }
};

export const updateFileSharePermissionController = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const { permission } = req.body;
    const ownerId = req.user._id;

    if (!permission || !["VIEW", "EDIT"].includes(permission)) {
      return res.status(400).json({
        error: "Invalid permission",
        message: "Permission must be either VIEW or EDIT",
      });
    }

    const result = await fileShareService.updateFileSharePermission(
      shareId,
      ownerId,
      permission,
    );

    res.status(200).json({
      message: "Permission updated successfully",
      share: result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message,
      });
    }
    next(error);
  }
};

export const removeFileShareController = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const ownerId = req.user._id;

    const result = await fileShareService.removeFileShare(shareId, ownerId);

    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        message: error.message,
      });
    }
    next(error);
  }
};
