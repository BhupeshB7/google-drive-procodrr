import axios from "axios";
import path from "path";
import querystring from "querystring";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import Integration from "../models/integration.model.js";
import File from "../models/file.model.js";
import Directory from "../models/directory.model.js";

import { s3Client } from "../config/s3.js";
import {
  getAccessToken,
  listDriveItemsProvider,
  getDriveFileMetadata,
  downloadDriveFileStream,
} from "../providers/google_drive.provider.js";

const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";

export const connectGoogleDrive = async (req, res) => {
  const params = querystring.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.readonly",
    access_type: "offline",
    prompt: "consent",
    state: req.user._id.toString(),
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

export const googleDriveCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
    );

    const refreshToken = tokenResponse.data.refresh_token;

    await Integration.findOneAndUpdate(
      { userId: state, provider: "google_drive" },
      {
        refreshToken,
        provider: "google_drive",
        providerUserId: state,
        status: "connected",
        lastTokenRefreshAt: new Date(),
      },
      { upsert: true, new: true },
    );

    res.send(`
      <html>
        <body>
          <script>window.close();</script>
          <p>Connected! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

export const getGoogleDriveStatus = async (req, res, next) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user._id,
      provider: "google_drive",
    });

    if (!integration) {
      return res.json({ connected: false });
    }

    res.json({ connected: integration.status === "connected" });
  } catch (error) {
    next(error);
  }
};

export const listDriveItems = async (req, res, next) => {
  try {
    const parentId = req.query.parentId || null;
    const accessToken = await getAccessToken(req.user._id);
    const items = await listDriveItemsProvider(accessToken, parentId);

    const formatted = items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.mimeType === GOOGLE_FOLDER_MIME ? "folder" : "file",
      mimeType: item.mimeType,
      size: item.size ? parseInt(item.size) : 0,
      modifiedTime: item.modifiedTime,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const importDriveFiles = async (req, res, next) => {
  try {
    const { driveItemIds } = req.body;

    if (!Array.isArray(driveItemIds) || driveItemIds.length === 0) {
      return res.status(400).json({ error: "No Drive item IDs provided" });
    }

    const integration = await Integration.findOne({
      userId: req.user._id,
      provider: "google_drive",
    });

    if (!integration || integration.status !== "connected") {
      return res.status(400).json({ error: "Google Drive is not connected" });
    }

    const accessToken = await getAccessToken(req.user._id);

    let googleDriveRootDir = await Directory.findOne({
      userId: req.user._id,
      source: "google_drive",
      parentDirId: req.user.rootDirId,
    });

    if (!googleDriveRootDir) {
      googleDriveRootDir = await Directory.create({
        name: "Google Drive",
        parentDirId: req.user.rootDirId,
        userId: req.user._id,
        path: [req.user.rootDirId.toString()],
        source: "google_drive",
      });
    }

    const stats = { filesImported: 0, foldersCreated: 0, errors: [] };

    async function importFolder(driveFolderId, dbParentDirId, parentPath) {
      const items = await listDriveItemsProvider(accessToken, driveFolderId);

      for (const item of items) {
        if (item.mimeType === GOOGLE_FOLDER_MIME) {
          let existingDir = await Directory.findOne({
            name: item.name,
            parentDirId: dbParentDirId,
            userId: req.user._id,
          });

          if (!existingDir) {
            existingDir = await Directory.create({
              name: item.name,
              parentDirId: dbParentDirId,
              userId: req.user._id,
              path: [...parentPath, dbParentDirId.toString()],
              source: "google_drive",
              providerDirId: item.id,
            });
            stats.foldersCreated++;
          }

          await importFolder(item.id, existingDir._id, [
            ...parentPath,
            dbParentDirId.toString(),
          ]);
        } else {
          await importFile(item.id, dbParentDirId);
        }
      }
    }

    async function importFile(driveFileId, dbParentDirId) {
      try {
        const metadata = await getDriveFileMetadata(accessToken, driveFileId);

        if (metadata.mimeType.startsWith("application/vnd.google-apps.")) {
          stats.errors.push({
            name: metadata.name,
            reason: "Google Workspace files are not supported",
          });
          return;
        }

        const extension = path.extname(metadata.name) || "";
        const fileSize = metadata.size ? parseInt(metadata.size) : 0;

        const insertedFile = await File.create({
          name: metadata.name,
          extension,
          size: fileSize,
          parentDirId: dbParentDirId,
          userId: req.user._id,
          isUploading: true,
        });

        const fileStream = await downloadDriveFileStream(
          accessToken,
          driveFileId,
        );

        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${insertedFile._id}${extension}`,
            Body: fileStream,
            ContentType: metadata.mimeType,
          }),
        );

        insertedFile.isUploading = false;
        await insertedFile.save();

        stats.filesImported++;
      } catch (err) {
        stats.errors.push({ id: driveFileId, reason: err.message });
      }
    }

    for (const driveItemId of driveItemIds) {
      const metadata = await getDriveFileMetadata(accessToken, driveItemId);

      if (metadata.mimeType === GOOGLE_FOLDER_MIME) {
        let existingDir = await Directory.findOne({
          name: metadata.name,
          parentDirId: googleDriveRootDir._id,
          userId: req.user._id,
        });

        if (!existingDir) {
          existingDir = await Directory.create({
            name: metadata.name,
            parentDirId: googleDriveRootDir._id,
            userId: req.user._id,
            path: [
              ...(googleDriveRootDir.path || []),
              googleDriveRootDir._id.toString(),
            ],
            source: "google_drive",
            providerDirId: driveItemId,
          });
          stats.foldersCreated++;
        }

        await importFolder(driveItemId, existingDir._id, [
          ...(googleDriveRootDir.path || []),
          googleDriveRootDir._id.toString(),
        ]);
      } else {
        await importFile(driveItemId, googleDriveRootDir._id);
      }
    }

    res.json({
      message: "Import completed",
      filesImported: stats.filesImported,
      foldersCreated: stats.foldersCreated,
      errors: stats.errors,
      driveDirId: googleDriveRootDir._id,
    });
  } catch (error) {
    next(error);
  }
};

export const disconnectGoogleDrive = async (req, res, next) => {
  try {
    await Integration.deleteOne({
      userId: req.user._id,
      provider: "google_drive",
    });

    res.json({ message: "Google Drive disconnected successfully" });
  } catch (error) {
    next(error);
  }
};
