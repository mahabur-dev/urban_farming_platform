import express from 'express';
import { rentalSpaceController } from './rentalSpace.controller';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../helper/fileUploder';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post(
  '/',
  auth(userRole.vendor),
  fileUploader.upload.single('image'),
  rentalSpaceController.createRentalSpace,
);

router.get('/', rentalSpaceController.getAllRentalSpaces);

router.get('/my', auth(userRole.vendor), rentalSpaceController.getMyRentalSpaces);

router.get('/:id', rentalSpaceController.getRentalSpaceById);

router.put(
  '/:id',
  auth(userRole.vendor),
  fileUploader.upload.single('image'),
  rentalSpaceController.updateRentalSpace,
);

router.delete('/:id', auth(userRole.vendor), rentalSpaceController.deleteRentalSpace);

export const rentalSpaceRoutes = router;
