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

export default router;
