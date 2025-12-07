const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['volunteer', 'coordinator', 'admin', 'organizer'],
        default: 'volunteer',
    },
    name: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    contact: {
        type: String,
        default: '',
    },
    profilePicture: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
