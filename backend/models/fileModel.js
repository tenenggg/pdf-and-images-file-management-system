import pool from '../config/db.js';

export async function getFileById(id) {
  const [rows] = await pool.query(
    `SELECT f.*, u.display_name AS creator_name
     FROM files f
     JOIN users u ON u.id = f.created_by
     WHERE f.id = ? AND f.deleted_at IS NULL LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createFile(record) {
  const [result] = await pool.query(
    `INSERT INTO files
      (name, original_name, mime_type, size, storage_key, folder_id, owner_id, created_by, content_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.name,
      record.originalName,
      record.mimeType,
      record.size,
      record.storageKey,
      record.folderId,
      record.ownerId,
      record.createdBy,
      record.contentText || null,
    ],
  );
  return getFileById(result.insertId);
}

export async function renameFile(id, name) {
  await pool.query('UPDATE files SET name = ? WHERE id = ? AND deleted_at IS NULL', [name, id]);
  return getFileById(id);
}

export async function softDeleteFile(id) {
  await pool.query('DELETE FROM files WHERE id = ?', [id]);
}

export async function moveFile(id, targetFolderId) {
  await pool.query('UPDATE files SET folder_id = ? WHERE id = ?', [targetFolderId, id]);
  return getFileById(id);
}

export async function searchFiles({ query, contentQuery, mimeType, creator, createdFrom, createdTo, modifiedFrom, modifiedTo }) {
  const conditions = ['f.deleted_at IS NULL'];
  const params = [];

  if (query) {
    conditions.push('f.name LIKE ?');
    params.push(`%${query}%`);
  }
  if (contentQuery) {
    conditions.push('f.content_text LIKE ?');
    params.push(`%${contentQuery}%`);
  }
  if (mimeType) {
    conditions.push('f.mime_type LIKE ?');
    params.push(`%${mimeType}%`);
  }
  if (creator) {
    conditions.push('u.display_name LIKE ?');
    params.push(`%${creator}%`);
  }
  if (createdFrom) {
    conditions.push('f.created_at >= ?');
    params.push(createdFrom);
  }
  if (createdTo) {
    conditions.push('f.created_at <= ?');
    params.push(createdTo);
  }
  if (modifiedFrom) {
    conditions.push('f.updated_at >= ?');
    params.push(modifiedFrom);
  }
  if (modifiedTo) {
    conditions.push('f.updated_at <= ?');
    params.push(modifiedTo);
  }

  const [rows] = await pool.query(
    `SELECT f.id, f.name, f.mime_type, f.size, f.folder_id,
            f.created_at, f.updated_at, u.display_name AS creator
     FROM files f
     JOIN users u ON u.id = f.created_by
     WHERE ${conditions.join(' AND ')}
     ORDER BY f.updated_at DESC
     LIMIT 100`,
    params,
  );

  return rows.map((row) => ({
    id: row.id,
    type: 'file',
    name: row.name,
    ext: row.name.includes('.') ? row.name.split('.').pop().toLowerCase() : '',
    mimeType: row.mime_type,
    size: row.size,
    folderId: row.folder_id,
    dateCreated: row.created_at,
    dateModified: row.updated_at,
    creator: row.creator,
  }));
}
