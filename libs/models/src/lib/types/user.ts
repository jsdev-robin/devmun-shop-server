import mongoose, { Document } from 'mongoose';

export type UserRole = 'buyer' | 'seller' | 'admin' | 'moderator';

export interface IUser extends Document {
  _id: mongoose.ObjectId;
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  normalizeMail?: string;
  password?: string;
  role?: UserRole;

  verified: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  isPasswordValid: (candidatePassword: string) => Promise<boolean>;
}
