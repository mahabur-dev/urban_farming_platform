import express from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import config from '../../config';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, authController.registerUser);
router.post('/login', authLimiter, authController.loginUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logoutUser);
router.post(
  '/change-password',
  auth(userRole.admin, userRole.vendor, userRole.customer),
  authController.changePassword,
);

export const authRoutes = router;
