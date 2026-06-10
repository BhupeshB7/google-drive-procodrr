import { model, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 0,
    },
    shareToken: {
      type: String,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
      index: true,
    },
    isUploading: {
      type: Schema.Types.Boolean,
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const File = model("File", fileSchema);
export default File;
