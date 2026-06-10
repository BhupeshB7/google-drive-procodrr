import { rm } from "fs/promises";
import mongoose from "mongoose";
import File from "../models/file.model.js";
import Trash from "../models/trash.model.js";
import User from "../models/user.model.js";
import { deleteCacheByPattern } from "../utils/cache.util.js";
import { collectionQuery } from "../utils/collectionQuery.js";

async function calculateUserStorage(userId) {
  const result = await File.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalSize: { $sum: "$size" },
      },
    },
  ]);
  return result.length > 0 ? result[0].totalSize : 0;
}
export const deleteTrashFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await Trash.findById({
      _id: fileId,
      userId: req.user._id,
    }).select("extension name parentDirId");
    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found!",
      });
    }
    const filePath = `${process.cwd()}/storage/${fileId}${file.extension}`;
    await rm(filePath);
    await Trash.deleteOne({ _id: fileId });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAllTrashFiles = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const allowedSortFields = ["name", "createdAt", "extension"];
    const validSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "createdAt";

    const result = await collectionQuery(Trash, {
      filter: { userId },
      page,
      limit,
      sort: { [validSortField]: sortOrder },
    });

    res.status(200).json({
      success: true,
      data: result.data,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
};

export const restoreTrashFile = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { fileId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    session.startTransaction();

    const trash = await Trash.findOne({ _id: fileId, userId }, null, {
      session,
    });

    if (!trash) {
      throw new Error("Trash file not found");
    }

    const fileToRestore = await File.findOne({
      _id: trash.fileId,
      userId,
      isDeleted: true,
    });

    if (!fileToRestore) {
      throw new Error("Original file not found or already restored");
    }

    const user = await User.findById(userId);
    const usedStorage = await calculateUserStorage(userId);

    if (usedStorage + fileToRestore.size > user.maxStorageInBytes) {
      await session.abortTransaction();
      session.endSession();
      return res.status(507).json({
        error: "Insufficient storage",
        message: "Not enough storage space to restore this file",
      });
    }

    const restoredFile = await File.findOneAndUpdate(
      {
        _id: trash.fileId,
        userId,
        isDeleted: true,
      },
      { $set: { isDeleted: false } },
      { new: true, session },
    );
    console.log(restoredFile);

    await Trash.deleteOne({ _id: trash._id }, { session });

    await session.commitTransaction();
    session.endSession();

    const userIdStr = userId.toString();
    await deleteCacheByPattern(`user:storage:${userIdStr}`);
    await deleteCacheByPattern(`file:*:${userIdStr}*`);

    return res.status(200).json({
      success: true,
      message: "File restored successfully",
      data: restoredFile,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
