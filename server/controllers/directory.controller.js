import { rm } from "fs/promises";
import redisClient from "../config/redis.js";
import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";
import Trash from "../models/trash.model.js";
import { deleteCacheByPattern } from "../utils/cache.util.js";
import { buildCacheKey, collectionQuery } from "../utils/collectionQuery.js";

const CACHE_TTL_24H = 86400;
const DIRECTORY_CACHE_KEY = (userId, dirId, params) =>
  buildCacheKey(`directory:${userId}:${dirId}`, params);

export const getDirectory = async (req, res) => {
  const user = req.user;
  console.log("User Root ID:", user.rootDirId.toString());
  const _id = req.params.id || user.rootDirId.toString();
  const userId = user._id.toString();

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const sortField = req.query.sort || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;
  const fileType = req.query.fileType;

  const cacheParams = {
    page,
    limit,
    sort: { [sortField]: sortOrder },
    filter: fileType,
  };
  const cacheKey = DIRECTORY_CACHE_KEY(userId, _id, cacheParams);

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const directoryData = await Directory.findOne({ _id }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const fileFilter = { parentDirId: directoryData._id };
  if (fileType) {
    fileFilter.extension = fileType;
  }

  const allowedFileSortFields = ["name", "createdAt", "updatedAt", "size"];
  const allowedDirSortFields = ["name", "createdAt", "updatedAt"];
  const fileSortField = allowedFileSortFields.includes(sortField)
    ? sortField
    : "createdAt";
  const dirSortField = allowedDirSortFields.includes(sortField)
    ? sortField
    : "createdAt";

  const [filesResult, directoriesResult] = await Promise.all([
    collectionQuery(File, {
      filter: fileFilter,
      page,
      limit,
      sort: { [fileSortField]: sortOrder },
    }),
    collectionQuery(Directory, {
      filter: { parentDirId: _id },
      page,
      limit,
      sort: { [dirSortField]: sortOrder },
    }),
  ]);

  const response = {
    ...directoryData,
    files: filesResult.data.map((file) => ({ ...file, id: file._id })),
    directories: directoriesResult.data.map((dir) => ({ ...dir, id: dir._id })),
    filesSummary: filesResult.summary,
    directoriesSummary: directoriesResult.summary,
  };

  await redisClient.setEx(cacheKey, CACHE_TTL_24H, JSON.stringify(response));
  return res.status(200).json(response);
};

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId || user.rootDirId.toString();
  const dirname = req.headers.dirname || "New Folder";

  try {
    const parentDir = await Directory.findOne({
      _id: parentDirId,
    }).lean();

    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    const isDirNameExist = await Directory.findOne({
      name: dirname,
      parentDirId,
    }).lean();

    if (isDirNameExist)
      return res
        .status(400)
        .json({ message: "Directory name already exists!" });

    const newDir = await Directory.create({
      name: dirname,
      parentDirId,
      userId: user._id,
      path: [...(parentDir.path || []), parentDirId],
    });

    const userId = user._id.toString();
    await redisClient.del(`breadcrumb:${user._id}:${parentDirId}`);
    await deleteCacheByPattern(`directory:${userId}:*`);

    return res.status(201).json({
      message: "Directory Created!",
      directory: newDir,
    });
  } catch (err) {
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else {
      next(err);
    }
  }
};

export const renameDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;

  if (!newDirName || !newDirName.trim()) {
    return res
      .status(400)
      .json({ message: "Please enter a valid directory name!" });
  }

  try {
    const currentDir = await Directory.findOne({
      _id: id,
      userId: user._id,
    }).lean();
    if (!currentDir) {
      return res.status(404).json({ message: "Directory not found!" });
    }

    // Check if sibling with same name already exists (excluding the current one)
    const isDirNameExist = await Directory.findOne({
      name: newDirName,
      parentDirId: currentDir.parentDirId,
      userId: user._id,
      _id: { $ne: id },
    }).lean();

    if (isDirNameExist) {
      return res.status(400).json({
        message: "A folder with this name already exists in the same location!",
      });
    }

    await Directory.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      { name: newDirName },
    );

    const userId = user._id.toString();
    await deleteCacheByPattern(`directory:${userId}:*`);
    await redisClient.del(`breadcrumb:${user._id}:${id}`);

    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const isDirExists = await Directory.findOne({
      _id: id,
      userId: user._id,
    }).lean();

    if (!isDirExists) {
      return res.status(404).json({ message: "Directory not found!" });
    }

    async function getDirectoryContents(dirId) {
      let directories = await Directory.find({ parentDirId: dirId })
        .lean()
        .select("id name");
      let files = await File.find({ parentDirId: dirId })
        .lean()
        .select("id name extension");

      for (const { _id, name } of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirectoryContents(_id);

        files = files.concat(childFiles);
        directories = directories.concat(childDirectories);
      }

      return { directories, files };
    }

    const { directories, files } = await getDirectoryContents(id);

    for (const { _id, extension } of files) {
      await rm(`${process.cwd()}/storage/${_id.toString()}${extension}`);
    }

    await Trash.deleteMany({ _id: { $in: files.map((file) => file._id) } });

    await Directory.deleteMany({
      _id: { $in: [...directories.map((dir) => dir._id), id] },
    });
    await File.deleteMany({ _id: { $in: files.map((file) => file._id) } });

    const userId = user._id.toString();
    await redisClient.del(`breadcrumb:${user._id}:${id}`);
    await deleteCacheByPattern(`directory:${userId}:*`);
    await deleteCacheByPattern(`user:storage:${userId}`);
    await deleteCacheByPattern(`file:*:${userId}*`);

    for (const { _id } of directories) {
      await redisClient.del(`breadcrumb:${user._id}:${_id}`);
    }
    return res.status(200).json({ message: "Directory Deleted!" });
  } catch (error) {
    next(error);
  }
};
// get breadcrumb path
export const getBreadcrumbPath = async (req, res, next) => {
  const { dirId } = req.params;
  const user = req.user;

  try {
    const cacheKey = `breadcrumb:${user._id}:${dirId}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json({ path: JSON.parse(cached), cached: true });
    }

    const directory = await Directory.findOne({
      _id: dirId,
      userId: user._id,
    }).lean();

    if (!directory) {
      return res.status(404).json({ message: "Directory not found!" });
    }

    const pathDirs = await Directory.find({
      _id: { $in: directory.path },
    })
      .lean()
      .select("name _id");

    const sortedPath = directory.path.map((pathId) =>
      pathDirs.find((dir) => dir._id.toString() === pathId.toString()),
    );

    sortedPath.push({
      _id: directory._id,
      name: directory.name,
    });

    await redisClient.set(cacheKey, JSON.stringify(sortedPath), {
      EX: 60 * 60,
    });

    return res.status(200).json({ path: sortedPath, cached: false });
  } catch (error) {
    next(error);
  }
};
