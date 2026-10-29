import pool from '../config/db.js';

export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id, username, password_hash, role, display_name FROM users WHERE username = ? LIMIT 1',
    [username],
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, username, role, display_name, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function listUsers() {
  const [rows] = await pool.query(
    'SELECT id, username, role, display_name, created_at, updated_at FROM users ORDER BY id ASC',
  );
  return rows;
}

export async function createUser({ username, passwordHash, role, displayName }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)',
    [username, passwordHash, role, displayName],
  );
  return findUserById(result.insertId);
}

export async function updateUser(id, fields) {
  const allowed = ['username', 'role', 'display_name', 'password_hash'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, values);
  return findUserById(id);
}

export async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}
