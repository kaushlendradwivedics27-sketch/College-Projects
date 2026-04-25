const express = require('express');
const Volunteer = require('../models/Volunteer');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/volunteers — get volunteers for the logged-in NGO
router.get('/', protect, authorize('ngo', 'admin'), async (req, res) => {
    try {
        const filter = req.user.role === 'ngo' ? { ngo: req.user._id } : {};
        const volunteers = await Volunteer.find(filter).sort({ pickups: -1 });
        res.json({ success: true, count: volunteers.length, data: volunteers });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// POST /api/volunteers — add a volunteer
router.post('/', protect, authorize('ngo', 'admin'), async (req, res) => {
    try {
        const vol = await Volunteer.create({ ...req.body, ngo: req.body.ngo || req.user._id });
        res.status(201).json({ success: true, data: vol });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// PUT /api/volunteers/:id — update volunteer
router.put('/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
    try {
        const vol = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vol) return res.status(404).json({ success: false, message: 'Volunteer not found' });
        res.json({ success: true, data: vol });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
