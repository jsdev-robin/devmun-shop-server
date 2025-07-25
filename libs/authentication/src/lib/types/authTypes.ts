import { UserRole } from '@server/models';
import { CookieOptions } from 'express';
import { Model } from 'mongoose';

export interface ICookieMeta {
  name: string;
  TTL: {
    expires: Date;
    maxAge: number;
  };
  options: CookieOptions;
}

export interface IAuthCookies {
  access: ICookieMeta;
  refresh: ICookieMeta;
}

export interface AuthServiceOptions<T> {
  model: Model<T>;
  cookies: IAuthCookies;
  role: UserRole;
}
