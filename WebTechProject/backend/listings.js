const express = require('express');
const { body, validationResult } = require('express-validator');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/listings
// @desc    Get all food listings (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, city, category, search, donor, limit } = req.query;
        const filter = {};

        // Role-based filtering
        if (req.user.role === 'donor') {
            filter.donor = req.user._id;      // Donors see only their own listings
        }

        // Query filters
        if (status) filter.status = status;
        if (city) filter.city = new RegExp(city, 'i');
        if (category) filter.category = category;
        if (donor) filter.donor = donor;
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { donorName: new RegExp(search, 'i') },
                { city: new RegExp(search, 'i') }
            ];
        }

        const query = FoodListing.find(filter)
            .sort({ createdAt: -1 })
            .populate('donor', 'firstName lastName organization city')
            .populate('acceptedBy', 'firstName lastName organization');

        if (limit) query.limit(parseInt(limit));

        const listings = await query;

        res.json({ success: true, count: listings.length, data: listings });
    } catch (err) {
        console.error('Get listings error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/listings/available
// @desc    Get available food listings for NGOs (not expired, status=available)
// @access  Private (NGO)
router.get('/available', protect, authorize('ngo', 'admin'), async (req, res) => {
    try {
        const { city, category, search, location } = req.query;
        const filter = {
            status: 'available',
            expiryTime: { $gt: new Date() }     // Not expired
        };

        if (city) filter.city = new RegExp(city, 'i');
        if (location) filter.pickupAddress = new RegExp(location, 'i');
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { donorName: new RegExp(search, 'i') }
            ];
        }

        const listings = await FoodListing.find(filter)
            .sort({ expiryTime: 1 })   // Urgent (soonest expiry) first
            .populate('donor', 'organization city');

        // Mark urgent listings (expiring within 1 hour)
        const now = Date.now();
        const data = listings.map(l => {
            const obj = l.toObject();
            obj.isUrgent = (l.expiryTime.getTime() - now) < 3600000;
            return obj;
        });

        res.json({ success: true, count: data.length, data });
    } catch (err) {
        console.error('Get available error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/listings/:id
// @desc    Get single listing
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id)
            .populate('donor', 'firstName lastName organization city phone')
            .populate('acceptedBy', 'firstName lastName organization');

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: listing });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/listings
// @desc    Create a new food listing
// @access  Private (Donor)
router.post('/', protect, authorize('donor', 'admin'), [
    body('name').trim().notEmpty().withMessage('Food name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('expiryTime').notEmpty().withMessage('Expiry time is required'),
    body('contactName').trim().notEmpty().withMessage('Contact name is required'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const listing = await FoodListing.create({
            ...req.body,
            donor: req.user._id,
            donorName: req.user.organization,
            status: 'available'
        });

        res.status(201).json({ success: true, data: listing });
    } catch (err) {
        console.error('Create listing error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/listings/:id
// @desc    Update a food listing
// @access  Private (Owner or Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        let listing = await FoodListing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Only owner or admin can update
        if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        listing = await FoodListing.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });

        res.json({ success: true, data: listing });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a food listing
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await listing.deleteOne();
        res.json({ success: true, message: 'Listing removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/listings/:id/accept
// @desc    NGO accepts a food listing
// @access  Private (NGO)
router.put('/:id/accept', protect, authorize('ngo'), async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }
        if (listing.status !== 'available') {
            return res.status(400).json({ success: false, message: 'Listing is no longer available' });
        }

        listing.status = 'accepted';
        listing.acceptedBy = req.user._id;
        listing.acceptedByName = req.user.organization;
        listing.acceptedAt = new Date();
        listing.volunteer = req.body.volunteer || '';
        listing.pickupNotes = req.body.pickupNotes || '';

        await listing.save();

        res.json({ success: true, data: listing, message: 'Pickup accepted! Volunteer notified.' });
    } catch (err) {
        console.error('Accept error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/listings/:id/deliver
// @desc    Mark a listing as delivered
// @access  Private (NGO or Admin)
router.put('/:id/deliver', protect, authorize('ngo', 'admin'), async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }
        if (listing.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Listing must be accepted before delivery' });
        }

        listing.status = 'delivered';
        listing.deliveredAt = new Date();
        listing.mealsFed = req.body.mealsFed || listing.quantity;

        await listing.save();

        res.json({ success: true, data: listing, message: 'Delivery marked complete!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/listings/expire-stale
// @desc    Auto-expire stale listings
// @access  Private (Admin)
router.put('/expire-stale', protect, authorize('admin'), async (req, res) => {
    try {
        const result = await FoodListing.updateMany(
            { status: 'available', expiryTime: { $lt: new Date() } },
            { status: 'expired' }
        );
        res.json({ success: true, message: `${result.modifiedCount} listings expired`, count: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
