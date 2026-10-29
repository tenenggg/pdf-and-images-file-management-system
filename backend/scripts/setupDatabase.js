import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    multipleStatements: true,
  });

  await connection.query(schemaSql);

  const dbName = process.env.DB_NAME ?? 'file_management_system';
  await connection.query(`USE \`${dbName}\``);

  const [users] = await connection.query('SELECT COUNT(*) AS count FROM users');
  if (users[0].count === 0) {
    const adminHash = await bcrypt.hash('admin', 10);
    const viewerHash = await bcrypt.hash('viewer', 10);

    await connection.query(
      'INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      ['admin', adminHash, 'admin', 'Admin', 'viewer', viewerHash, 'user', 'Viewer'],
    );

    const [adminRow] = await connection.query('SELECT id FROM users WHERE username = ?', ['admin']);
    const adminId = adminRow[0].id;

    const [myFiles] = await connection.query(
      'INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, NULL, ?, ?)',
      ['My Files', adminId, 'my-files'],
    );
    const myFilesId = myFiles.insertId;

    const insertRoot = async (name, key, parentId = null) => {
      const [result] = await connection.query(
        'INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, ?, ?, ?)',
        [name, parentId, adminId, key],
      );
      return result.insertId;
    };

    const videosId = await insertRoot('Videos', 'videos', myFilesId);
    const musicId = await insertRoot('Music', 'music', myFilesId);
    const imagesId = await insertRoot('Images', 'images', myFilesId);

    await connection.query(
      'INSERT INTO folders (name, parent_id, owner_id) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
      ['video 1', videosId, adminId, 'video 2', videosId, adminId, 'work 1', videosId, adminId],
    );

    const [scenarioInner] = await connection.query(
      'INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, ?, ?, ?)',
      ['Scenario', imagesId, adminId, 'scenario'],
    );
    const scenarioFolderId = scenarioInner.insertId;

    await connection.query(
      'INSERT INTO folders (name, parent_id, owner_id) VALUES (?, ?, ?)',
      ['Other Scenario', scenarioFolderId, adminId],
    );

    void musicId;
    console.log('Seeded users (admin/admin, viewer/viewer) and folder tree.');
    console.log('Scenario demo folder id:', scenarioFolderId);
  } else {
    console.log('Database already seeded.');

    const [adminRows] = await connection.query(
      "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1",
    );
    const [rootRows] = await connection.query(
      "SELECT id FROM folders WHERE parent_id IS NULL AND nav_key = 'my-files' AND deleted_at IS NULL LIMIT 1",
    );

    if (adminRows.length > 0 && rootRows.length === 0) {
      const adminId = adminRows[0].id;
      const [myFiles] = await connection.query(
        'INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, NULL, ?, ?)',
        ['My Files', adminId, 'my-files'],
      );
      const myFilesId = myFiles.insertId;

      const insertRoot = async (name, key, parentId) => {
        const [result] = await connection.query(
          'INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, ?, ?, ?)',
          [name, parentId, adminId, key],
        );
        return result.insertId;
      };

      const videosId = await insertRoot('Videos', 'videos', myFilesId);
      const musicId = await insertRoot('Music', 'music', myFilesId);
      const imagesId = await insertRoot('Images', 'images', myFilesId);

      await connection.query(
        'INSERT INTO folders (name, parent_id, owner_id) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
        ['video 1', videosId, adminId, 'video 2', videosId, adminId, 'work 1', videosId, adminId],
      );

      const [scenarioInner] = await connection.query(
        'INSERT INTO folders (name, parent_id, owner_id, nav_key) VALUES (?, ?, ?, ?)',
        ['Scenario', imagesId, adminId, 'scenario'],
      );

      await connection.query(
        'INSERT INTO folders (name, parent_id, owner_id) VALUES (?, ?, ?)',
        ['Other Scenario', scenarioInner.insertId, adminId],
      );

      void musicId;
      console.log('Folder tree created for the existing admin user.');
    }
  }

  await connection.end();
  console.log('Database setup complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
