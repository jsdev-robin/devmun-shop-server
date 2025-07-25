import { SendEmail } from '@server/email';
import { ApiError } from '@server/middleware';
import { catchAsync, HttpStatusCode, Status } from '@server/utils';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { IUser, UserRole } from '../../types/user';
import { AuthEngine } from './particles/AuthEngine';
import { AuthServiceOptions, ISignup } from './types/authTypes';

export class AuthServices<T extends IUser> extends AuthEngine {
  private readonly model: Model<T>;
  private readonly role: UserRole;

  constructor(options: AuthServiceOptions<T>) {
    super(options);
    this.model = options.model;
    this.role = options.role;
  }

  public signup = catchAsync(
    async (
      req: Request<Record<string, string>, unknown, ISignup>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      // Destructure user input from request body
      const { firstName, lastName, email, password } = req.body;

      // Normalize the email for consistency (e.g., lowercase, trimmed)
      const normEmail = this.normalizeMail(email);

      // Check if a user already exists with the same email or normalized email
      const userExists = await this.model
        .findOne({
          $or: [{ email }, { normalizeMail: normEmail }],
        })
        .exec();

      // If user exists, return a 400 error with message
      if (userExists) {
        return next(
          new ApiError(
            'This email is already registered. Use a different email address.',
            HttpStatusCode.BAD_REQUEST
          )
        );
      }

      // Prepare user data for OTP creation and storage
      const data = {
        firstName,
        lastName,
        email,
        normalizeMail: normEmail,
        password,
      };

      // Generate OTP and token for email verification
      const { token, solidOTP } = await this.creatOtp(data, req);

      // Prepare data for the verification email
      const mailData = {
        user: {
          name: firstName,
          email,
        },
        otp: solidOTP,
      };

      // Send verification email and respond accordingly
      await new SendEmail(mailData)
        .verifyEmail()
        .then(() => {
          // On success, send OK response with verification token
          res.status(HttpStatusCode.OK).json({
            status: Status.SUCCESS,
            message:
              'Verification code sent successfully to your email address.',
            data: {
              token,
            },
          });
        })
        .catch(() => {
          // On failure, pass error to the next middleware
          return next(
            new ApiError(
              'An error occurred while sending the verification email. Please try again later.',
              HttpStatusCode.INTERNAL_SERVER_ERROR
            )
          );
        });
    }
  );
}

export default AuthServices;
