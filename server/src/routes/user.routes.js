import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import { getUserHistory } from '../controllers/userHistory.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// protect middleware is used for all routes below
router.use(protect);

// Specific routes first to avoid catching by :id
router.get('/:id/history', getUserHistory);

// Admin only routes
router.use(authorize('Admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

export default router;
