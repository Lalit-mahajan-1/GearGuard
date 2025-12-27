import express from 'express';
import {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment
} from '../controllers/equipment.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getEquipment)
    .post(protect, authorize('Admin', 'Manager'), createEquipment);

router.route('/:id')
    .get(protect, getEquipmentById)
    .put(protect, authorize('Admin', 'Manager'), updateEquipment)
    .delete(protect, authorize('Admin'), deleteEquipment);

export default router;
