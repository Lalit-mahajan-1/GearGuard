import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import bcrypt from 'bcryptjs';

import User from './src/models/user.model.js';
import MaintenanceTeam from './src/models/maintenanceTeam.model.js';
import Equipment from './src/models/equipment.model.js';
import MaintenanceRequest from './src/models/maintenanceRequest.model.js';
import connectDB from './src/config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await MaintenanceRequest.deleteMany();
        await Equipment.deleteMany();
        await MaintenanceTeam.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed...'.red.inverse);

        // Created Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: '123456', // Will be hashed by pre-save hooks on model but doing manually here to be safe/fast or skip hook? 
            // Wait, I defined pre-save hook. So passing plain text '123456' is fine if I use User.create.
            // But if I pass already hashed password, it might double hash if not careful.
            // My User model checks `isModified('password')`.
            // So I should pass PLAIN text if I rely on the hook.
            role: 'Admin'
        });

        const managerUser = await User.create({
            name: 'Manager Mike',
            email: 'manager@example.com',
            password: '123456',
            role: 'Manager'
        });

        const tech1 = await User.create({
            name: 'Tech Tom',
            email: 'tom@example.com',
            password: '123456',
            role: 'Technician'
        });

         const tech2 = await User.create({
            name: 'Sparky Steve',
            email: 'steve@example.com',
            password: '123456',
            role: 'Technician'
        });

        console.log('Users Imported...'.green.inverse);

        // Create Teams
        const mechanicsTeam = await MaintenanceTeam.create({
            name: 'Mechanics',
            description: 'Handles all mechanical issues',
            members: [tech1._id],
            specialization: 'Mechanical'
        });

        const electricalTeam = await MaintenanceTeam.create({
            name: 'Electrical',
            description: 'Handles all electrical components',
            members: [tech2._id],
            specialization: 'Electrical'
        });

        console.log('Teams Imported...'.green.inverse);

        // Create Equipment
        const eq1 = await Equipment.create({
            name: 'Conveyor Belt A1',
            serialNumber: 'SN-001',
            location: 'Zone A',
            maintenanceTeam: mechanicsTeam._id,
            defaultTechnician: tech1._id,
            status: 'Operational',
            assignedTo: managerUser._id
        });

        const eq2 = await Equipment.create({
            name: 'Hydraulic Press HP-500',
            serialNumber: 'SN-002',
            location: 'Zone B',
            maintenanceTeam: mechanicsTeam._id,
            status: 'Under Maintenance',
            assignedTo: managerUser._id
        });

        const eq3 = await Equipment.create({
            name: 'Main Switchboard',
            serialNumber: 'SN-003',
            location: 'Electrical Room',
            maintenanceTeam: electricalTeam._id,
            defaultTechnician: tech2._id,
            status: 'Operational'
        });

        console.log('Equipment Imported...'.green.inverse);

        // Create Requests with dates
        await MaintenanceRequest.create({
            subject: 'Belt slipping',
            description: 'The conveyor belt is slipping under heavy load.',
            equipment: eq1._id,
            assignedTeam: mechanicsTeam._id,
            assignedTechnician: tech1._id,
            requestedBy: managerUser._id,
            priority: 'High',
            status: 'Repaired',
            scheduledDate: new Date(2025, 11, 28),
            startDate: new Date(2025, 11, 27, 10),
            completionDate: new Date(2025, 11, 27, 14),
            duration: 4
        });

         await MaintenanceRequest.create({
            subject: 'Oil Leak Check',
            description: 'Routine check for oil leaks in the hydraulic system.',
            equipment: eq2._id,
            assignedTeam: mechanicsTeam._id,
            assignedTechnician: tech1._id,
            requestedBy: managerUser._id,
            priority: 'Normal',
            status: 'In Progress',
            scheduledDate: new Date(2025, 11, 30),
            startDate: new Date(2025, 11, 28, 9),
            duration: 6
        });

         await MaintenanceRequest.create({
            subject: 'Fuse Replacement',
            description: 'Main fuse needs replacement.',
            equipment: eq3._id,
            assignedTeam: electricalTeam._id,
            assignedTechnician: tech2._id,
            requestedBy: managerUser._id,
            priority: 'Critical',
            status: 'New',
            scheduledDate: new Date(2025, 11, 29),
            duration: 2
        });

        console.log('Requests Imported...'.green.inverse);
        console.log('DATA IMPORTED!'.green.inverse);
        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
}

importData();
