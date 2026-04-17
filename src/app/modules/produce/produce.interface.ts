import { CertificationStatus } from '@prisma/client';

export interface ICreateProduce {
  name: string;
  description?: string;
  price: number;
  category: string;
  availableQuantity: number;
  image?: string;
}

export interface IUpdateProduce {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  availableQuantity?: number;
  image?: string;
}

export interface IProduceFilter {
  searchTerm?: string;
  category?: string;
  certificationStatus?: CertificationStatus;
}
