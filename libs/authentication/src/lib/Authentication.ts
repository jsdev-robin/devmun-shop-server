import { nodeClient } from '@server/config';
import { ApiError } from '@server/middleware';
import { IUser, UserRole } from '@server/models';
import { Crypto } from '@server/security';
import { catchAsync, HttpStatusCode } from '@server/utils';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { AuthEngine } from './core/AuthEngine.js';
import { AuthServiceOptions } from './types/authTypes.js';

export class AuthGuard<T extends IUser> extends AuthEngine {
  private readonly model: Model<T>;
  private readonly role: UserRole;

  constructor(options: AuthServiceOptions<T>) {
    super(options);
    this.model = options.model;
    this.role = options.role;
  }

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

      console.log(sessionToken, cachedUser);
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
