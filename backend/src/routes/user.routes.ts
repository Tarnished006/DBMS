import { Router } from 'express';
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

router.get('/me/profile', (req, res, next) => userController.getProfile(req, res, next));
router.patch('/me/profile/full-name', validateBody(UpdateFullNameSchema), (req, res, next) =>
  userController.updateFullName(req, res, next)
);
router.patch('/me/profile-picture', uploadSingleImage.single('file'), (req, res, next) =>
  userController.updateProfilePicture(req, res, next)
);
router.post('/me/phone/send-otp', validateBody(SendOtpSchema), (req, res, next) =>
  userController.sendPhoneOtp(req, res, next)
);
router.post('/me/phone/verify-otp', validateBody(VerifyOtpSchema), (req, res, next) =>
  userController.verifyPhoneOtp(req, res, next)
);
router.post('/me/phone/resend-otp', validateBody(SendOtpSchema), (req, res, next) =>
  userController.resendPhoneOtp(req, res, next)
);
router.patch('/me/password', validateBody(ChangePasswordSchema), (req, res, next) =>
  userController.changePassword(req, res, next)
);
router.patch('/me/set-password', validateBody(SetPasswordSchema), (req, res, next) =>
  userController.setPassword(req, res, next)
);
router.delete('/me/profile', (req, res, next) => userController.deleteAccount(req, res, next));

export default router;
