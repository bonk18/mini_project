const mongoose = require('mongoose');
const Shift = require('./models/Shift');
require('dotenv').config();

const connectDB = require('./config/db');

// Sample shifts data
const sampleShifts = [
    { date: '2024-10-20', time: '09:00-12:00', location: 'Sihlcity', task: 'Cinemasupport', appliedUsers: [], assignedUsers: [] },
    { date: '2024-10-21', time: '14:00-18:00', location: 'Frauenbadi', task: 'Bar', appliedUsers: [], assignedUsers: [] },
    { date: '2024-10-22', time: '08:00-11:00', location: 'Festivalcentre', task: 'Information Desk', appliedUsers: [], assignedUsers: [] },
    { date: '2024-10-23', time: '10:00-14:00', location: 'City Center', task: 'Registration Desk', appliedUsers: [], assignedUsers: [] },
    { date: '2024-10-24', time: '15:00-19:00', location: 'Community Hall', task: 'Event Support', appliedUsers: [], assignedUsers: [] },
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing shifts
        await Shift.deleteMany({});
        console.log('Cleared existing shifts');

        // Insert sample shifts
        await Shift.insertMany(sampleShifts);
        console.log('Sample shifts added successfully');

        console.log('Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
