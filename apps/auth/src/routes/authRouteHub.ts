import { rateLimiter, runSchema } from '@server/middleware';
import express from 'express';
import authControllerHub from '../controllers/authControllerHub';
import { authSchema } from '../middlewares/validations/auth/authSchema';

const router = express.Router();

router.post(
  '/signup',
  rateLimiter({
    max: 10,
    message:
      'You’ve tried to sign up too many times. Please wait 15 minutes before trying again.',
  }),
  authSchema.signup,
  runSchema,
  authControllerHub.signup
);

router.post(
  '/verify-email',
  rateLimiter({
    max: 5,
    message:
      'Too many email verification attempts detected. Please wait 15 minutes before trying again.',
  }),
  authSchema.verifyEmail,
  runSchema,
  authControllerHub.verifyEmail
);

router.post(
  '/signin',
  rateLimiter({
    max: 500,
    message:
      'Too many sign-in attempts. Please wait 15 minutes before trying again.',
  }),
  authSchema.signin,
  runSchema,
  authControllerHub.signin,
  authControllerHub.createSession()
);

export default router;
