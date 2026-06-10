import { model, Schema } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Directory",
    },
    size: {
      type: Number,
      required: true,
      default: 0,
    },
    path: [
      {
        type: Schema.Types.ObjectId,
        ref: "Directory",
      },
    ],
    source: {
      type: String,
      enum: ["local", "google_drive"],
      default: "local",
    },
    providerDirId: {
      type: String,
      default: null,
    },
  },
  {
    strict: "throw",
    timestamps: true,
  },
);

const Directory = model("Directory", directorySchema);

export default Directory;
