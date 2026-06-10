import { Schema, model } from "mongoose";

const fileShareSchema = new Schema(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    sharedWithUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    permission: {
      type: String,
      enum: ["VIEW", "EDIT"],
      default: "VIEW",
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

export default model("FileShare", fileShareSchema);
