import { config } from '@server/config';
import { CookieOptions } from 'express';
import { IAuthCookies } from '../types/authTypes';

export const accessTTL: number = parseInt(
  config.ACCESS_TOKEN_EXPIRE ?? '30',
  10
);

export const refreshTTL: number = parseInt(
  config.REFRESH_TOKEN_EXPIRE ?? '3',
  10
);

// 30 min
export const accessCookieExp = {
  expires: new Date(Date.now() + accessTTL * 60 * 1000),
  maxAge: accessTTL * 60 * 1000,
};

// export const accessCookieExp = {
//   expires: new Date(Date.now() + 10 * 1000),
//   maxAge: 10 * 1000,
// };

// 3 days
export const refreshCookieExp = {
  expires: new Date(Date.now() + refreshTTL * 24 * 60 * 60 * 1000),
  maxAge: refreshTTL * 24 * 60 * 60 * 1000,
};

export const enableSignature = {
  signed: true,
};

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  path: '/',
  domain: config.ISPRODUCTION ? '.devmun.xyz' : 'localhost',
};

export class CookieService {
  protected readonly cookies: IAuthCookies;

  constructor(options: { cookies: IAuthCookies }) {
    this.cookies = options.cookies;
  }
}
