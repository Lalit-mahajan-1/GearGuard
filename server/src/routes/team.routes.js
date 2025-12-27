import express from 'express';
import {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getMyTeamMembers
} from '../controllers/team.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTeams)
    .post(protect, authorize('Admin', 'Manager'), createTeam);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager'), updateTeam)
    .delete(protect, authorize('Admin'), deleteTeam);

// Logged-in user's team members (technicians see their team; managers/admins can query all or a specific team via ?team=ID)
router.get('/mine/members', protect, getMyTeamMembers);

export default router;
