import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { orderService } from './order.service';

const filterableFields = ['searchTerm', 'status'];

const createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrder(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order placed successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const filters = pick(req.query, filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await orderService.getMyOrders(req.user.id, filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const filters = pick(req.query, filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await orderService.getAllOrders(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All orders fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const result = await orderService.getOrderById(
    req.params['id'] as string,
    req.user.id,
    req.user.role,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order fetched successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const result = await orderService.updateOrderStatus(
    req.params['id'] as string,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const orderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
