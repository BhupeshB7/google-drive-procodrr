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
        path: [{
            type: Schema.Types.ObjectId,
            ref: "Directory"
        }]
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const Directory = model("Directory", directorySchema);

export default Directory;
