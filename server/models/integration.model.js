import mongoose, { Schema } from "mongoose";

const IntegrationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["google_drive", "dropbox", "one_drive"],
      required: true,
      index: true,
    },

    providerUserId: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
      select: false,
    },

    scopes: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["connected", "disconnected", "error"],
      default: "connected",
      index: true,
    },

    lastTokenRefreshAt: {
      type: Date,
    },

    lastError: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

IntegrationSchema.index(
  { userId: 1, provider: 1, providerUserId: 1 },
  { unique: true },
);

const Integration = mongoose.model("Integration", IntegrationSchema);
export default Integration;
