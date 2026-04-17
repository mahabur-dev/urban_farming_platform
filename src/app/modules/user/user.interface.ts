import { Role, UserStatus } from '@prisma/client';

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface IUpdateUser {
  name?: string;
  profileImage?: string;
  status?: UserStatus;
}

export interface IUserFilter {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
}
