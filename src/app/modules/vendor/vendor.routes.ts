import express from 'express';
import { vendorController } from './vendor.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post('/profile', auth(userRole.vendor), vendorController.createVendorProfile);
router.get('/profile/me', auth(userRole.vendor), vendorController.getMyVendorProfile);
router.put('/profile/me', auth(userRole.vendor), vendorController.updateMyVendorProfile);

router.get('/all', auth(userRole.admin), vendorController.getAllVendors);
router.get('/:id', auth(userRole.admin), vendorController.getVendorById);
router.patch('/:id/status', auth(userRole.admin), vendorController.updateCertificationStatus);

export const vendorRoutes = router;
