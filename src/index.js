import { PERMANENT_UPLOAD_DIR, TEMP_UPLOAD_DIR } from './constants/index.js';
import { initMongoDB } from './db/initMongoDB.js';
import { setupServer } from './server.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';

const bootstrap = async () => {
  await initMongoDB();
  await createDirIfNotExists(TEMP_UPLOAD_DIR);
  await createDirIfNotExists(PERMANENT_UPLOAD_DIR);
  setupServer();
};

bootstrap();
