import { Prisma } from '@prisma/client';
import AppError from '../../error/appError';
import { fileUploader } from '../../helper/fileUploder';
import pagination, { IOption } from '../../helper/pagenation';
import prisma from '../../db/prisma';
import { ICreateUser, IUpdateUser, IUserFilter } from './user.interface';
import { userSearchableFields, userSelect } from './user.constant';
import bcrypt from 'bcryptjs';
import config from '../../config';

const createUser = async (payload: ICreateUser) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcryptSaltRounds),
  );
  const result = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
    select: userSelect,
  });
  return result;
};

const getAllUsers = async (params: IUserFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({ [key]: value })),
    });
  }

  const whereCondition: Prisma.UserWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: userSelect,
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new AppError(404, 'User not found');
  return user;
};

const updateUserById = async (
  id: string,
  payload: IUpdateUser,
  file?: Express.Multer.File,
) => {
  await getUserById(id);
  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file);
    if (!uploaded?.url) throw new AppError(400, 'Failed to upload profile image');
    payload.profileImage = uploaded.url;
  }
  return prisma.user.update({ where: { id }, data: payload, select: userSelect });
};

const deleteUserById = async (id: string) => {
  await getUserById(id);
  return prisma.user.delete({ where: { id }, select: userSelect });
};

const getMyProfile = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new AppError(404, 'User not found');
  return user;
};

const updateMyProfile = async (
  id: string,
  payload: IUpdateUser,
  file?: Express.Multer.File,
) => {
  await getMyProfile(id);
  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file);
    if (!uploaded?.url) throw new AppError(400, 'Failed to upload profile image');
    payload.profileImage = uploaded.url;
  }
  return prisma.user.update({ where: { id }, data: payload, select: userSelect });
};

export const userService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getMyProfile,
  updateMyProfile,
};
