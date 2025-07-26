import { config, nodeClient } from '@server/config';
import { ApiError } from '@server/middleware';
import { IUser, UserRole } from '@server/models';
import { Crypto } from '@server/security';
import { catchAsync, HttpStatusCode } from '@server/utils';
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

  public requireAuth = catchAsync(
    async (
      req: Request<unknown, unknown, unknown> & {
        userId?: string | undefined;
        accessToken?: string | undefined;
      },
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      // Get credentials from request
      const { userId, accessToken } = req;

      // Query session and user data from Redis
      const p = nodeClient.multi();

      p.SISMEMBER(`${userId}:session`, Crypto.hmac(String(accessToken)));
      p.json.GET(`${userId}`);

      const [sessionToken, cachedUser] = await p.exec();

      // Invalidate if session/user not found
      if (!sessionToken || !cachedUser) {
        return this.sessionUnauthorized(res, next);
      }

      // Resolve user from Redis or fallback to database
      const user = cachedUser || (await this.model.findById(userId).exec());

      if (!user) {
        return next(
          new ApiError(
            "We couldn't find your account. Please contact support if you believe this is an error.",
            HttpStatusCode.NOT_FOUND
          )
        );
      }

      req.self = user;
      next();
    }
  );

  public restrictTo = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.self;
      if (!user?.role || !roles.includes(user.role)) {
        const error = new ApiError(
          'You do not have permission to perform this action',
          HttpStatusCode.FORBIDDEN
        );
        next(error);
        return;
      }

      next();
    };
  };
}
