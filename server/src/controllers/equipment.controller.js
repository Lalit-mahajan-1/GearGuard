import Equipment from '../models/equipment.model.js';
import MaintenanceRequest from '../models/maintenanceRequest.model.js';

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
export const getEquipment = async (req, res) => {
    const equipment = await Equipment.find()
        .populate('maintenanceTeam', 'name')
        .populate('assignedTo', 'name');
    res.json(equipment);
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
export const getEquipmentById = async (req, res) => {
    const equipment = await Equipment.findById(req.params.id)
        .populate('maintenanceTeam', 'name')
        .populate('assignedTo', 'name');

    if (equipment) {
        // Smart Button Logic: Count open requests
        const openRequestsCount = await MaintenanceRequest.countDocuments({
            equipment: req.params.id,
            status: { $in: ['New', 'In Progress'] }
        });
        
        res.json({ ...equipment.toObject(), openRequestsCount });
    } else {
        res.status(404);
        throw new Error('Equipment not found');
    }
};

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private/Admin/Manager
export const createEquipment = async (req, res) => {
    let imagePath = '';
    if (req.file) {
        imagePath = `http://localhost:${process.env.PORT}/uploads/${req.file.filename}`;
    }

    const {
        name,
        serialNumber,
        location,
        purchaseDate,
        warrantyExpiration,
        status,
        assignedDepartment,
        assignedTo,
        maintenanceTeam,
        defaultTechnician,
        category
    } = req.body;

    const equipment = await Equipment.create({
        name,
        serialNumber,
        location,
        purchaseDate,
        warrantyExpiration,
        status,
        assignedDepartment,
        assignedTo,
        maintenanceTeam,
        defaultTechnician,
        category,
        image: imagePath
    });

    res.status(201).json(equipment);
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private/Admin/Manager
export const updateEquipment = async (req, res) => {
    const equipment = await Equipment.findById(req.params.id);

    if (equipment) {
        const updatedEquipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedEquipment);
    } else {
        res.status(404);
        throw new Error('Equipment not found');
    }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
export const deleteEquipment = async (req, res) => {
    const equipment = await Equipment.findById(req.params.id);

    if (equipment) {
        await equipment.deleteOne();
        res.json({ message: 'Equipment removed' });
    } else {
        res.status(404);
        throw new Error('Equipment not found');
    }
};
