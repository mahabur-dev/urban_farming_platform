import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { communityPostService } from './communityPost.service';

const filterableFields = ['searchTerm'];

const createPost = catchAsync(async (req, res) => {
  const result = await communityPostService.createPost(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req, res) => {
  const filters = pick(req.query, filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await communityPostService.getAllPosts(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Posts fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getPostById = catchAsync(async (req, res) => {
  const result = await communityPostService.getPostById(req.params['id'] as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post fetched successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const result = await communityPostService.updatePost(
    req.params['id'] as string,
    req.user.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const result = await communityPostService.deletePost(
    req.params['id'] as string,
    req.user.id,
    req.user.role,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});

export const communityPostController = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
