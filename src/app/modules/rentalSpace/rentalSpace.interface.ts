export interface ICreateRentalSpace {
  location: string;
  size: number;
  price: number;
  availability?: boolean;
  image?: string;
}

export interface IUpdateRentalSpace {
  location?: string;
  size?: number;
  price?: number;
  availability?: boolean;
  image?: string;
}

export interface IRentalSpaceFilter {
  searchTerm?: string;
  availability?: boolean;
}
