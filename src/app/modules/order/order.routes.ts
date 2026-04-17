import express from 'express';
import { orderController } from './order.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post('/', auth(userRole.customer), orderController.createOrder);

router.get('/my', auth(userRole.customer), orderController.getMyOrders);

router.get(
  '/all',
  auth(userRole.admin, userRole.vendor),
  orderController.getAllOrders,
);

router.get(
  '/:id',
  auth(userRole.admin, userRole.vendor, userRole.customer),
  orderController.getOrderById,
);

router.patch(
  '/:id/status',
  auth(userRole.admin, userRole.vendor),
  orderController.updateOrderStatus,
);

export const orderRoutes = router;
