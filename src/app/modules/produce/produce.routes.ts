import express from 'express';
import { produceController } from './produce.controller';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../helper/fileUploder';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post(
  '/',
  auth(userRole.vendor),
  fileUploader.upload.single('image'),
  produceController.createProduce,
);

router.get('/', produceController.getAllProduce);

router.get('/my', auth(userRole.vendor), produceController.getMyProduce);

router.get('/:id', produceController.getProduceById);

router.put(
  '/:id',
  auth(userRole.vendor),
  fileUploader.upload.single('image'),
  produceController.updateProduce,
);

router.delete('/:id', auth(userRole.vendor), produceController.deleteProduce);

router.patch('/:id/status', auth(userRole.admin), produceController.approveProduce);

export const produceRoutes = router;
