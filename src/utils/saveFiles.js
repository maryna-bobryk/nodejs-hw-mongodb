import { CLOUDINARY } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';
import { saveFilesToCloudinary } from './saveFilesToCloudinary.js';
import { saveFileToPermanentUploadDir } from './saveFileToPermanentUploadDir.js';

export const saveFiles = async (file) => {
  if (getEnvVar(CLOUDINARY.CLOUDINARY_ENABLED)) {
    return await saveFilesToCloudinary(file);
  } else {
    return await saveFileToPermanentUploadDir(file);
  }
};
