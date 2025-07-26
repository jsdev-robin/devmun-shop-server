import { config } from '@server/config';
import { IUser } from '@server/models';
import { catchAsync } from '@server/utils';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { AuthEngine } from './core/AuthEngine.js';
import { TokenSignature } from './core/TokenService.js';

export class AuthGuard<T extends IUser> extends AuthEngine {
  private readonly model: Model<T>;

  constructor(options: { model: Model<T> }) {
    super();
    this.model = options.model;
  }

  public validateToken = catchAsync(
    async (
      req: Request<Record<string, string>, unknown> & {
        userId?: string | undefined;
        accessToken?: string | undefined;
      },
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      const accessCookie = req.signedCookies[this.getAccessCookieConfig().name];

      // If the access token is missing, throw an unauthorized error
      if (accessCookie === false) {
        return this.sessionUnauthorized(res, next);
      }

      // Verify the access token and decode the payload
      const decoded = jwt.verify(accessCookie, config.ACCESS_TOKEN) as {
        id: string;
      } & TokenSignature;

      // Attach user ID and access token to the request object
      req.userId = decoded?.id;
      req.accessToken = accessCookie;

      // Validate the decrypted IP against the request IP
      if (!decoded || this.checkTokenSignature(decoded, req)) {
        return this.sessionUnauthorized(res, next);
      }

      next();
    }
  );
}
