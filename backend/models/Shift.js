const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    task: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        default: '',
    },
    completed: {
        type: Boolean,
        default: false,
    },
    appliedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Shift', shiftSchema);
