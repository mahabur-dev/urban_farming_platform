import express from 'express';
import { userController } from './user.controller';
import validationRequest from '../../middlewares/validationRequest';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../helper/fileUploder';
import { userRole } from './user.constant';

const router = express.Router();

router.post('/create-user', userController.createUser);

router.get(
  '/profile',
  auth(userRole.user, userRole.admin),
  userController.profile,
);
router.put(
  '/profile',
  auth(userRole.admin, userRole.user),
  fileUploader.upload.single('profileImage'),
  userController.updatedMyProfile,
);

router.get('/all-user', auth(userRole.admin), userController.getAllUser);
router.get('/:id', auth(userRole.admin), userController.getUserById);

router.delete('/:id', auth(userRole.admin), userController.deleteUserById);

export const userRoutes = router;
