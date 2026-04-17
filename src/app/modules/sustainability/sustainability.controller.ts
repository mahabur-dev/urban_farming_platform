import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { sustainabilityService } from './sustainability.service';

const filterableFields = ['searchTerm', 'status'];

const submitCert = catchAsync(async (req, res) => {
  const payload = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await sustainabilityService.submitCert(req.user.id, payload, req.file);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Sustainability certificate submitted successfully',
    data: result,
  });
});

const getMyCerts = catchAsync(async (req, res) => {
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await sustainabilityService.getMyCerts(req.user.id, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your certificates fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllCerts = catchAsync(async (req, res) => {
  const filters = pick(req.query, filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await sustainabilityService.getAllCerts(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All certificates fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateCertStatus = catchAsync(async (req, res) => {
  const result = await sustainabilityService.updateCertStatus(
    req.params['id'] as string,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Certificate ${req.body.status} successfully`,
    data: result,
  });
});

export const sustainabilityController = {
  submitCert,
  getMyCerts,
  getAllCerts,
  updateCertStatus,
};
