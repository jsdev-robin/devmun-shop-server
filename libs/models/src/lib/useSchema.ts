import { compare, hash } from 'bcryptjs';
import {
  CallbackWithoutResultAndOptionalError,
  model,
  Model,
  Schema,
} from 'mongoose';
import { IUser } from './types/user.js';

export const getUserModel = (modelName = 'User'): Model<IUser> => {
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
        default: 'buyer',
      },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  // Virtual: fullName
  UserSchema.virtual('fullName').get(function (this: IUser) {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  });

  // Pre-save: hash password
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

  // Method: isPasswordValid
  UserSchema.methods.isPasswordValid = async function (
    this: IUser,
    candidatePassword: string
  ): Promise<boolean> {
    return await compare(candidatePassword, this.password ?? '');
  };

  return model<IUser>(modelName, UserSchema);
};

export const User = getUserModel('User');
export const Seller = getUserModel('Seller');
