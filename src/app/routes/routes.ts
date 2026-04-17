import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/user/user.routes';
import { vendorRoutes } from '../modules/vendor/vendor.routes';
import { produceRoutes } from '../modules/produce/produce.routes';
import { rentalSpaceRoutes } from '../modules/rentalSpace/rentalSpace.routes';
import { orderRoutes } from '../modules/order/order.routes';
import { communityPostRoutes } from '../modules/communityPost/communityPost.routes';
import { sustainabilityRoutes } from '../modules/sustainability/sustainability.routes';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/users', route: userRoutes },
  { path: '/vendors', route: vendorRoutes },
  { path: '/produce', route: produceRoutes },
  { path: '/rental-spaces', route: rentalSpaceRoutes },
  { path: '/orders', route: orderRoutes },
  { path: '/community', route: communityPostRoutes },
  { path: '/sustainability', route: sustainabilityRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
