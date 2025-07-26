import { AuthEngine, AuthServiceOptions } from '@server/authentication';
import { config } from '@server/config';
import { SendEmail } from '@server/email';
import { ApiError } from '@server/middleware';
import { IUser, UserRole } from '@server/models';
import { Crypto, Decipheriv } from '@server/security';
import { catchAsync, HttpStatusCode, Status } from '@server/utils';
import { timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { ISignin, ISignup, IVerifyEmail } from './types/authTypes';

export class AuthService<T extends IUser> extends AuthEngine {
  private readonly model: Model<T>;
  private readonly role: UserRole;

  constructor(options: AuthServiceOptions<T>) {
    super();
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

  public verifyEmail = catchAsync(
    async (
      req: Request<Record<string, string>, unknown, IVerifyEmail>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      // Destructure OTP and token from request body
      const { otp, token } = req.body;

      // Verify JWT token and extract the encrypted payload
      const { encrypted } = jwt.verify(token, config.ACTIVATION_SECRET) as {
        encrypted: Decipheriv;
      };

      // Decrypt the encrypted payload to retrieve user information
      const { firstName, lastName, email, normalizeMail, password, solidOTP } =
        await Crypto.decipheriv<{
          firstName: string;
          lastName: string;
          email: string;
          normalizeMail: string;
          password: string;
          solidOTP: string;
        }>(encrypted, config.CRYPTO_SECRET);

      const aBuf = Buffer.from(String(solidOTP));
      const bBuf = Buffer.from(String(otp));

      const correctOTP = timingSafeEqual(aBuf, bBuf);

      // Compare provided OTP with the decrypted solidOTP
      if (!correctOTP) {
        return next(
          new ApiError(
            'The OTP you entered does not match. Please double-check the code and try again.',
            HttpStatusCode.BAD_REQUEST
          )
        );
      }

      // Construct the user payload including email verification log
      const payload = {
        firstName,
        lastName,
        email: email,
        normalizeMail: normalizeMail,
        password: password,
        role: this.role,
      };

      // Create a new user record if OTP matches
      await this.model.create(payload);

      // Respond with a success message
      res.status(HttpStatusCode.CREATED).json({
        status: Status.SUCCESS,
        message: 'Your account has been successfully verified.',
      });
    }
  );

  public signin = catchAsync(
    async (
      req: Request<Record<string, string>, unknown, ISignin>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      // Extract login fields from request body
      const { email, password, remember } = req.body;

      // Look up user by email, including password
      const user = await this.model
        .findOne({ email })
        .select('+password')
        .exec();

      // Validate user existence and password
      if (!user || !(await user.isPasswordValid(password))) {
        return next(
          new ApiError(
            'Incorrect email or password. Please check your credentials and try again.',
            HttpStatusCode.UNAUTHORIZED
          )
        );
      }

      // Remove sensitive password field before continuing
      user.password = undefined;

      // Attach authenticated user and session preference to request object
      req.self = user;
      req.remember = remember;

      // Proceed to the next middleware (e.g., session/token generation)
      next();
    }
  );
}
