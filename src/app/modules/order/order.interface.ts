import { OrderStatus } from '@prisma/client';

export interface ICreateOrder {
  produceId: string;
  quantity: number;
}

export interface IOrderFilter {
  searchTerm?: string;
  status?: OrderStatus;
}
