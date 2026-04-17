import { Prisma } from '@prisma/client';
import AppError from '../../error/appError';
import prisma from '../../db/prisma';
import pagination, { IOption } from '../../helper/pagenation';
import { fileUploader } from '../../helper/fileUploder';
import { ICreateRentalSpace, IUpdateRentalSpace, IRentalSpaceFilter } from './rentalSpace.interface';

const createRentalSpace = async (
  userId: string,
  payload: ICreateRentalSpace,
  file?: Express.Multer.File,
) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found. Create one first.');

  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file);
    if (!uploaded?.url) throw new AppError(400, 'Failed to upload image');
    payload.image = uploaded.url;
  }

  return prisma.rentalSpace.create({ data: { ...payload, vendorId: vendorProfile.id } });
};

const getAllRentalSpaces = async (params: IRentalSpaceFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.RentalSpaceWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      location: { contains: searchTerm, mode: 'insensitive' },
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({
        [key]: key === 'availability' ? value === 'true' || value === true : value,
      })),
    });
  }

  const whereCondition: Prisma.RentalSpaceWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.rentalSpace.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        vendor: { select: { id: true, farmName: true, farmLocation: true } },
      },
    }),
    prisma.rentalSpace.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getMyRentalSpaces = async (userId: string, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found');

  const whereCondition: Prisma.RentalSpaceWhereInput = { vendorId: vendorProfile.id };
  const [data, total] = await Promise.all([
    prisma.rentalSpace.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.rentalSpace.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getRentalSpaceById = async (id: string) => {
  const space = await prisma.rentalSpace.findUnique({
    where: { id },
    include: { vendor: { select: { id: true, farmName: true, farmLocation: true } } },
  });
  if (!space) throw new AppError(404, 'Rental space not found');
  return space;
};

const updateRentalSpace = async (
  id: string,
  userId: string,
  payload: IUpdateRentalSpace,
  file?: Express.Multer.File,
) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found');

  const space = await prisma.rentalSpace.findUnique({ where: { id } });
  if (!space) throw new AppError(404, 'Rental space not found');
  if (space.vendorId !== vendorProfile.id) throw new AppError(403, 'Unauthorized');

  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file);
    if (!uploaded?.url) throw new AppError(400, 'Failed to upload image');
    payload.image = uploaded.url;
  }

  return prisma.rentalSpace.update({ where: { id }, data: payload });
};

const deleteRentalSpace = async (id: string, userId: string) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found');

  const space = await prisma.rentalSpace.findUnique({ where: { id } });
  if (!space) throw new AppError(404, 'Rental space not found');
  if (space.vendorId !== vendorProfile.id) throw new AppError(403, 'Unauthorized');

  return prisma.rentalSpace.delete({ where: { id } });
};

export const rentalSpaceService = {
  createRentalSpace,
  getAllRentalSpaces,
  getMyRentalSpaces,
  getRentalSpaceById,
  updateRentalSpace,
  deleteRentalSpace,
};
