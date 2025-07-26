import { config, nodeClient } from '@server/config';
import { ApiError } from '@server/middleware';
import { Crypto } from '@server/security';
import { HttpStatusCode } from '@server/utils';
import { randomInt } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { ACCESS_TTL, REFRESH_TTL } from './CookieService.js';
import { TokenService } from './TokenService.js';

export class AuthEngine extends TokenService {
  protected getDeviceInfo = (req: Request) => {
    const ua = req.useragent;
    const deviceType = ua?.isSmartTV
      ? 'smart-tv'
      : ua?.isBot
      ? 'bot'
      : ua?.isMobileNative
      ? 'mobile-native'
      : ua?.isMobile
      ? 'mobile'
      : ua?.isTablet
      ? 'tablet'
      : ua?.isAndroidTablet
      ? 'android-tablet'
      : ua?.isiPad
      ? 'ipad'
      : ua?.isiPhone
      ? 'iphone'
      : ua?.isiPod
      ? 'ipod'
      : ua?.isKindleFire
      ? 'kindle-fire'
      : ua?.isDesktop
      ? 'desktop'
      : ua?.isWindows
      ? 'windows'
      : ua?.isMac
      ? 'mac'
      : ua?.isLinux
      ? 'linux'
      : ua?.isChromeOS
      ? 'chromeos'
      : ua?.isRaspberry
      ? 'raspberry-pi'
      : 'unknown';

    return {
      deviceType,
      os: ua?.os ?? 'unknown',
      browser: ua?.browser ?? 'unknown',
      userAgent: req.headers['user-agent'] ?? 'unknown',
    };
  };

  protected getLocationInfo = (req: Request) => ({
    city: req.ipinfo?.city || 'unknown',
    country: req.ipinfo?.country || 'unknown',
    lat: Number(req.ipinfo?.loc?.split(',')[0]) || 0,
    lng: Number(req.ipinfo?.loc?.split(',')[1]) || 0,
  });

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

  protected storeSession = async <T extends { _id: string | number }>(
    req: Request,
    Model: Model<T>,
    payload: {
      user: T;
      accessToken: string;
    }
  ): Promise<void> => {
    try {
      const { user, accessToken } = payload;
      const id = user._id;
      const hashedToken = Crypto.hmac(String(accessToken));

      await Promise.all([
        // Redis operations
        (async () => {
          const p = nodeClient.multi();
          p.SADD(`${id}:session`, hashedToken);
          p.json.SET(`${id}`, '$', user);
          p.EXPIRE(`${id}:session`, ACCESS_TTL * 24 * 60 * 60);
          p.EXPIRE(`${id}`, REFRESH_TTL * 24 * 60 * 60);
          await p.exec();
        })(),

        // MongoDB operations
        Model.findByIdAndUpdate(
          { _id: id },
          {
            $push: {
              sessions: {
                token: hashedToken,
                deviceInfo: this.getDeviceInfo(req),
                location: this.getLocationInfo(req),
                ip: req.ip,
              },
            },
          },
          { new: true }
        ).exec(),
      ]);
    } catch {
      throw new ApiError(
        'Failed to store session',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };

  protected sessionUnauthorized = (res: Response, next: NextFunction) => {
    this.clearAllCookies(res);
    return next(
      new ApiError(
        'Your session has expired or is no longer available. Please log in again to continue.',
        HttpStatusCode.UNAUTHORIZED
      )
    );
  };
}
