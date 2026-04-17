import express from 'express';
import { communityPostController } from './communityPost.controller';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';

const router = express.Router();

router.post(
  '/',
  auth(userRole.admin, userRole.vendor, userRole.customer),
  communityPostController.createPost,
);

router.get('/', communityPostController.getAllPosts);

router.get('/:id', communityPostController.getPostById);

router.put(
  '/:id',
  auth(userRole.admin, userRole.vendor, userRole.customer),
  communityPostController.updatePost,
);

router.delete(
  '/:id',
  auth(userRole.admin, userRole.vendor, userRole.customer),
  communityPostController.deletePost,
);

export const communityPostRoutes = router;
