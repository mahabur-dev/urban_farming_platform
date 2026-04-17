import express from 'express';
import { sustainabilityController } from './sustainability.controller';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../helper/fileUploder';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post(
  '/',
  auth(userRole.vendor),
  fileUploader.upload.single('document'),
  sustainabilityController.submitCert,
);

router.get('/my', auth(userRole.vendor), sustainabilityController.getMyCerts);

router.get('/all', auth(userRole.admin), sustainabilityController.getAllCerts);

router.patch('/:id/status', auth(userRole.admin), sustainabilityController.updateCertStatus);

export const sustainabilityRoutes = router;
