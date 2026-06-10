import { model, Schema } from "mongoose";

const trashSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
    },
    parentDirName: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: "throw",
  }
);

const Trash = model("Trash", trashSchema);
export default Trash;
