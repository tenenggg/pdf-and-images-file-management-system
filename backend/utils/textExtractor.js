import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import Tesseract from 'tesseract.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TESSDATA_PATH = path.join(__dirname, '..', 'tessdata');

export async function extractText(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text?.trim() || null;
    } else if (mimeType.startsWith('image/')) {
      const result = await Tesseract.recognize(filePath, 'eng', {
        langPath: TESSDATA_PATH,
        // Use local tessdata — no internet needed
        gzip: false,
      });
      return result.data.text?.trim() || null;
    }
  } catch (err) {
    console.error('[textExtractor] Extraction failed:', err.message);
  }
  return null;
}
