import { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../../config';
import AppError from '../../error/appError';
import prisma from '../../db/prisma';
import { jwtHelpers } from '../../helper/jwtHelpers';
import sendMailer from '../../helper/sendMailer';
import createOtpTemplate from '../../utils/createOtpTemplate';
import { userSelect } from '../user/user.constant';

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) throw new AppError(400, 'User already exists with this email');

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcryptSaltRounds),
  );

  const idx = Math.floor(Math.random() * 100);
  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      profileImage: `https://avatar.iran.liara.run/public/${idx}.png`,
    },
    select: userSelect,
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpiry: new Date(Date.now() + 20 * 60 * 1000) },
  });

  await sendMailer(
    payload.email,
    'Verify your email',
    createOtpTemplate(otp, payload.email, 'Urban Farming Platform'),
  );

  return user;
};

const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) throw new AppError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) throw new AppError(401, 'Invalid email or password');

  if (!user.verified) throw new AppError(403, 'Please verify your email first');
  if (user.status === 'blocked') throw new AppError(403, 'Your account has been blocked');

  const tokenPayload = { id: user.id, role: user.role, email: user.email };

  const accessToken = jwtHelpers.genaretToken(
    tokenPayload,
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpires,
  );
  const refreshToken = jwtHelpers.genaretToken(
    tokenPayload,
    config.jwt.refreshTokenSecret as Secret,
    config.jwt.refreshTokenExpires,
  );

  const { password, otp, otpExpiry, ...safeUser } = user;
  return { accessToken, refreshToken, user: safeUser };
};

const refreshToken = async (token: string) => {
  const decoded = jwtHelpers.verifyToken(
    token,
    config.jwt.refreshTokenSecret as Secret,
  );
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new AppError(401, 'User not found');

  const accessToken = jwtHelpers.genaretToken(
    { id: user.id, role: user.role, email: user.email },
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpires,
  );

  const { password, otp, otpExpiry, ...safeUser } = user;
  return { accessToken, user: safeUser };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(404, 'No user found with this email');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpiry: new Date(Date.now() + 20 * 60 * 1000) },
  });

  await sendMailer(
    email,
    'Password Reset OTP',
    createOtpTemplate(otp, email, 'Urban Farming Platform'),
  );
};

const verifyEmail = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(404, 'User not found');
  if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError(400, 'Invalid or expired OTP');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, otp: null, otpExpiry: null },
  });
};

const resetPassword = async (email: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(404, 'User not found');

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcryptSaltRounds),
  );
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, otp: null, otpExpiry: null },
  });

  const tokenPayload = { id: updated.id, role: updated.role, email: updated.email };
  const accessToken = jwtHelpers.genaretToken(
    tokenPayload,
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpires,
  );
  const refreshToken = jwtHelpers.genaretToken(
    tokenPayload,
    config.jwt.refreshTokenSecret as Secret,
    config.jwt.refreshTokenExpires,
  );

  const { password, otp, otpExpiry, ...safeUser } = updated;
  return { accessToken, refreshToken, user: safeUser };
};

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError(400, 'Old password is incorrect');

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcryptSaltRounds),
  );
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
};

export const authService = {
  registerUser,
  loginUser,
  refreshToken,
  forgotPassword,
  verifyEmail,
  resetPassword,
  changePassword,
};
