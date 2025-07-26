import { rateLimiter, runSchema } from '@server/middleware';
import express from 'express';
import { authControllerHub, authGuard } from '../controllers/authControllerHub';
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

router.post('/refresh-token', authControllerHub.refreshToken);

router.use(
  authGuard.validateToken,
  authGuard.requireAuth,
  authGuard.restrictTo('seller', 'admin')
);

router.post('/signout', authControllerHub.signout);
router.post(
  '/sessions/:token/revoke',
  authSchema.signoutSession,
  runSchema,
  authControllerHub.signoutSession
);

router.post(
  '/sessions/revoke-all',
  rateLimiter({
    max: 5,
    message:
      'You’ve made too many requests to revoke all sessions. Please wait 15 minutes and try again.',
  }),
  authControllerHub.signoutAllSession
);
// // ================== Manage user information ==================
router.route('/me').get(authControllerHub.getProfile);

export default router;
