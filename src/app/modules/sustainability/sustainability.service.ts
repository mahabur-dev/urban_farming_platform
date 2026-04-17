import { CertificationStatus, Prisma } from '@prisma/client';
import AppError from '../../error/appError';
import prisma from '../../db/prisma';
import pagination, { IOption } from '../../helper/pagenation';
import { fileUploader } from '../../helper/fileUploder';
import { ICreateSustainabilityCert, ISustainabilityFilter } from './sustainability.interface';

const submitCert = async (
  userId: string,
  payload: ICreateSustainabilityCert,
  file?: Express.Multer.File,
) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found. Create one first.');

  if (file) {
    const uploaded = await fileUploader.uploadToCloudinary(file);
    if (!uploaded?.url) throw new AppError(400, 'Failed to upload document');
    payload.documentUrl = uploaded.url;
  }

  return prisma.sustainabilityCert.create({
    data: {
      vendorId: vendorProfile.id,
      certifyingAgency: payload.certifyingAgency,
      certificationDate: new Date(payload.certificationDate),
      documentUrl: payload.documentUrl,
    },
  });
};

const getMyCerts = async (userId: string, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
  if (!vendorProfile) throw new AppError(404, 'Vendor profile not found');

  const whereCondition: Prisma.SustainabilityCertWhereInput = { vendorId: vendorProfile.id };
  const [data, total] = await Promise.all([
    prisma.sustainabilityCert.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.sustainabilityCert.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getAllCerts = async (params: ISustainabilityFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.SustainabilityCertWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      certifyingAgency: { contains: searchTerm, mode: 'insensitive' },
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({ [key]: value })),
    });
  }

  const whereCondition: Prisma.SustainabilityCertWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.sustainabilityCert.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        vendor: { select: { id: true, farmName: true, farmLocation: true } },
      },
    }),
    prisma.sustainabilityCert.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const updateCertStatus = async (id: string, status: CertificationStatus) => {
  const cert = await prisma.sustainabilityCert.findUnique({ where: { id } });
  if (!cert) throw new AppError(404, 'Certificate not found');

  const updated = await prisma.sustainabilityCert.update({
    where: { id },
    data: { status },
  });

  if (status === 'approved') {
    await prisma.vendorProfile.update({
      where: { id: cert.vendorId },
      data: { certificationStatus: 'approved' },
    });
  }

  return updated;
};

export const sustainabilityService = {
  submitCert,
  getMyCerts,
  getAllCerts,
  updateCertStatus,
};
