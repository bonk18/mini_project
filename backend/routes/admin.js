const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const User = require('../models/User');
const Shift = require('../models/Shift');

// Middleware to check if user is organizer/admin
const isOrganizer = (req, res, next) => {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin' && req.user.role !== 'coordinator') {
        return res.status(403).json({ message: 'Access denied. Organizer role required.' });
    }
    next();
};

// Get all volunteers
router.get('/volunteers', verifyToken, isOrganizer, async (req, res) => {
    try {
        const volunteers = await User.find({ role: 'volunteer' }).select('-password');
        res.status(200).json(volunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({ message: 'Server error fetching volunteers' });
    }
});

// Get all shifts with populated user data
router.get('/shifts', verifyToken, isOrganizer, async (req, res) => {
    try {
        const shifts = await Shift.find()
            .populate('appliedUsers', 'username name email contact')
            .populate('assignedUsers', 'username name email contact');
        res.status(200).json(shifts);
    } catch (error) {
        console.error('Error fetching shifts:', error);
        res.status(500).json({ message: 'Server error fetching shifts' });
    }
});

// Create a new shift
router.post('/shifts/create', verifyToken, isOrganizer, async (req, res) => {
    try {
        const { date, time, location, task, action } = req.body;

        // Validate required fields
        if (!date || !time || !location || !task) {
            return res.status(400).json({
                message: 'All fields (date, time, location, task) are required'
            });
        }

        // Create new shift
        const newShift = new Shift({
            date,
            time,
            location,
            task,
            action: action || '',
            appliedUsers: [],
            assignedUsers: []
        });

        await newShift.save();

        res.status(201).json({
            message: 'Shift created successfully',
            shift: newShift
        });
    } catch (error) {
        console.error('Error creating shift:', error);
        res.status(500).json({ message: 'Server error creating shift' });
    }
});

// Delete a volunteer
router.delete('/volunteers/:id', verifyToken, isOrganizer, async (req, res) => {
    try {
        const { id } = req.params;
        const volunteer = await User.findByIdAndDelete(id);

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        res.status(200).json({ message: 'Volunteer deleted successfully' });
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        res.status(500).json({ message: 'Server error deleting volunteer' });
    }
});

// Cancel/delete a shift
router.delete('/shifts/:id', verifyToken, isOrganizer, async (req, res) => {
    try {
        const { id } = req.params;
        const shift = await Shift.findByIdAndDelete(id);

        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        res.status(200).json({ message: 'Shift deleted successfully' });
    } catch (error) {
        console.error('Error deleting shift:', error);
        res.status(500).json({ message: 'Server error deleting shift' });
    }
});

// Assign user to shift
router.post('/shifts/:shiftId/assign/:userId', verifyToken, isOrganizer, async (req, res) => {
    try {
        const { shiftId, userId } = req.params;

        const shift = await Shift.findById(shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Check if user already assigned
        if (shift.assignedUsers.includes(userId)) {
            return res.status(400).json({ message: 'User already assigned to this shift' });
        }

        shift.assignedUsers.push(userId);
        await shift.save();

        res.status(200).json({ message: 'User assigned to shift successfully', shift });
    } catch (error) {
        console.error('Error assigning user to shift:', error);
        res.status(500).json({ message: 'Server error assigning user' });
    }
});

// Approve volunteer application (move from applied to assigned)
router.post('/shifts/:shiftId/approve/:userId', verifyToken, isOrganizer, async (req, res) => {
    try {
        const { shiftId, userId } = req.params;

        const shift = await Shift.findById(shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Check if user has applied
        if (!shift.appliedUsers.includes(userId)) {
            return res.status(400).json({ message: 'User has not applied for this shift' });
        }

        // Check if already assigned
        if (shift.assignedUsers.includes(userId)) {
            return res.status(400).json({ message: 'User already assigned to this shift' });
        }

        // Move from applied to assigned
        shift.appliedUsers = shift.appliedUsers.filter(id => id.toString() !== userId);
        shift.assignedUsers.push(userId);
        await shift.save();

        res.status(200).json({ message: 'Application approved successfully', shift });
    } catch (error) {
        console.error('Error approving application:', error);
        res.status(500).json({ message: 'Server error approving application' });
    }
});

// Deny volunteer application (remove from applied)
router.post('/shifts/:shiftId/deny/:userId', verifyToken, isOrganizer, async (req, res) => {
    try {
        const { shiftId, userId } = req.params;

        const shift = await Shift.findById(shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Check if user has applied
        if (!shift.appliedUsers.includes(userId)) {
            return res.status(400).json({ message: 'User has not applied for this shift' });
        }

        // Remove from applied users
        shift.appliedUsers = shift.appliedUsers.filter(id => id.toString() !== userId);
        await shift.save();

        res.status(200).json({ message: 'Application denied successfully', shift });
    } catch (error) {
        console.error('Error denying application:', error);
        res.status(500).json({ message: 'Server error denying application' });
    }
});

// Mark shift as completed
router.post('/shifts/:shiftId/complete', verifyToken, isOrganizer, async (req, res) => {
    try {
        const { shiftId } = req.params;

        const shift = await Shift.findById(shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // Mark as completed
        shift.completed = true;
        await shift.save();

        res.status(200).json({ message: 'Shift marked as completed successfully', shift });
    } catch (error) {
        console.error('Error marking shift as completed:', error);
        res.status(500).json({ message: 'Server error marking shift as completed' });
    }
});

// Get statistics data
router.get('/statistics', verifyToken, isOrganizer, async (req, res) => {
    try {
        // Get total volunteers
        const totalVolunteers = await User.countDocuments({ role: 'volunteer' });

        // Get all shifts
        const allShifts = await Shift.find();
        const totalShifts = allShifts.length;

        // Calculate completed shifts (those with assigned users)
        const completedShifts = allShifts.filter(shift =>
            shift.assignedUsers && shift.assignedUsers.length > 0
        ).length;

        const shiftsLeft = totalShifts - completedShifts;

        // Get all volunteers with their shift counts
        const volunteers = await User.find({ role: 'volunteer' }).select('username name');

        // Calculate shifts per volunteer (approximate hours calculation - only completed shifts)
        const volunteerShiftCounts = await Promise.all(
            volunteers.map(async (volunteer) => {
                const assignedShiftCount = await Shift.countDocuments({
                    assignedUsers: volunteer._id,
                    completed: true // Only count completed shifts
                });
                return {
                    volunteerId: volunteer._id,
                    name: volunteer.name || volunteer.username,
                    shiftsCount: assignedShiftCount,
                    hoursWorked: assignedShiftCount * 4 // Assuming 4 hours per shift average
                };
            })
        );

        // Sort by hours worked and get top 15
        const topVolunteers = volunteerShiftCounts
            .sort((a, b) => b.hoursWorked - a.hoursWorked)
            .slice(0, 15);

        // Calculate average hours
        const totalHours = volunteerShiftCounts.reduce((sum, v) => sum + v.hoursWorked, 0);
        const averageHours = totalVolunteers > 0 ? Math.round(totalHours / totalVolunteers) : 0;

        // Group shifts by task/category
        const shiftsByTask = {};
        allShifts.forEach(shift => {
            const task = shift.task || 'Other';
            shiftsByTask[task] = (shiftsByTask[task] || 0) + 1;
        });

        // Calculate volunteers assigned to each task category
        const volunteersByTask = {};
        const hoursByTask = {};

        for (const shift of allShifts) {
            const task = shift.task || 'Other';
            if (shift.assignedUsers && shift.assignedUsers.length > 0) {
                volunteersByTask[task] = (volunteersByTask[task] || 0) + shift.assignedUsers.length;
                // Only count hours for completed shifts
                if (shift.completed) {
                    hoursByTask[task] = (hoursByTask[task] || 0) + (shift.assignedUsers.length * 4);
                }
            }
        }

        res.status(200).json({
            totalVolunteers,
            totalShifts,
            completedShifts,
            shiftsLeft,
            averageHours,
            averageRating: 4.5, // Placeholder - would need rating system
            topVolunteers,
            shiftsByTask,
            volunteersByTask,
            hoursByTask
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Server error fetching statistics' });
    }
});

module.exports = router;
