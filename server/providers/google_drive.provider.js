import axios from "axios";
import Integration from "../models/integration.model.js";

export const getAccessToken = async (userId) => {
  const integration = await Integration.findOne({
    userId,
    provider: "google_drive",
  }).select("+refreshToken");

  if (!integration) {
    throw new Error("Google Drive not connected");
  }
  console.log("Integration found:", integration);
  console.log("Refresh token:", integration.refreshToken);
  console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: integration.refreshToken,
    grant_type: "refresh_token",
  });

  return response.data.access_token;
};

export const listDriveItemsProvider = async (accessToken, parentId = null) => {
  const query = parentId
    ? `'${parentId}' in parents and trashed = false`
    : `'root' in parents and trashed = false`;

  const response = await axios.get(
    "https://www.googleapis.com/drive/v3/files",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: query,
        fields: "files(id,name,mimeType,size,modifiedTime)",
        pageSize: 1000,
      },
    },
  );

  return response.data.files;
};

export const getDriveFileMetadata = async (accessToken, fileId) => {
  const response = await axios.get(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { fields: "id,name,mimeType,size,modifiedTime" },
    },
  );
  return response.data;
};

export const downloadDriveFileStream = async (accessToken, fileId) => {
  const response = await axios.get(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "stream",
    },
  );
  return response.data;
};
