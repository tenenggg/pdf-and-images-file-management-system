import pool from '../config/db.js';

export async function getFolderById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, parent_id, owner_id, nav_key FROM folders WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function getFolderPath(folderId) {
  const segments = [];
  let currentId = folderId;

  while (currentId) {
    const folder = await getFolderById(currentId);
    if (!folder) break;
    segments.unshift(folder);
    currentId = folder.parent_id;
  }

  return segments;
}

export async function listFolderContents(folderId) {
  const [folders] = await pool.query(
    `SELECT id, name, 'folder' AS type, created_at, updated_at
     FROM folders
     WHERE parent_id = ? AND deleted_at IS NULL
     ORDER BY name ASC`,
    [folderId],
  );

  const [files] = await pool.query(
    `SELECT f.id, f.name, 'file' AS type, f.mime_type, f.size,
            f.created_at, f.updated_at, u.display_name AS creator
     FROM files f
     JOIN users u ON u.id = f.created_by
     WHERE f.folder_id = ? AND f.deleted_at IS NULL
     ORDER BY f.name ASC`,
    [folderId],
  );

  const mapFolder = (row) => ({
    id: row.id,
    type: 'folder',
    name: row.name,
    dateCreated: row.created_at,
    dateModified: row.updated_at,
  });

  const mapFile = (row) => {
    const ext = row.name.includes('.') ? row.name.split('.').pop().toLowerCase() : '';
    return {
      id: row.id,
      type: 'file',
      name: row.name,
      ext,
      mimeType: row.mime_type,
      size: row.size,
      dateCreated: row.created_at,
      dateModified: row.updated_at,
      creator: row.creator,
    };
  };

  return [...folders.map(mapFolder), ...files.map(mapFile)];
}

export async function ensureRootFolder(userId = null) {
  // 1. Check if a root folder with nav_key = 'my-files' exists
  const [existingMyFiles] = await pool.query(
    "SELECT id, name, parent_id, nav_key FROM folders WHERE parent_id IS NULL AND nav_key = 'my-files' AND deleted_at IS NULL LIMIT 1"
  );
  if (existingMyFiles.length > 0) {
    return existingMyFiles[0];
  }

  // 2. Check if any root folder named 'My Files' exists
  const [existingByName] = await pool.query(
    "SELECT id, name, parent_id, nav_key FROM folders WHERE parent_id IS NULL AND LOWER(name) = 'my files' AND deleted_at IS NULL LIMIT 1"
  );
  if (existingByName.length > 0) {
    await pool.query("UPDATE folders SET nav_key = 'my-files' WHERE id = ?", [existingByName[0].id]);
    existingByName[0].nav_key = 'my-files';
    return existingByName[0];
  }

  // 3. Check if any root folder exists at all
  const [anyRoot] = await pool.query(
    "SELECT id, name, parent_id, nav_key FROM folders WHERE parent_id IS NULL AND deleted_at IS NULL LIMIT 1"
  );
  if (anyRoot.length > 0) {
    if (!anyRoot[0].nav_key) {
      await pool.query("UPDATE folders SET nav_key = 'my-files' WHERE id = ?", [anyRoot[0].id]);
      anyRoot[0].nav_key = 'my-files';
    }
    return anyRoot[0];
  }

  // 4. Create root 'My Files' folder if none exists
  let ownerId = userId;
  if (!ownerId) {
    const [adminUser] = await pool.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
    ownerId = adminUser[0]?.id;
  }
  if (!ownerId) {
    const [anyUser] = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
    ownerId = anyUser[0]?.id;
  }

  if (!ownerId) {
    return null;
  }

  const [insertRes] = await pool.query(
    "INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES ('My Files', NULL, ?, 'my-files')",
    [ownerId]
  );
  const rootId = insertRes.insertId;

  // Create default subfolders under 'My Files'
  await pool.query(
    "INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, ?, ?, ?), (?, ?, ?, ?)",
    ['Documents', rootId, ownerId, 'documents', 'Images', rootId, ownerId, 'images']
  );

  return { id: rootId, name: 'My Files', parent_id: null, nav_key: 'my-files' };
}

export async function getNavTree() {
  const [rows] = await pool.query(
    `SELECT id, name, parent_id, nav_key FROM folders
     WHERE deleted_at IS NULL
     ORDER BY parent_id IS NOT NULL ASC,
       FIELD(nav_key, 'my-files', 'videos', 'music', 'images', 'scenario'),
       name ASC`,
  );

  const nodes = new Map(
    rows.map((row) => [row.id, {
      id: row.parent_id ? `folder-${row.id}` : `root-${row.nav_key ?? row.id}`,
      name: row.name,
      folderId: row.id,
      navKey: row.nav_key,
      children: [],
    }]),
  );
  const [files] = await pool.query(
    `SELECT id, name, mime_type, size, folder_id, created_at, updated_at
     FROM files
     WHERE deleted_at IS NULL
     ORDER BY name ASC`,
  );
  const tree = [];

  for (const row of rows) {
    const node = nodes.get(row.id);
    if (row.parent_id && nodes.has(row.parent_id)) {
      nodes.get(row.parent_id).children.push(node);
    } else if (!row.parent_id) {
      tree.push(node);
    }
  }

  for (const file of files) {
    const parent = nodes.get(file.folder_id);
    if (parent) {
      parent.children.push({
        id: `file-${file.id}`,
        fileId: file.id,
        folderId: file.folder_id,
        name: file.name,
        type: 'file',
        mimeType: file.mime_type,
        size: file.size,
        dateCreated: file.created_at,
        dateModified: file.updated_at,
        children: [],
      });
    }
  }

  return tree;
}

export async function createFolder({ name, parentId, ownerId, navKey = null }) {
  const [result] = await pool.query(
    'INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, ?, ?, ?)',
    [name, parentId, ownerId, navKey],
  );
  return getFolderById(result.insertId);
}

export async function renameFolder(id, name) {
  await pool.query('UPDATE folders SET name = ? WHERE id = ? AND deleted_at IS NULL', [name, id]);
  return getFolderById(id);
}

export async function softDeleteFolder(id) {
  // Recursively collect all subfolder IDs
  async function collectSubfolderIds(folderId) {
    const [rows] = await pool.query(
      'SELECT id FROM folders WHERE parent_id = ?',
      [folderId],
    );
    let ids = [folderId];
    for (const row of rows) {
      ids = ids.concat(await collectSubfolderIds(row.id));
    }
    return ids;
  }

  const allFolderIds = await collectSubfolderIds(id);

  if (allFolderIds.length > 0) {
    const placeholders = allFolderIds.map(() => '?').join(',');

    // Grab storage keys before deleting so caller can purge from disk
    const [fileRows] = await pool.query(
      `SELECT storage_key FROM files WHERE folder_id IN (${placeholders})`,
      allFolderIds,
    );
    const storageKeys = fileRows.map((r) => r.storage_key);

    await pool.query(`DELETE FROM files WHERE folder_id IN (${placeholders})`, allFolderIds);
    await pool.query(`DELETE FROM folders WHERE id IN (${placeholders})`, allFolderIds);

    return storageKeys;
  }

  return [];
}

export async function moveFolder(id, targetParentId) {
  await pool.query('UPDATE folders SET parent_id = ? WHERE id = ?', [targetParentId, id]);
  return getFolderById(id);
}

export async function searchFolders(query) {
  const like = `%${query}%`;
  const [rows] = await pool.query(
    `SELECT id, name, parent_id FROM folders
     WHERE deleted_at IS NULL AND name LIKE ?
     ORDER BY name ASC LIMIT 50`,
    [like],
  );
  return rows;
}
