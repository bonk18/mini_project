const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const Shift = require('../models/Shift');

// Route to get all available shifts (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Server error fetching shifts' });
  }
});

// Apply for a shift (protected route)
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const { shiftId } = req.body;
    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Check if the user has already applied for this shift
    if (shift.appliedUsers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You have already applied for this shift.' });
    }

    // Add the user to the applied users list
    shift.appliedUsers.push(req.user.userId);
    await shift.save();

    res.status(200).json({ message: 'Shift application successful.' });
  } catch (error) {
    console.error('Error applying for shift:', error);
    res.status(500).json({ message: 'Server error applying for shift' });
  }
});

// Route to get assigned shifts for the logged-in user
router.get('/assigned', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const assignedShifts = await Shift.find({ assignedUsers: userId });
    res.json(assignedShifts);
  } catch (error) {
    console.error('Error fetching assigned shifts:', error);
    res.status(500).json({ message: 'Server error fetching assigned shifts' });
  }
});

// Route to get completed shifts for the logged-in user
router.get('/completed', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const completedShifts = await Shift.find({
      assignedUsers: userId,
      completed: true
    });
    res.json(completedShifts);
  } catch (error) {
    console.error('Error fetching completed shifts:', error);
    res.status(500).json({ message: 'Server error fetching completed shifts' });
  }
});

// Route for volunteers to cancel their assigned shift
router.post('/:shiftId/cancel', verifyToken, async (req, res) => {
  try {
    const { shiftId } = req.params;
    const userId = req.user.userId;

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Remove user from assignedUsers
    shift.assignedUsers = shift.assignedUsers.filter(id => id.toString() !== userId);
    await shift.save();

    res.status(200).json({ message: 'Shift cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling shift:', error);
    res.status(500).json({ message: 'Server error cancelling shift' });
  }
});

module.exports = router;
