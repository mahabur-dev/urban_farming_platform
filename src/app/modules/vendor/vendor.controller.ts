import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { vendorService } from './vendor.service';

const filterableFields = ['searchTerm', 'certificationStatus'];

const createVendorProfile = catchAsync(async (req, res) => {
  const result = await vendorService.createVendorProfile(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Vendor profile created successfully',
    data: result,
  });
});

const getMyVendorProfile = catchAsync(async (req, res) => {
  const result = await vendorService.getMyVendorProfile(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Vendor profile fetched successfully',
    data: result,
  });
});

const updateMyVendorProfile = catchAsync(async (req, res) => {
  const result = await vendorService.updateMyVendorProfile(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Vendor profile updated successfully',
    data: result,
  });
});

const getAllVendors = catchAsync(async (req, res) => {
  const filters = pick(req.query, filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await vendorService.getAllVendors(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Vendors fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getVendorById = catchAsync(async (req, res) => {
  const result = await vendorService.getVendorById(req.params['id'] as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Vendor fetched successfully',
    data: result,
  });
});

const updateCertificationStatus = catchAsync(async (req, res) => {
  const result = await vendorService.updateCertificationStatus(
    req.params['id'] as string,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Vendor certification ${req.body.status} successfully`,
    data: result,
  });
});

export const vendorController = {
  createVendorProfile,
  getMyVendorProfile,
  updateMyVendorProfile,
  getAllVendors,
  getVendorById,
  updateCertificationStatus,
};
