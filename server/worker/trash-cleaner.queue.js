import { Queue, Worker } from "bullmq";
import moment from "moment-timezone";
import Trash from "../models/trash.model.js";
import File from "../models/file.model.js";
import { deleteS3File } from "../config/s3.js";
import { ESSENTIAL_Q_OPTIONS } from "../const/essential-q-option.const.js";

const redisConnectionOptions = {
  maxRetriesPerRequest: null,
};

export const trashCleanupQueue = new Queue("trashCleanupQueue", {
  connection: redisConnectionOptions,
});

export const scheduleTrashCleanup = async () => {
  await trashCleanupQueue.add(
    "cleanupTrash",
    {},
    {
      jobId: "trashCleanupDaily",
      repeat: {
        pattern: "* 3 * * * *", // Every day at 3 AM
        tz: "Asia/Kolkata",
      },
      ...ESSENTIAL_Q_OPTIONS,
    }
  );
};

const cleanupExpiredTrash = async () => {
  const expiryDate = moment()
    .tz("Asia/Kolkata")
    .subtract(30, "days")
    .toDate();

  const expiredTrashItems = await Trash.find({
    createdAt: { $lte: expiryDate },
  });

  for (const trash of expiredTrashItems) {
    const file = await File.findById(trash.fileId);

    if (!file) {
      await Trash.deleteOne({ _id: trash._id });
      continue;
    }

    if (file.storageKey) {
      await deleteS3File(file.storageKey);
    }

    await File.deleteOne({ _id: file._id });
    await Trash.deleteOne({ _id: trash._id });
  }

  return { deleted: expiredTrashItems.length };
};


export const trashCleanupWorker = new Worker(
  "trashCleanupQueue",
  async () => {
    return await cleanupExpiredTrash();
  },
  {
    connection: redisConnectionOptions,
  }
);

trashCleanupWorker.on("active", (job) => {
  console.log("Trash Cleanup Worker Running:", job.id);
});

trashCleanupWorker.on("completed", (job, result) => {
  console.log("Trash Cleanup Completed:", {
    jobId: job.id,
    result,
  });
});

trashCleanupWorker.on("failed", (job, err) => {
  console.error("Trash Cleanup Worker Job Failed:", {
    jobId: job?.id,
    error: err.message,
  });
});
