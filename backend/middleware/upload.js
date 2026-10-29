import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, env.uploadDir);
  },
  filename(req, file, cb) {
    const safeOriginal = file.originalname.replace(/[^\w.\-()+\s]/g, '_');
    cb(null, `${uuidv4()}-${safeOriginal}`);
  },
});

export const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const isPdf = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');
    if (!isPdf && !isImage) {
      return cb(new Error('Only PDF and image files are allowed'));
    }
    return cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});
