import { Document } from 'mongoose';

export type UserRole = 'buyer' | 'seller' | 'admin' | 'moderator';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  normalizeMail?: string;
  password?: string;
  role?: UserRole;

  createdAt?: Date;
  updatedAt?: Date;

  isPasswordValid: (candidatePassword: string) => Promise<boolean>;
}
