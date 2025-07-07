import fs from 'node:fs/promises';
import path from 'node:path';
import {
  PERMANENT_UPLOAD_DIR,
  SMTP,
  TEMP_UPLOAD_DIR,
} from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

export const saveFileToPermanentUploadDir = async (file) => {
  try {
    await fs.rename(
      path.join(TEMP_UPLOAD_DIR, file.filename),
      path.join(PERMANENT_UPLOAD_DIR, file.filename),
    );

    return `${getEnvVar(SMTP.APP_DOMAIN)}/uploads/${file.filename}`;
  } catch (error) {
    throw createHttpError(500, 'Local upload failed');
  }
};
