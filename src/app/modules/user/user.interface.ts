export interface IUser {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  profileImage?: string;
  bio?: string;
  phone?: string;
  professionTitle?: string;
  streetAddress?: string;
  location?: string;
  postCode?: string;
  otp?: string;
  otpExpiry?: Date;
  verified?: boolean;
  stripeAccountId?: string;
}
