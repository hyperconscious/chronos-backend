import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', auth, NotificationController.getNotifications);

router.get('/:id', auth, NotificationController.getNotificationById);

router.post('/', auth, NotificationController.createNotification);

router.patch('/:id/read', auth, NotificationController.markNotificationAsRead);

router.delete('/:id', auth, NotificationController.deleteNotification);

export default router;
