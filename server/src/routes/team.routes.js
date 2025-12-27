import express from 'express';
import {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam
} from '../controllers/team.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTeams)
    .post(protect, authorize('Admin', 'Manager'), createTeam);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager'), updateTeam)
    .delete(protect, authorize('Admin'), deleteTeam);

export default router;
