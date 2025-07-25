import { config } from '@server/config';
import { ApiError } from '@server/middleware';
import { Crypto } from '@server/security';
import { HttpStatusCode } from '@server/utils';
import { randomInt } from 'crypto';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { TokenService } from './TokenService';

export class AuthEngine extends TokenService {
  protected creatOtp = async (
    data: object,
    req: Request
  ): Promise<{ token: string; solidOTP: number }> => {
    try {
      const otpMin = Math.pow(10, 6 - 1);
      const otpMax = Math.pow(10, 6) - 1;

      const solidOTP = randomInt(otpMin, otpMax);

      const encrypted = await Crypto.cipheriv(
        {
          ...data,
          solidOTP,
          ip: req.ip,
          browser: req.useragent?.browser,
          device: req.useragent?.os,
        },
        config.CRYPTO_SECRET
      );

      const token = jwt.sign({ encrypted }, config.ACTIVATION_SECRET, {
        expiresIn: '10m',
      });

      return { token, solidOTP };
    } catch {
      throw new ApiError(
        'Failed to create OTP. Please try again.',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };

  protected normalizeMail = (email: string): string => {
    const [localPart, domain] = email.split('@');

    if (domain.toLowerCase() === 'gmail.com') {
      return localPart.replace(/\./g, '') + '@gmail.com';
    }

    return email.toLowerCase();
  };
}
