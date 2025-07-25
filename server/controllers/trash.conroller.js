import { rm } from "fs/promises";
import Trash from "../models/trash.model.js";
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

    // Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "recent";

    const skip = (page - 1) * limit;

    // Sorting logic
    let sortQuery = {};
    if (sortBy === "name") {
      sortQuery = { name: 1 };
    } else {
      sortQuery = { createdAt: -1 };
    }

    // Fetch total count
    const totalFiles = await Trash.countDocuments({
      userId,
    });

    const trashFiles = await Trash.find({
      userId,
    })
      .collation({ locale: "en", strength: 1 })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total: totalFiles,
      page,
      pages: Math.ceil(totalFiles / limit),
      data: trashFiles,
    });
  } catch (error) {
    next(error);
  }
};
