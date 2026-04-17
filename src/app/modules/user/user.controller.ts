import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { userService } from './user.service';
import { userFilterableFields } from './user.constant';

const createUser = catchAsync(async (req, res) => {
  const result = await userService.createUser(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await userService.getAllUsers(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const result = await userService.getUserById(req.params['id'] as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const updateUserById = catchAsync(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await userService.updateUserById(
    req.params['id'] as string,
    payload,
    req.file,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUserById = catchAsync(async (req, res) => {
  const result = await userService.deleteUserById(req.params['id'] as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const result = await userService.getMyProfile(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await userService.updateMyProfile(req.user.id, payload, req.file);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getMyProfile,
  updateMyProfile,
};
