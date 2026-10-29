import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as userModel from '../models/userModel.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    displayName: row.display_name,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      username: user.username,
      role: user.role,
      displayName: user.display_name ?? user.displayName,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      subject: String(user.id),
    },
  );
}

export async function login(username, password) {
  const user = await userModel.findUserByUsername(username);
  if (!user) {
    const err = new Error('Invalid username or password');
    err.status = 401;
    throw err;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid username or password');
    err.status = 401;
    throw err;
  }

  return { token: signToken(user), user: toPublicUser(user) };
}

export async function register(username, password) {
  if (!username || !password) {
    const err = new Error('Username and password are required');
    err.status = 400;
    throw err;
  }

  const existing = await userModel.findUserByUsername(username);
  if (existing) {
    const err = new Error('Username already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await userModel.createUser({
    username,
    passwordHash,
    role: 'user',
    displayName: username,
  });

  return { user: toPublicUser(user) };
}

export async function getMe(userId) {
  const user = await userModel.findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return toPublicUser(user);
}

export async function updateProfile(userId, { username, password, currentPassword }) {
  const existing = await userModel.findUserById(userId);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const user = await userModel.findUserByUsername(existing.username);

  const updates = {};

  if (username) {
    updates.username = username;
    updates.display_name = username;
  }

  if (password) {
    if (!currentPassword) {
      const err = new Error('Current password is required');
      err.status = 400;
      throw err;
    }
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      const err = new Error('Current password is incorrect');
      err.status = 400;
      throw err;
    }
    updates.password_hash = await hashPassword(password);
  }

  const updated = await userModel.updateUser(userId, updates);
  return toPublicUser(updated);
}
