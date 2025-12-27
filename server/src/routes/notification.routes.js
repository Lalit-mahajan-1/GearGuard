import express from 'express';
import { getNotifications, markNotificationsRead } from '../controllers/notification.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications);

router.route('/read')
    .put(protect, markNotificationsRead);

export default router;
