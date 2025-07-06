import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  SMTP,
  TEMPLATE_DIR,
  THIRTY_DAYS,
} from '../constants/index.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';

export const registerUser = async (payload) => {
  const existingUser = await UsersCollection.findOne({ email: payload.email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  const registerUser = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });

  return registerUser;
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(401, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Invalid password');
  }
  await SessionsCollection.deleteOne({
    userId: user._id,
  });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUsersSession = async ({ refreshToken, sessionId }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTockenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTockenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  const createdSession = await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
  return createdSession;
};

const resetPasswordTemplate = fs.readFileSync(
  path.join(TEMPLATE_DIR, 'reset-password-email-template.html'),
  'utf-8',
);

export const requestResetEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    { sub: user._id, email: user.email },
    getEnvVar(SMTP.JWT_SECRET),
    {
      expiresIn: '5m',
    },
  );
  const resetLink = `https://${getEnvVar(
    SMTP.APP_DOMAIN,
  )}/reset-password?token=${resetToken}`;

  const template = Handlebars.compile(resetPasswordTemplate);
  const html = template({
    name: user.name,
    link: resetLink,
  });

  sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async ({ password, token }) => {
  let tokenPayload;

  try {
    tokenPayload = jwt.verify(token, getEnvVar(SMTP.JWT_SECRET));
  } catch (error) {
    console.error(error);
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await UsersCollection.findById(tokenPayload.sub);
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  if (
    user.passwordChangedAt &&
    tokenPayload.iat * 1000 < new Date(user.passwordChangedAt).getTime()
  ) {
    throw createHttpError(
      401,
      'Token is no longer valid. Please log in again.',
    );
  }

  const hashPassword = await bcrypt.hash(password, 10);
  await UsersCollection.findByIdAndUpdate(tokenPayload.sub, {
    password: hashPassword,
    passwordChangedAt: new Date(),
  });

  await SessionsCollection.findOneAndDelete({ userId: tokenPayload.sub });
};
