import express from 'express';
import {
    getRequests,
    getRequestById,
    getScheduledRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    addNote
} from '../controllers/request.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getRequests)
    .post(protect, createRequest);

router.route('/calendar/scheduled')
    .get(protect, getScheduledRequests);

router.route('/:id')
    .get(protect, getRequestById)
    .put(protect, authorize('Admin', 'Manager', 'Technician'), updateRequest) // Technicians can update (e.g. status, duration)
    .delete(protect, authorize('Admin'), deleteRequest);

router.route('/:id/notes')
    .post(protect, addNote);

export default router;
