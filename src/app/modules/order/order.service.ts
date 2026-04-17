import { OrderStatus, Prisma } from '@prisma/client';
import AppError from '../../error/appError';
import prisma from '../../db/prisma';
import pagination, { IOption } from '../../helper/pagenation';
import { ICreateOrder, IOrderFilter } from './order.interface';

const createOrder = async (userId: string, payload: ICreateOrder) => {
  const produce = await prisma.produce.findUnique({ where: { id: payload.produceId } });
  if (!produce) throw new AppError(404, 'Produce not found');
  if (produce.certificationStatus !== 'approved') {
    throw new AppError(400, 'This produce is not available for purchase');
  }
  if (produce.availableQuantity < payload.quantity) {
    throw new AppError(400, `Only ${produce.availableQuantity} units available`);
  }

  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        userId,
        produceId: payload.produceId,
        vendorId: produce.vendorId,
        quantity: payload.quantity,
      },
      include: {
        produce: { select: { id: true, name: true, price: true } },
        vendor: { select: { id: true, farmName: true } },
      },
    }),
    prisma.produce.update({
      where: { id: payload.produceId },
      data: { availableQuantity: { decrement: payload.quantity } },
    }),
  ]);

  return order;
};

const getMyOrders = async (userId: string, params: IOrderFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.OrderWhereInput[] = [{ userId }];

  if (searchTerm) {
    andConditions.push({
      produce: { name: { contains: searchTerm, mode: 'insensitive' } },
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({ [key]: value })),
    });
  }

  const whereCondition: Prisma.OrderWhereInput = { AND: andConditions };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        produce: { select: { id: true, name: true, price: true, image: true } },
        vendor: { select: { id: true, farmName: true } },
      },
    }),
    prisma.order.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getAllOrders = async (params: IOrderFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.OrderWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { produce: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ],
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({ [key]: value })),
    });
  }

  const whereCondition: Prisma.OrderWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: { select: { id: true, name: true, email: true } },
        produce: { select: { id: true, name: true, price: true } },
        vendor: { select: { id: true, farmName: true } },
      },
    }),
    prisma.order.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getOrderById = async (id: string, userId: string, userRole: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      produce: { select: { id: true, name: true, price: true, image: true } },
      vendor: { select: { id: true, farmName: true } },
    },
  });
  if (!order) throw new AppError(404, 'Order not found');
  if (userRole === 'customer' && order.userId !== userId) {
    throw new AppError(403, 'Unauthorized');
  }
  return order;
};

const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError(404, 'Order not found');
  return prisma.order.update({ where: { id }, data: { status } });
};

export const orderService = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
