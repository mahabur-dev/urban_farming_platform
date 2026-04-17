import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { produceService } from './produce.service';

const filterableFields = ['searchTerm', 'category', 'certificationStatus'];

const createProduce = catchAsync(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await produceService.createProduce(req.user.id, payload, req.file);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Produce created successfully',
    data: result,
  });
});

const getAllProduce = catchAsync(async (req, res) => {
  const filters = pick(req.query, filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await produceService.getAllProduce(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Produce fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyProduce = catchAsync(async (req, res) => {
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await produceService.getMyProduce(req.user.id, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your produce fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getProduceById = catchAsync(async (req, res) => {
  const result = await produceService.getProduceById(req.params['id'] as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Produce fetched successfully',
    data: result,
  });
});

const updateProduce = catchAsync(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await produceService.updateProduce(
    req.params['id'] as string,
    req.user.id,
    payload,
    req.file,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Produce updated successfully',
    data: result,
  });
});

const deleteProduce = catchAsync(async (req, res) => {
  const result = await produceService.deleteProduce(
    req.params['id'] as string,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Produce deleted successfully',
    data: result,
  });
});

const approveProduce = catchAsync(async (req, res) => {
  const result = await produceService.approveProduce(
    req.params['id'] as string,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Produce ${req.body.status} successfully`,
    data: result,
  });
});

export const produceController = {
  createProduce,
  getAllProduce,
  getMyProduce,
  getProduceById,
  updateProduce,
  deleteProduce,
  approveProduce,
};
