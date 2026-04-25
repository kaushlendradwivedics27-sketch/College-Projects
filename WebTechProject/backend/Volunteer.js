const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Volunteer name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['Pickup Driver', 'Coordinator', 'Volunteer'],
        default: 'Volunteer'
    },
    pickups: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    status: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available'
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    ngo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
