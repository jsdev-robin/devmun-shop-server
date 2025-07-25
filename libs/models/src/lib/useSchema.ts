import { compare, hash } from 'bcryptjs';
import {
  CallbackWithoutResultAndOptionalError,
  model,
  Model,
  Schema,
} from 'mongoose';
import { SessionSchema } from './schemas/sessionSchema.js';
import { IUser, UserRole } from './types/user.js';

export const getUserModel = (
  modelName = 'User',
  role?: UserRole
): Model<IUser> => {
  const UserSchema = new Schema<IUser>(
    {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
      },
      normalizeMail: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        select: false,
      },
      password: { type: String, select: false, required: true },
      role: {
        type: String,
        enum: ['buyer', 'seller', 'admin', 'moderator'],
        default: role ?? 'buyer',
      },
      sessions: {
        type: [SessionSchema],
        select: false,
      },
      verified: {
        type: Boolean,
        select: false,
        default: false,
      },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  UserSchema.virtual('fullName').get(function (this: IUser) {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  });

  UserSchema.pre(
    'save',
    async function (next: CallbackWithoutResultAndOptionalError) {
      try {
        if (!this.isModified('password')) return next();
        this.password = await hash(this.password ?? '', 12);
        next();
      } catch (error: unknown) {
        next(error as Error);
      }
    }
  );

  UserSchema.methods.isPasswordValid = async function (
    this: IUser,
    candidatePassword: string
  ): Promise<boolean> {
    return await compare(candidatePassword, this.password ?? '');
  };

  return model<IUser>(modelName, UserSchema);
};

export const User = getUserModel('User', 'buyer');
export const Seller = getUserModel('Seller', 'seller');
