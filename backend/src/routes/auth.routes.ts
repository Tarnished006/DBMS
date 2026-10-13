import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { RegistrationSchema, LoginSchema } from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validateBody(RegistrationSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', validateBody(LoginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/refresh-token', (req, res, next) =>
  authController.refreshToken(req, res, next)
);

router.post('/logout', (req, res, next) =>
  authController.logout(req, res, next)
);

router.post('/logout-all', authMiddleware, (req, res, next) =>
  authController.logoutAll(req, res, next)
);

router.get('/verify-email', (req, res, next) =>
  authController.verifyEmail(req, res, next)
);

router.post('/resend-verification-email', (req, res, next) =>
  authController.resendVerificationEmail(req, res, next)
);

router.post('/forgot-password', (req, res, next) =>
  authController.forgotPassword(req, res, next)
);

router.post('/reset-password', (req, res, next) =>
  authController.resetPassword(req, res, next)
);

router.post('/oauth2/exchange', (req, res, next) =>
  authController.oauth2Exchange(req, res, next)
);

export default router;
