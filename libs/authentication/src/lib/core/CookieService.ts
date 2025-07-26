import { config } from '@server/config';
import { ApiError } from '@server/middleware';
import { HttpStatusCode } from '@server/utils';
import { CookieOptions } from 'express';

export const ACCESS_TTL: number = parseInt(
  config.ACCESS_TOKEN_EXPIRE ?? '30',
  10
);

export const REFRESH_TTL: number = parseInt(
  config.REFRESH_TOKEN_EXPIRE ?? '3',
  10
);

// 30 min
export const ACCESS_COOKIE_EXP = {
  expires: new Date(Date.now() + ACCESS_TTL * 60 * 1000),
  maxAge: ACCESS_TTL * 60 * 1000,
};

// 3 days
export const REFRESH_COOKIE_EXP = {
  expires: new Date(Date.now() + REFRESH_TTL * 24 * 60 * 60 * 1000),
  maxAge: REFRESH_TTL * 24 * 60 * 60 * 1000,
};

export const ENABLE_SIGNATURE = {
  signed: true,
};

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  path: '/',
  domain: config.ISPRODUCTION ? '.devmun.xyz' : 'localhost',
};

export const ACCESS_COOKIE_NAME = '__Secure-gk_9sLrTf2sa';
export const REFRESH_COOKIE_NAME = '__Host-qX_sr2pR8dK';

export class CookieService {
  protected getAccessCookieConfig = () => {
    return {
      name: ACCESS_COOKIE_NAME,
      expires: ACCESS_COOKIE_EXP,
      options: COOKIE_OPTIONS,
    };
  };

  protected getRefreshCookieConfig = () => {
    return {
      name: REFRESH_COOKIE_NAME,
      expires: REFRESH_COOKIE_EXP,
      options: COOKIE_OPTIONS,
    };
  };

  protected createAccessCookie = (
    payload = '',
    remember = false
  ): [string, string, CookieOptions] => {
    try {
      const base = this.getAccessCookieConfig();

      const options = remember
        ? { ...base.options, ...base.expires }
        : base.options;

      return [base.name, payload, options];
    } catch {
      throw new ApiError(
        'Failed to create access cookie.',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };

  protected createRefreshCookie = (
    payload = '',
    remember = false
  ): [string, string, CookieOptions] => {
    try {
      const base = this.getRefreshCookieConfig();

      const options = remember
        ? { ...base.options, ...base.expires }
        : base.options;

      return [base.name, payload, options];
    } catch {
      throw new ApiError(
        'Failed to create refresh cookie.',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };
}
