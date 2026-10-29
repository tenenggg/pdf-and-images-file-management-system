import * as authService from '../services/authService.js';
import { env } from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username?.trim(), password);
    res.cookie('token', result.token, cookieOptions);
    res.json({ user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const username = req.body.username?.trim();
    const result = await authService.register(username, req.body.password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  const { maxAge, ...clearCookieOptions } = cookieOptions;
  res.clearCookie('token', clearCookieOptions);
  res.status(204).send();
}

export async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
