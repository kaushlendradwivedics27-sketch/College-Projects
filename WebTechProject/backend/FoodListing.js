const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Cooked Meals', 'Bakery Items', 'Raw Vegetables', 'Fruits',
               'Dairy Products', 'Beverages', 'Packaged Food', 'Snacks']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: 1
    },
    unit: {
        type: String,
        enum: ['Servings', 'Kg', 'Liters', 'Pieces', 'Boxes', 'Packets'],
        default: 'Servings'
    },
    status: {
        type: String,
        enum: ['available', 'accepted', 'delivered', 'expired'],
        default: 'available'
    },
    // Location
    pickupAddress: {
        type: String,
        required: [true, 'Pickup address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    // Timing
    availableFrom: {
        type: Date,
        default: Date.now
    },
    expiryTime: {
        type: Date,
        required: [true, 'Expiry time is required']
    },
    // Contact
    contactName: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true
    },
    contactPhone: {
        type: String,
        required: [true, 'Contact phone is required'],
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    // References
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    donorName: {
        type: String,
        trim: true
    },
    // NGO that accepted
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    acceptedByName: {
        type: String,
        trim: true,
        default: ''
    },
    acceptedAt: {
        type: Date,
        default: null
    },
    // Volunteer assigned
    volunteer: {
        type: String,
        trim: true,
        default: ''
    },
    pickupNotes: {
        type: String,
        trim: true,
        default: ''
    },
    // Delivery
    deliveredAt: {
        type: Date,
        default: null
    },
    mealsFed: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Auto-set donorName from populated donor
foodListingSchema.pre('save', async function (next) {
    if (this.isNew && !this.donorName && this.donor) {
        try {
            const User = mongoose.model('User');
            const user = await User.findById(this.donor);
            if (user) this.donorName = user.organization;
        } catch (e) { /* skip */ }
    }
    next();
});

// Index for filtering
foodListingSchema.index({ status: 1, city: 1, category: 1, expiryTime: 1 });
foodListingSchema.index({ donor: 1 });
foodListingSchema.index({ acceptedBy: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
