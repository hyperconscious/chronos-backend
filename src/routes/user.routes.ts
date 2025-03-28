import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { uploadSingle } from '../config/file-upload.config';
import { auth } from '../middlewares/auth.middleware';
const userRouter = Router();

userRouter.get('/', auth, UserController.getAllUsers);

userRouter.post(
  '/',
  auth,
  UserController.createUser,
);

userRouter.get('/my-profile', auth, UserController.getUserById);
userRouter.patch(
  '/:user_id/avatar',
  auth,
  uploadSingle,
  UserController.uploadAvatar,
);

userRouter.get('/:user_id', auth, UserController.getUserById);
userRouter.get('/mail/:email', auth, UserController.getUserByMail);

userRouter.patch('/:user_id', auth, UserController.updateUser);

userRouter.delete('/:user_id', auth, UserController.deleteUser);

export default userRouter;
