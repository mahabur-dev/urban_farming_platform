import { Prisma } from '@prisma/client';
import AppError from '../../error/appError';
import prisma from '../../db/prisma';
import pagination, { IOption } from '../../helper/pagenation';
import { ICreateVendorProfile, IUpdateVendorProfile, IVendorFilter } from './vendor.interface';

const createVendorProfile = async (userId: string, payload: ICreateVendorProfile) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');
  if (user.role !== 'vendor') throw new AppError(403, 'Only vendors can create a farm profile');

  const existing = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (existing) throw new AppError(400, 'Vendor profile already exists');

  return prisma.vendorProfile.create({ data: { userId, ...payload } });
};

const getMyVendorProfile = async (userId: string) => {
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true, profileImage: true } } },
  });
  if (!profile) throw new AppError(404, 'Vendor profile not found');
  return profile;
};

const updateMyVendorProfile = async (userId: string, payload: IUpdateVendorProfile) => {
  const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(404, 'Vendor profile not found');
  return prisma.vendorProfile.update({ where: { userId }, data: payload });
};

const getAllVendors = async (params: IVendorFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.VendorProfileWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { farmName: { contains: searchTerm, mode: 'insensitive' } },
        { farmLocation: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ],
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({ [key]: value })),
    });
  }

  const whereCondition: Prisma.VendorProfileWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.vendorProfile.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { user: { select: { id: true, name: true, email: true, profileImage: true } } },
    }),
    prisma.vendorProfile.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getVendorById = async (id: string) => {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, profileImage: true } } },
  });
  if (!vendor) throw new AppError(404, 'Vendor profile not found');
  return vendor;
};

const updateCertificationStatus = async (
  id: string,
  status: 'approved' | 'rejected',
) => {
  await getVendorById(id);
  return prisma.vendorProfile.update({
    where: { id },
    data: { certificationStatus: status },
  });
};

export const vendorService = {
  createVendorProfile,
  getMyVendorProfile,
  updateMyVendorProfile,
  getAllVendors,
  getVendorById,
  updateCertificationStatus,
};
