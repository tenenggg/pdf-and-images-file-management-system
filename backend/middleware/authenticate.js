import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as userModel from '../models/userModel.js';

export async function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  try {
    const user = await userModel.findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}
