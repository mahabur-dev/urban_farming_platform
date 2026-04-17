import { Prisma } from '@prisma/client';
import AppError from '../../error/appError';
import prisma from '../../db/prisma';
import pagination, { IOption } from '../../helper/pagenation';
import { fileUploader } from '../../helper/fileUploder';
import { ICreateProduce, IUpdateProduce, IProduceFilter } from './produce.interface';

const createProduce = async (
  userId: string,
  payload: ICreateProduce,
  file?: Express.Multer.File,
) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found. Create one first.');
  if (vendorProfile.certificationStatus !== 'approved') {
    throw new AppError(403, 'Your vendor profile must be approved before listing produce');
  }

  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file);
    if (!uploaded?.url) throw new AppError(400, 'Failed to upload image');
    payload.image = uploaded.url;
  }

  return prisma.produce.create({ data: { ...payload, vendorId: vendorProfile.id } });
};

const getAllProduce = async (params: IProduceFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.ProduceWhereInput[] = [
    { certificationStatus: 'approved' },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({ [key]: value })),
    });
  }

  const whereCondition: Prisma.ProduceWhereInput = { AND: andConditions };

  const [data, total] = await Promise.all([
    prisma.produce.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        vendor: { select: { id: true, farmName: true, farmLocation: true } },
      },
    }),
    prisma.produce.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getMyProduce = async (userId: string, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found');

  const whereCondition: Prisma.ProduceWhereInput = { vendorId: vendorProfile.id };

  const [data, total] = await Promise.all([
    prisma.produce.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.produce.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getProduceById = async (id: string) => {
  const produce = await prisma.produce.findUnique({
    where: { id },
    include: { vendor: { select: { id: true, farmName: true, farmLocation: true } } },
  });
  if (!produce) throw new AppError(404, 'Produce not found');
  return produce;
};

const updateProduce = async (
  id: string,
  userId: string,
  payload: IUpdateProduce,
  file?: Express.Multer.File,
) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found');

  const produce = await prisma.produce.findUnique({ where: { id } });
  if (!produce) throw new AppError(404, 'Produce not found');
  if (produce.vendorId !== vendorProfile.id) throw new AppError(403, 'Unauthorized');

  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file);
    if (!uploaded?.url) throw new AppError(400, 'Failed to upload image');
    payload.image = uploaded.url;
  }

  return prisma.produce.update({ where: { id }, data: payload });
};

const deleteProduce = async (id: string, userId: string) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found');

  const produce = await prisma.produce.findUnique({ where: { id } });
  if (!produce) throw new AppError(404, 'Produce not found');
  if (produce.vendorId !== vendorProfile.id) throw new AppError(403, 'Unauthorized');

  return prisma.produce.delete({ where: { id } });
};

const approveProduce = async (id: string, status: 'approved' | 'rejected') => {
  const produce = await prisma.produce.findUnique({ where: { id } });
  if (!produce) throw new AppError(404, 'Produce not found');
  return prisma.produce.update({ where: { id }, data: { certificationStatus: status } });
};

export const produceService = {
  createProduce,
  getAllProduce,
  getMyProduce,
  getProduceById,
  updateProduce,
  deleteProduce,
  approveProduce,
};
