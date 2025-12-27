import express from 'express';
import {
    getRequests,
    getRequestById,
    getScheduledRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    addNote,
    getHoursWorkedByTechnician,
    getAnalyticsSummary
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

// Analytics: hours per technician (Repaired)
router.route('/analytics/hours')
    .get(protect, authorize('Admin', 'Manager', 'Technician'), getHoursWorkedByTechnician);

// Analytics: summary totals
router.route('/analytics/summary')
    .get(protect, authorize('Admin', 'Manager', 'Technician'), getAnalyticsSummary);

export default router;
