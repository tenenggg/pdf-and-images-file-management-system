import * as folderModel from '../models/folderModel.js';
import { purgeFileStorage } from './fileController.js';

function mapPathSegment(folder) {
  return { id: folder.id, name: folder.name };
}

export async function getTree(req, res, next) {
  try {
    const tree = await folderModel.getNavTree(req.user?.id);
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

    const resolvedParentId =
      parentId !== undefined && parentId !== null && Number.isInteger(Number(parentId)) && Number(parentId) > 0
        ? Number(parentId)
        : null;

    if (resolvedParentId === null && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create top-level root folders' });
    }

    const folder = await folderModel.createFolder({
      name: name.trim(),
      parentId: resolvedParentId,
      ownerId: req.user.id,
      navKey: resolvedParentId === null && name.trim().toLowerCase() === 'my files' ? 'my-files' : null,
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

    const target = await folderModel.getFolderById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const folder = await folderModel.renameFolder(req.params.id, name.trim());
    res.json({ folder });
  } catch (err) {
    next(err);
  }
}

export async function deleteFolder(req, res, next) {
  try {
    const target = await folderModel.getFolderById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Folder not found' });
    }

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
