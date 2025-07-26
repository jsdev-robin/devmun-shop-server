import mongoose, { Document } from 'mongoose';

export type UserRole = 'buyer' | 'seller' | 'admin' | 'moderator';

export interface ISession {
  token?: string;
  deviceInfo?: {
    deviceType?: string;
    os?: string;
    browser?: string;
    userAgent?: string;
  };
  ip?: string;
  location?: {
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  loggedInAt?: Date;
  expiresAt?: Date;
  revoked?: boolean;
  revokedAt?: Date;
  lastActivityAt?: Date;
  riskScore?: number;
  trustedDevice?: boolean;
  status?: boolean;
}

export interface IUser extends Document {
  _id: mongoose.ObjectId;
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  normalizeMail?: string;
  password?: string;
  role?: UserRole;
  sessions?: ISession[];
  verified: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  isPasswordValid: (candidatePassword: string) => Promise<boolean>;
}
