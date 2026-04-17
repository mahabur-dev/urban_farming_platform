import { CertificationStatus } from '@prisma/client';

export interface ICreateVendorProfile {
  farmName: string;
  farmLocation: string;
}

export interface IUpdateVendorProfile {
  farmName?: string;
  farmLocation?: string;
}

export interface IVendorFilter {
  searchTerm?: string;
  certificationStatus?: CertificationStatus;
}
