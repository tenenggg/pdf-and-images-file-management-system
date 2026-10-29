import * as userModel from '../models/userModel.js';
import { hashPassword } from '../utils/password.js';

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listUsers(req, res, next) {
  try {
    const users = await userModel.listUsers();
    res.json({ users: users.map(toPublicUser) });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await userModel.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { username, password, role = 'user', displayName } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const passwordHash = await hashPassword(password);
    const user = await userModel.createUser({
      username: username.trim(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
      displayName: displayName?.trim() || username.trim(),
    });

    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    return next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { username, password, role, displayName } = req.body;
    const updates = {};

    if (username) updates.username = username.trim();
    if (displayName) updates.display_name = displayName.trim();
    if (role) updates.role = role === 'admin' ? 'admin' : 'user';
    if (password) updates.password_hash = await hashPassword(password);

    const user = await userModel.updateUser(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    return next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    await userModel.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
