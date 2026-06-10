import FileShare from "../models/file-share.model.js";
import File from "../models/file.model.js";
import User from "../models/user.model.js";
import { collectionQuery } from "../utils/collectionQuery.js";

export const shareFile = async (
  fileId,
  ownerId,
  sharedWithEmail,
  permission,
) => {
  const file = await File.findOne({
    _id: fileId,
    userId: ownerId,
    isDeleted: false,
  });
  if (!file) {
    throw {
      status: 404,
      message: "File not found or you don't have permission",
    };
  }

  const sharedWithUser = await User.findOne({ email: sharedWithEmail });
  if (!sharedWithUser) {
    throw { status: 404, message: "User with this email does not exist" };
  }

  if (sharedWithUser._id.toString() === ownerId.toString()) {
    throw { status: 400, message: "Cannot share file with yourself" };
  }

  const existingShare = await FileShare.findOne({
    fileId,
    ownerId,
    sharedWithUserId: sharedWithUser._id,
  });

  if (existingShare) {
    throw { status: 409, message: "File already shared with this user" };
  }

  const fileShare = await FileShare.create({
    fileId,
    ownerId,
    sharedWithUserId: sharedWithUser._id,
    permission: permission || "VIEW",
  });

  return {
    id: fileShare._id,
    fileId: fileShare.fileId,
    ownerId: fileShare.ownerId,
    sharedWithUserId: fileShare.sharedWithUserId,
    sharedWithEmail: sharedWithUser.email,
    permission: fileShare.permission,
    createdAt: fileShare.createdAt,
  };
};

export const getSharedFiles = async (userId, options = {}) => {
  const { page = 1, limit = 30, sort = "createdAt", order = "desc" } = options;

  const sortField = ["createdAt", "name"].includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const result = await collectionQuery(FileShare, {
    filter: { sharedWithUserId: userId },
    page,
    limit,
    sort: { [sortField]: sortOrder },
    populate: {
      path: "fileId",
      select:
        "name extension size isStarred createdAt updatedAt userId isDeleted",
    },
  });

  const ownerIds = result.data
    .filter((share) => share.fileId && !share.fileId.isDeleted)
    .map((share) => share.ownerId);

  const owners = await User.find({ _id: { $in: ownerIds } })
    .select("_id name email")
    .lean();

  const ownerMap = new Map(
    owners.map((owner) => [owner._id.toString(), owner]),
  );

  const data = result.data
    .filter((share) => share.fileId && !share.fileId.isDeleted)
    .map((share) => {
      const owner = ownerMap.get(share.ownerId.toString());
      return {
        id: share._id,
        file: {
          id: share.fileId._id,
          name: share.fileId.name,
          extension: share.fileId.extension,
          size: share.fileId.size,
          isStarred: share.fileId.isStarred,
          createdAt: share.fileId.createdAt,
          updatedAt: share.fileId.updatedAt,
        },
        ownerId: share.ownerId,
        ownerName: owner?.name || "Unknown",
        ownerEmail: owner?.email || "Unknown",
        permission: share.permission,
        sharedAt: share.createdAt,
      };
    });

  return {
    data,
    summary: result.summary,
  };
};

export const getFileShareList = async (fileId, ownerId) => {
  const file = await File.findOne({
    _id: fileId,
    userId: ownerId,
    isDeleted: false,
  });
  if (!file) {
    throw {
      status: 404,
      message: "File not found or you don't have permission",
    };
  }

  const shares = await FileShare.find({ fileId, ownerId }).lean();

  const userIds = shares.map((share) => share.sharedWithUserId);
  const users = await User.find({ _id: { $in: userIds } })
    .select("_id email name")
    .lean();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const results = shares.map((share) => {
    const user = userMap.get(share.sharedWithUserId.toString());
    return {
      id: share._id,
      sharedWithUserId: share.sharedWithUserId,
      sharedWithEmail: user?.email || "Unknown",
      sharedWithName: user?.name || "Unknown",
      permission: share.permission,
      sharedAt: share.createdAt,
    };
  });

  return results;
};

export const updateFileSharePermission = async (
  shareId,
  ownerId,
  newPermission,
) => {
  const share = await FileShare.findOne({ _id: shareId, ownerId });
  if (!share) {
    throw {
      status: 404,
      message: "Share not found or you don't have permission",
    };
  }

  share.permission = newPermission;
  await share.save();

  return {
    id: share._id,
    fileId: share.fileId,
    sharedWithUserId: share.sharedWithUserId,
    permission: share.permission,
    updatedAt: share.updatedAt,
  };
};

export const removeFileShare = async (shareId, ownerId) => {
  const share = await FileShare.findOne({ _id: shareId, ownerId });
  if (!share) {
    throw {
      status: 404,
      message: "Share not found or you don't have permission",
    };
  }

  await FileShare.deleteOne({ _id: shareId });

  return { message: "Share removed successfully" };
};

export const checkFileAccess = async (fileId, userId) => {
  const file = await File.findOne({ _id: fileId, isDeleted: false });
  if (!file) {
    return null;
  }

  if (file.userId.toString() === userId.toString()) {
    return { hasAccess: true, permission: "EDIT", isOwner: true };
  }

  const share = await FileShare.findOne({ fileId, sharedWithUserId: userId });
  if (share) {
    return { hasAccess: true, permission: share.permission, isOwner: false };
  }

  return { hasAccess: false };
};
