import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add equipment name']
    },
    serialNumber: {
        type: String,
        required: [true, 'Please add serial number'],
        unique: true
    },
    description: {
        type: String
    },
    category: {
        type: String, // e.g., 'Heavy Machinery', 'Electronics', 'Vehicles'
    },
    location: {
        type: String,
        required: true
    },
    purchaseDate: {
        type: Date
    },
    warrantyExpiration: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Operational', 'Down', 'Under Maintenance', 'Scrapped'],
        default: 'Operational'
    },
    assignedDepartment: {
        type: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Employee assigned to this equipment
    },
    maintenanceTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceTeam', // Default team responsible for this equipment
        required: true
    },
    defaultTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate warranty status
equipmentSchema.virtual('isWarrantyActive').get(function() {
    if (!this.warrantyExpiration) return false;
    return this.warrantyExpiration > new Date();
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;
