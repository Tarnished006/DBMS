import { Router, Request, Response, NextFunction } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
  UpdateFullNameSchema,
  ChangePasswordSchema,
  SetPasswordSchema,
  SendOtpSchema,
  VerifyOtpSchema,
} from '../utils/validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', (req: Request, res: Response, next: NextFunction) =>
  userController.getProfile(req, res, next)
);
router.get('/me/profile', (req: Request, res: Response, next: NextFunction) =>
  userController.getProfile(req, res, next)
);
router.patch(
  '/me/profile/full-name',
  validateBody(UpdateFullNameSchema),
  (req: Request, res: Response, next: NextFunction) => userController.updateFullName(req, res, next)
);
router.patch(
  '/me/profile-picture',
  uploadSingleImage.single('file'),
  (req: Request, res: Response, next: NextFunction) => userController.updateProfilePicture(req, res, next)
);
router.post(
  '/me/phone/send-otp',
  validateBody(SendOtpSchema),
  (req: Request, res: Response, next: NextFunction) => userController.sendPhoneOtp(req, res, next)
);
router.post(
  '/me/phone/verify-otp',
  validateBody(VerifyOtpSchema),
  (req: Request, res: Response, next: NextFunction) => userController.verifyPhoneOtp(req, res, next)
);
router.post(
  '/me/phone/resend-otp',
  validateBody(SendOtpSchema),
  (req: Request, res: Response, next: NextFunction) => userController.resendPhoneOtp(req, res, next)
);
router.patch(
  '/me/password',
  validateBody(ChangePasswordSchema),
  (req: Request, res: Response, next: NextFunction) => userController.changePassword(req, res, next)
);
router.patch(
  '/me/set-password',
  validateBody(SetPasswordSchema),
  (req: Request, res: Response, next: NextFunction) => userController.setPassword(req, res, next)
);
router.delete('/me/profile', (req: Request, res: Response, next: NextFunction) =>
  userController.deleteAccount(req, res, next)
);

export default router;
