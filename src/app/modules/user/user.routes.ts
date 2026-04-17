import express from 'express';
import { userController } from './user.controller';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../helper/fileUploder';
import { userRole } from './user.constant';

const router = express.Router();

router.post('/create-user', auth(userRole.admin), userController.createUser);

router.get(
  '/profile',
  auth(userRole.admin, userRole.vendor, userRole.customer),
  userController.getMyProfile,
);

router.put(
  '/profile',
  auth(userRole.admin, userRole.vendor, userRole.customer),
  fileUploader.upload.single('profileImage'),
  userController.updateMyProfile,
);

router.get('/all', auth(userRole.admin), userController.getAllUsers);

router.get('/:id', auth(userRole.admin), userController.getUserById);

router.put(
  '/:id',
  auth(userRole.admin),
  fileUploader.upload.single('profileImage'),
  userController.updateUserById,
);

router.delete('/:id', auth(userRole.admin), userController.deleteUserById);

export const userRoutes = router;
