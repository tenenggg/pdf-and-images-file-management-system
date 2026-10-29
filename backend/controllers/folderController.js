import * as folderModel from '../models/folderModel.js';
import { purgeFileStorage } from './fileController.js';

function mapPathSegment(folder) {
  return { id: folder.id, name: folder.name };
}

export async function getTree(req, res, next) {
  try {
    const tree = await folderModel.getNavTree();
    res.json({ tree });
  } catch (err) {
    next(err);
  }
}

export async function getContents(req, res, next) {
  try {
    const folderId = req.params.id;
    const folder = await folderModel.getFolderById(folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const path = await folderModel.getFolderPath(folderId);
    const items = await folderModel.listFolderContents(folderId);

    res.json({
      folder: { id: folder.id, name: folder.name, parentId: folder.parent_id },
      path: path.map(mapPathSegment),
      items,
    });
  } catch (err) {
    next(err);
  }
}

export async function createFolder(req, res, next) {
  try {
    const { name, parentId } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }
    if (!Number.isInteger(Number(parentId)) || Number(parentId) <= 0) {
      return res.status(400).json({ message: 'parentId is required' });
    }

    const folder = await folderModel.createFolder({
      name: name.trim(),
      parentId,
      ownerId: req.user.id,
    });

    res.status(201).json({ folder });
  } catch (err) {
    next(err);
  }
}

export async function renameFolder(req, res, next) {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const folder = await folderModel.renameFolder(req.params.id, name.trim());
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json({ folder });
  } catch (err) {
    next(err);
  }
}

export async function deleteFolder(req, res, next) {
  try {
    const storageKeys = await folderModel.softDeleteFolder(req.params.id);
    // Delete all physical files from disk
    await Promise.all(storageKeys.map((key) => purgeFileStorage(key)));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function moveFolder(req, res, next) {
  try {
    const { targetFolderId } = req.body;
    const folder = await folderModel.moveFolder(req.params.id, targetFolderId);
    res.json({ folder });
  } catch (err) {
    next(err);
  }
}
