import { cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import createHttpError from 'http-errors';
import { CLOUDINARY } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';

cloudinary.v2.config({
  secure: true,
  cloud_name: getEnvVar(CLOUDINARY.CLOUD_NAME),
  api_key: getEnvVar(CLOUDINARY.API_KEY),
  api_secret: getEnvVar(CLOUDINARY.API_SECRET),
});

const saveFilesToCloudinary = async (file) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file.path);
    await fs.unlink(file.path);
    return result.secure_url;
  } catch (error) {
    console.error(error);
    throw createHttpError(500, error.message || 'Cloudinary upload failed');
  }
};
