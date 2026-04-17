import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { rentalSpaceService } from './rentalSpace.service';

const filterableFields = ['searchTerm', 'availability'];

const createRentalSpace = catchAsync(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await rentalSpaceService.createRentalSpace(req.user.id, payload, req.file);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Rental space created successfully',
    data: result,
  });
});

const getAllRentalSpaces = catchAsync(async (req, res) => {
  const filters = pick(req.query, filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await rentalSpaceService.getAllRentalSpaces(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rental spaces fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyRentalSpaces = catchAsync(async (req, res) => {
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await rentalSpaceService.getMyRentalSpaces(req.user.id, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your rental spaces fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getRentalSpaceById = catchAsync(async (req, res) => {
  const result = await rentalSpaceService.getRentalSpaceById(req.params['id'] as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rental space fetched successfully',
    data: result,
  });
});

const updateRentalSpace = catchAsync(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await rentalSpaceService.updateRentalSpace(
    req.params['id'] as string,
    req.user.id,
    payload,
    req.file,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rental space updated successfully',
    data: result,
  });
});

const deleteRentalSpace = catchAsync(async (req, res) => {
  const result = await rentalSpaceService.deleteRentalSpace(
    req.params['id'] as string,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Rental space deleted successfully',
    data: result,
  });
});

export const rentalSpaceController = {
  createRentalSpace,
  getAllRentalSpaces,
  getMyRentalSpaces,
  getRentalSpaceById,
  updateRentalSpace,
  deleteRentalSpace,
};
