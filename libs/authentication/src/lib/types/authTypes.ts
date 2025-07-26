/* eslint-disable @typescript-eslint/no-namespace */
import { IUser, UserRole } from '@server/models';
import { CookieOptions } from 'express';
import { Model } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      self: IUser;
      remember: boolean;
      redirect: string;
    }
  }
}

export interface CookieMeta {
  name: string;
  TTL: {
    expires: Date;
    maxAge: number;
  };
  options: CookieOptions;
}

export interface IAuthCookies {
  access: CookieMeta;
  refresh: CookieMeta;
}

export interface AuthServiceOptions<T> {
  model: Model<T>;
  role: UserRole;
}
