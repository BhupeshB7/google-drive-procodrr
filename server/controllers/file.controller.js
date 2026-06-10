import jwt from "jsonwebtoken";
import path from "path";
import imagekit from "../config/imagekit.js";
import redisClient from "../config/redis.js";
import {
  createGetSignedUrl,
  createUploadSignedUrl,
  getS3FileMetaData,
} from "../config/s3.js";
import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";
import Trash from "../models/trash.model.js";
import { checkFileAccess } from "../service/fileShare.service.js";
import { deleteCacheByPattern } from "../utils/cache.util.js";
import { buildCacheKey, collectionQuery } from "../utils/collectionQuery.js";
import { formatFileSize, getMimeType } from "../utils/file.util.js";

const CACHE_TTL_24H = 86400;
const FILE_RECENT_CACHE_KEY = (userId, params) =>
  buildCacheKey(`file:recent:${userId}`, params);
const FILE_STARRED_CACHE_KEY = (userId, params) =>
  buildCacheKey(`file:starred:${userId}`, params);
const FILE_ANALYTICS_CACHE_KEY = (userId) => `file:analytics:${userId}`;

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

export async function updateDirectoriesSize(parentId, deltaSize) {
  while (parentId) {
    const dir = await Directory.findById(parentId);
    dir.size += deltaSize;
    await dir.save();
    parentId = dir.parentDirId;
  }
}

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;

  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    if (!parentDirData) {
      res.status(404).json({ error: "Parent directory not found!" });
      return req.destroy();
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);
    const fileSize = parseInt(req.headers.filesize || "0");

    if (fileSize > 10 * 1024 * 1024) {
      res.status(413).json({ error: "File too large. Max allowed is 10MB." });
      return req.destroy();
    }

    const usedStorage = await calculateUserStorage(req.user._id);
    const totalLimit = req.user.maxStorageInBytes;

    if (usedStorage + fileSize > totalLimit) {
      res.status(507).json({
        error: "Insufficient storage",
        message: "Not enough storage space available",
      });
      return req.destroy();
    }

    const fileBuffer = [];
    let totalBytes = 0;

    req.on("data", (chunk) => {
      fileBuffer.push(chunk);
      totalBytes += chunk.length;

      if (totalBytes > fileSize) {
        res
          .status(400)
          .json({ error: "Uploaded data exceeds declared fileSize." });
        return req.destroy();
      }
    });

    req.on("end", async () => {
      const buffer = Buffer.concat(fileBuffer);

      if (totalBytes !== fileSize) {
        res.status(400).json({
          error:
            "Mismatch in file size: uploaded data does not match declared fileSize.",
        });
        return req.destroy();
      }

      let uploadResponse = null;
      let insertedFile = null;

      try {
        // 1. Upload to ImageKit
        uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: filename,
          folder: `/user-files`,
        });

        // 2. Save to DB
        insertedFile = await File.create({
          name: filename,
          extension,
          parentDirId: parentDirData._id,
          userId: req.user._id,
          size: totalBytes,
          imageKitUrl: uploadResponse.url,
          imageKitFileId: uploadResponse.fileId,
        });

        // 3. Respond
        return res.status(201).json({
          message: "File uploaded to ImageKit",
          file: {
            id: insertedFile._id,
            name: insertedFile.name,
            size: insertedFile.size,
            url: uploadResponse.url,
          },
        });
      } catch (err) {
        console.error("Upload or DB error:", err);

        // Cleanup if ImageKit uploaded
        if (uploadResponse?.fileId) {
          try {
            await imagekit.deleteFile(uploadResponse.fileId);
            console.log("  ImageKit file deleted after failure");
          } catch (ikErr) {
            console.error("Failed to delete file from ImageKit:", ikErr);
          }
        }

        // Cleanup if DB insert succeeded but something failed afterward
        if (insertedFile?._id) {
          try {
            await File.findByIdAndDelete(insertedFile._id);
            console.log("  DB file entry deleted after failure");
          } catch (dbErr) {
            console.error("Failed to delete DB file entry:", dbErr);
          }
        }

        return res.status(500).json({ error: "Upload failed, cleanup done." });
      }
    });

    req.on("error", (err) => {
      console.error("Request error:", err);
      return res.status(500).json({ error: "File upload stream error" });
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    next(err);
  }
};

export const uploadFileInitiate = async (req, res, next) => {
  console.log("Initiating upload for user:", req);
  try {
    const parentDirId = req.body.parentDirId || req.user.rootDirId;
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }
    console.log("Request body:", req.body);
    const filename = req.body.name || "untitled";
    const filesize = req.body.size;

    const usedStorage = await calculateUserStorage(req.user._id);
    const totalLimit = req.user.maxStorageInBytes;

    if (usedStorage + filesize > totalLimit) {
      return res.status(507).json({
        error: "Insufficient storage",
        message: "Not enough storage space available",
      });
    }

    const extension = path.extname(filename);
    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
      isUploading: true,
    });
    const uploadSignedUrl = await createUploadSignedUrl({
      key: `${insertedFile.id}${extension}`,
      contentType: req.body.contentType,
    });
    res.json({ uploadSignedUrl, fileId: insertedFile.id });
  } catch (err) {
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { fileId } = req.params;

  const accessCheck = await checkFileAccess(fileId, req.user._id);
  if (!accessCheck || !accessCheck.hasAccess) {
    return res.status(404).json({
      error: "File not found",
      message: "File not found or access denied",
    });
  }

  const fileData = await File.findOne({
    _id: fileId,
    isDeleted: false,
  }).lean();

  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  if (req.query.action === "download") {
    const fileUrl = await createGetSignedUrl({
      key: `${fileId}${fileData.extension}`,
      download: true,
      filename: fileData.name,
    });
    return res.redirect(fileUrl);
  }

  const fileUrl = await createGetSignedUrl({
    key: `${fileId}${fileData.extension}`,
    filename: fileData.name,
  });

  return res.redirect(fileUrl);
};
export const getFileMetadata = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    let file;
    let mode = "private"; 
    if (req.user) {
      const accessCheck = await checkFileAccess(fileId, req.user._id);
      if (!accessCheck || !accessCheck.hasAccess) {
        return res.status(404).json({
          error: "File not found",
          message: "File not found or access denied",
        });
      }

      file = await File.findOne({
        _id: fileId,
        isDeleted: false,
      }).lean();

      mode = accessCheck.isOwner ? "private" : "shared";
    } else {
      if (fileId.length <= 24) {
        return res.status(400).json({
          error: "Invalid shared file link",
          message: "The shared link appears to be malformed or incomplete",
        });
      }

      let decodedToken;
      try {
        decodedToken = jwt.verify(fileId, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({
          error: "Invalid or expired token",
          message: err.message,
        });
      }
      console.log("Decoded token:", decodedToken);
      file = await File.findOne({ _id: decodedToken.fileId }).lean();
      mode = "view";
    }

    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found or access denied",
      });
    }

    const fileUrl = await createGetSignedUrl({
      key: `${file._id}${file.extension}`,
      filename: file.name,
    });

    return res.json({
      id: file._id,
      name: file.name,
      type: getMimeType(file.extension),
      size: formatFileSize(file.size),
      extension: file.extension,
      uploadDate: file.createdAt,
      owner: req?.user?.name || req?.user?.email || "Anonymous",
      fileMode: mode,
      url: fileUrl,
    });
  } catch (err) {
    next(err);
  }
};

export const renameFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { newFileName } = req.body;

    const accessCheck = await checkFileAccess(fileId, req.user._id);
    if (!accessCheck || !accessCheck.hasAccess) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found or access denied",
      });
    }

    if (accessCheck.permission !== "EDIT" && !accessCheck.isOwner) {
      return res.status(403).json({
        error: "Permission denied",
        message: "You don't have permission to rename this file",
      });
    }

    const file = await File.findOne({
      _id: fileId,
      userId: req.user._id,
      isDeleted: false,
    }).lean();

    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found!",
      });
    }
    const existingFileNameInSameDir = await File.findOne({
      name: newFileName,
      parentDirId: file.parentDirId,
      userId: req.user._id,
    }).lean();
    if (existingFileNameInSameDir) {
      return res.status(400).json({
        error: "File name already exists",
        message: "File already exists in the same directory",
      });
    }
    await File.updateOne(
      { _id: fileId, userId: req.user._id },
      { $set: { name: newFileName } },
    );
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById({
      _id: fileId,
      userId: req.user._id,
    }).select("extension name parentDirId");
    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found!",
      });
    }
    await File.findByIdAndUpdate(
      {
        _id: fileId,
        userId: req.user._id,
      },
      {
        $set: { isDeleted: true },
      },
    );
    const parentDirName = await Directory.findOne({
      _id: file.parentDirId,
      userId: req.user._id,
    }).select("name");
    await Trash.insertOne({
      _id: fileId,
      fileId: fileId,
      name: file.name,
      extension: file.extension,
      userId: req.user._id,
      parentDirId: file.parentDirId,
      parentDirName: parentDirName.name,
    });

    const userId = req.user._id.toString();
    await deleteCacheByPattern(`user:storage:${userId}`);
    await deleteCacheByPattern(`file:*:${userId}*`);

    res.status(200).json({ message: "File moved to trash successfully" });
  } catch (error) {
    next(error);
  }
};

export const getFileAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const cacheKey = FILE_ANALYTICS_CACHE_KEY(userId);

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
    const PDF_EXTENSIONS = [".pdf"];
    const TEXT_EXTENSIONS = [".txt"];
    const VIDEO_EXTENSIONS = [".mp4"];
    const analytics = await File.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
        },
      },
      {
        $project: {
          type: {
            $switch: {
              branches: [
                {
                  case: { $in: ["$extension", IMAGE_EXTENSIONS] },
                  then: "Image",
                },
                {
                  case: { $in: ["$extension", PDF_EXTENSIONS] },
                  then: "PDF",
                },
                {
                  case: { $in: ["$extension", TEXT_EXTENSIONS] },
                  then: "Text",
                },
                {
                  case: { $in: ["$extension", VIDEO_EXTENSIONS] },
                  then: "Video",
                },
              ],
              default: "Other",
            },
          },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);
    // console.log("Raw analytics",analytics);
    const result = {
      Image: 0,
      PDF: 0,
      Text: 0,
      Video: 0,
      Other: 0,
    };
    analytics.forEach(({ _id, count }) => {
      result[_id] = count;
    });

    const response = {
      message: "Analytics fetched successfully",
      data: result,
    };

    await redisClient.setEx(cacheKey, CACHE_TTL_24H, JSON.stringify(response));
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getrecentFiles = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const sortField = req.query.sort || "lastAccessedAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const allowedSortFields = ["lastAccessedAt", "name", "createdAt", "size"];
    const validSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "lastAccessedAt";

    const cacheParams = { page, limit, sort: { [validSortField]: sortOrder } };
    const cacheKey = FILE_RECENT_CACHE_KEY(userId, cacheParams);

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await collectionQuery(File, {
      filter: {
        userId: req.user._id,
        isDeleted: false,
        lastAccessedAt: { $ne: null },
      },
      page,
      limit,
      sort: { [validSortField]: sortOrder },
    });

    const response = {
      success: true,
      data: result.data,
      summary: result.summary,
    };

    await redisClient.setEx(cacheKey, CACHE_TTL_24H, JSON.stringify(response));
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const markFileAccessed = async (req, res, next) => {
  try {
    const accessCheck = await checkFileAccess(req.params.id, req.user._id);
    if (!accessCheck || !accessCheck.hasAccess) {
      return res.status(404).end();
    }

    await File.updateOne(
      { _id: req.params.id, isDeleted: false },
      { $set: { lastAccessedAt: new Date() } },
    );

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const handleStarred = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const isFileExist = await File.findById({
      _id: fileId,
      userId: req.user._id,
    }).lean();
    if (!isFileExist) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found!",
      });
    }
    await File.findByIdAndUpdate(
      {
        _id: fileId,
        userId: req.user._id,
      },
      {
        $set: { isStarred: !isFileExist.isStarred },
      },
    );

    const userId = req.user._id.toString();
    await deleteCacheByPattern(`file:starred:${userId}*`);

    res.status(200).json({
      message: `File ${
        !isFileExist.isStarred ? "starred" : "unstarred"
      } successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const getStarredFiles = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const sortField = req.query.sort || "updatedAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const allowedSortFields = ["updatedAt", "name", "createdAt", "size"];
    const validSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "updatedAt";

    const cacheParams = { page, limit, sort: { [validSortField]: sortOrder } };
    const cacheKey = FILE_STARRED_CACHE_KEY(userId, cacheParams);

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await collectionQuery(File, {
      filter: {
        userId: req.user._id,
        isStarred: true,
        isDeleted: false,
      },
      page,
      limit,
      sort: { [validSortField]: sortOrder },
    });

    const response = {
      success: true,
      data: result.data,
      summary: result.summary,
    };

    await redisClient.setEx(cacheKey, CACHE_TTL_24H, JSON.stringify(response));
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const generateFilesCopyLink = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById({
      _id: fileId,
      userId: req.user._id,
    }).lean();
    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found!",
      });
    }
    const secretKey = process.env.SECRET_KEY || "secret";
    const shareToken = jwt.sign({ fileId }, secretKey, { expiresIn: "1h" });
    await File.findByIdAndUpdate(
      {
        _id: fileId,
        userId: req.user._id,
      },
      {
        $set: {
          shareToken: shareToken,
        },
      },
    );

    res.status(200).json({
      message: "Link generated successfully",
      link: shareToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getFileDetails = async (req, res) => {
  const { fileId } = req.params;
  try {
    const accessCheck = await checkFileAccess(fileId, req.user._id);
    if (!accessCheck || !accessCheck.hasAccess) {
      return res.status(404).json({
        error: "File not found",
        message: "File not found or access denied",
        success: false,
      });
    }

    const file = await File.findOne({
      _id: fileId,
      isDeleted: false,
    }).lean();

    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found!", success: false });
    }
    const fileDetails = {
      _id: file._id,
      name: file.name,
      extension: file.extension,
      size: file.size,
      type: getMimeType(file.extension),
      uploadDate: file.createdAt,
      recentView: file.updatedAt,
      owner: req?.user?.name || req?.user?.email || "Anonymous",
      isStarred: file.isStarred,
      sharedWith: file.sharedWith,
      isLinkSharingEnabled: file.isLinkSharingEnabled,
      linkAccessRole: file.linkAccessRole,
    };
    res.status(200).json({
      message: "File details fetched successfully!",
      success: true,
      fileDetails,
    });
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";

export const deleteBulkFiles = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: "No file ids provided" });
    }

    if (fileIds.length > 100) {
      return res.status(400).json({ message: "Maximum 100 files allowed" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    session.startTransaction();

    const files = await File.find(
      {
        _id: { $in: fileIds },
        userId,
        isDeleted: false,
      },
      null,
      { session },
    );

    if (files.length !== fileIds.length) {
      throw new Error("Some file ids are invalid or not yours");
    }

    await File.updateMany(
      { _id: { $in: fileIds }, userId },
      { $set: { isDeleted: true, isStarred: false } },
      { session },
    );

    const trashDocs = files.map((file) => ({
      name: file.name,
      fileId: file._id,
      extension: file.extension,
      userId: file.userId,
      parentDirId: file.parentDirId ?? null,
      parentDirName: file.parentDirName ?? "root",
    }));

    await Trash.insertMany(trashDocs, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Files deleted successfully",
      deletedCount: fileIds.length,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const uploadFileComplete = async (req, res, next) => {
  const file = await File.findById(req.body.fileId);
  if (!file) {
    return res.status(404).json({ error: "File not found in our records" });
  }

  try {
    const fileData = await getS3FileMetaData(`${file.id}${file.extension}`);
    if (fileData.ContentLength !== file.size) {
      await file.deleteOne();
      return res.status(400).json({ error: "File size does not match." });
    }
    file.isUploading = false;
    await file.save();
    await updateDirectoriesSize(file.parentDirId, file.size);

    const userId = file.userId.toString();
    await deleteCacheByPattern(`user:storage:${userId}`);
    await deleteCacheByPattern(`file:*:${userId}*`);

    res.json({ message: "Upload completed" });
  } catch (err) {
    console.error("Error in uploadFileComplete:", err);
    await file.deleteOne();
    return res
      .status(404)
      .json({ error: "File was could not be uploaded properly." });
  }
};
