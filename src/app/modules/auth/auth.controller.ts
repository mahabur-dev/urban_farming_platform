import config from '../../config';
import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import { authService } from './auth.service';

const registerUser = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Registration successful. Please check your email for OTP verification.',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login successful',
    data: { accessToken: result.accessToken, user: result.user },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const result = await authService.refreshToken(req.cookies.refreshToken);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent to your email',
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.body.email, req.body.otp);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Email verified successfully',
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(req.body.email, req.body.newPassword);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successfully',
    data: { accessToken: result.accessToken, user: result.user },
  });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(
    req.user.id,
    req.body.oldPassword,
    req.body.newPassword,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
  });
});

const logoutUser = catchAsync(async (_req, res) => {
  res.clearCookie('refreshToken');
  sendResponse(res, { statusCode: 200, success: true, message: 'Logged out successfully' });
});

export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  forgotPassword,
  verifyEmail,
  resetPassword,
  changePassword,
  logoutUser,
};
