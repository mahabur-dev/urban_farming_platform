import { CertificationStatus } from '@prisma/client';

export interface ICreateSustainabilityCert {
  certifyingAgency: string;
  certificationDate: string;
  documentUrl?: string;
}

export interface ISustainabilityFilter {
  searchTerm?: string;
  status?: CertificationStatus;
}
