import { Prisma } from '@prisma/client';

export const userRole = {
  admin: 'admin',
  vendor: 'vendor',
  customer: 'customer',
} as const;

export const userStatus = {
  active: 'active',
  inactive: 'inactive',
  blocked: 'blocked',
} as const;

export const userSearchableFields = ['name', 'email'];

export const userFilterableFields = ['searchTerm', 'role', 'status'];

export const userSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  profileImage: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
};
