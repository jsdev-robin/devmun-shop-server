import { config } from '@server/config';
import { ApiError } from '@server/middleware';
import { UserRole } from '@server/models';
import { Crypto } from '@server/security';
import { HttpStatusCode } from '@server/utils';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ACCESS_TTL, CookieService, REFRESH_TTL } from './CookieService.js';

export interface TokenSignature {
  ip: string;
  browser: string;
  device: string;
  id: string;
  role: UserRole;
  remember: boolean;
  token: string;
}

export class TokenService extends CookieService {
  private tokenSignature(
    req: Request,
    user: { id: mongoose.ObjectId; role: UserRole }
  ) {
    return {
      ip: Crypto.hmac(String(req.ip)),
      id: user.id,
      role: user.role,
      browser: Crypto.hmac(String(req.useragent?.browser)),
      device: Crypto.hmac(String(req.useragent?.os)),
    };
  }

  protected rotateToken = (
    req: Request,
    payload: { id: mongoose.ObjectId; role: UserRole; remember: boolean }
  ): [string, string] => {
    try {
      const { id, role, remember } = payload;

      const clientSignature = this.tokenSignature(req, {
        id: id,
        role: role,
      });

      const accessToken = jwt.sign(
        { ...clientSignature },
        config.ACCESS_TOKEN,
        {
          expiresIn: `${ACCESS_TTL}m`,
          algorithm: 'HS256',
        }
      );

      const refreshToken = jwt.sign(
        {
          ...clientSignature,
          remember: remember,
          token: Crypto.hmac(accessToken),
        },
        config.REFRESH_TOKEN,
        {
          expiresIn: `${REFRESH_TTL}d`,
          algorithm: 'HS256',
        }
      );

      return [accessToken, refreshToken];
    } catch {
      throw new ApiError(
        'Failed to generate session tokens. Please try again.',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };
}
