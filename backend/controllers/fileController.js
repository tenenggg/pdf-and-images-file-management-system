import fs from 'fs/promises';
import path from 'path';
import * as fileModel from '../models/fileModel.js';
import * as folderModel from '../models/folderModel.js';
import { env } from '../config/env.js';
import { extractText } from '../utils/textExtractor.js';

export async function uploadFiles(req, res, next) {
  try {
    const folderId = Number(req.body.folderId);
    if (!folderId) {
      return res.status(400).json({ message: 'folderId is required' });
    }

    const uploaded = [];
    for (const file of req.files ?? []) {
      const contentText = await extractText(file.path, file.mimetype);

      const record = await fileModel.createFile({
        name: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey: path.basename(file.path),
        folderId,
        ownerId: req.user.id,
        createdBy: req.user.id,
        contentText,
      });
      uploaded.push(record);
    }

    res.status(201).json({ files: uploaded });
  } catch (err) {
    next(err);
  }
}

export async function downloadFile(req, res, next) {
  try {
    const file = await fileModel.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const absolutePath = path.join(env.uploadDir, file.storage_key);
    res.download(absolutePath, file.original_name);
  } catch (err) {
    next(err);
  }
}

export async function previewFile(req, res, next) {
  try {
    const file = await fileModel.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const absolutePath = path.join(env.uploadDir, file.storage_key);
    res.type(file.mime_type);
    res.sendFile(absolutePath);
  } catch (err) {
    next(err);
  }
}

export async function renameFile(req, res, next) {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'File name is required' });
    }

    const file = await fileModel.renameFile(req.params.id, name.trim());
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ file });
  } catch (err) {
    next(err);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const file = await fileModel.getFileById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    await fileModel.softDeleteFile(req.params.id);
    // Also delete the physical file from disk
    await purgeFileStorage(file.storage_key);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function moveFile(req, res, next) {
  try {
    const { targetFolderId } = req.body;
    const file = await fileModel.moveFile(req.params.id, targetFolderId);
    res.json({ file });
  } catch (err) {
    next(err);
  }
}

export async function searchFiles(req, res, next) {
  try {
    const items = await fileModel.searchFiles({
      query: req.query.q,
      contentQuery: req.query.content,
      mimeType: req.query.mimeType,
      creator: req.query.creator,
      createdFrom: req.query.createdFrom,
      createdTo: req.query.createdTo,
      modifiedFrom: req.query.modifiedFrom,
      modifiedTo: req.query.modifiedTo,
    });
    const uniqueItems = [...new Map(items.map((item) => [item.id, item])).values()];
    const enrichedItems = await Promise.all(
      uniqueItems.map(async (item) => ({
        ...item,
        folderPath: (await folderModel.getFolderPath(item.folderId)).map((folder) => ({
          id: folder.id,
          name: folder.name,
        })),
      })),
    );
    res.json({ items: enrichedItems });
  } catch (err) {
    next(err);
  }
}

export async function getFileMeta(req, res, next) {
  try {
    const file = await fileModel.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json({
      file: {
        id: file.id,
        name: file.name,
        mimeType: file.mime_type,
        size: file.size,
        folderId: file.folder_id,
        creator: file.creator_name,
        dateCreated: file.created_at,
        dateModified: file.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** Remove physical file after DB delete (optional cleanup job). */
export async function purgeFileStorage(storageKey) {
  try {
    await fs.unlink(path.join(env.uploadDir, storageKey));
  } catch {
    /* ignore missing files */
  }
}
