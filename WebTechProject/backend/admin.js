const express = require('express');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Volunteer = require('../models/Volunteer');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const [totalDonors, totalNgos, totalVolunteers, activeListings, deliveredListings] = await Promise.all([
            User.countDocuments({ role: 'donor' }),
            User.countDocuments({ role: 'ngo' }),
            Volunteer.countDocuments(),
            FoodListing.countDocuments({ status: 'available' }),
            FoodListing.countDocuments({ status: 'delivered' })
        ]);
        const mealsAgg = await FoodListing.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, totalMeals: { $sum: '$mealsFed' }, totalQty: { $sum: '$quantity' } } }
        ]);
        const totalMeals = mealsAgg[0]?.totalMeals || mealsAgg[0]?.totalQty || 0;
        const co2Saved = Math.round(totalMeals * 2.5);
        const cities = await FoodListing.distinct('city');
        const totalFinished = await FoodListing.countDocuments({ status: { $in: ['delivered', 'expired'] } });
        const successRate = totalFinished > 0 ? Math.round((deliveredListings / totalFinished) * 100) : 0;

        const categoryData = await FoodListing.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }
        ]);
        const cityData = await FoodListing.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: '$city', meals: { $sum: '$mealsFed' } } },
            { $sort: { meals: -1 } }, { $limit: 10 }
        ]);

        // Monthly data (last 12 months)
        const monthlyData = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const [listings, delivered, donors, ngos] = await Promise.all([
                FoodListing.countDocuments({ createdAt: { $gte: start, $lt: end } }),
                FoodListing.countDocuments({ status: 'delivered', deliveredAt: { $gte: start, $lt: end } }),
                User.countDocuments({ role: 'donor', createdAt: { $lt: end } }),
                User.countDocuments({ role: 'ngo', createdAt: { $lt: end } })
            ]);
            const ma = await FoodListing.aggregate([
                { $match: { status: 'delivered', deliveredAt: { $gte: start, $lt: end } } },
                { $group: { _id: null, total: { $sum: '$mealsFed' } } }
            ]);
            monthlyData.push({ label: d.toLocaleString('en', { month: 'short' }), listings, delivered, meals: ma[0]?.total || 0, donors, ngos });
        }

        res.json({ success: true, data: { totalDonors, totalNgos, totalVolunteers, activeListings, deliveredListings, totalMeals, co2Saved, citiesCount: cities.length, successRate, monthlyData, categoryData, cityData } });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/donors
router.get('/donors', protect, authorize('admin'), async (req, res) => {
    try {
        const filter = { role: 'donor' };
        if (req.query.search) filter.organization = new RegExp(req.query.search, 'i');
        if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
        const donors = await User.find(filter).sort({ createdAt: -1 });
        const data = await Promise.all(donors.map(async (d) => {
            const s = await FoodListing.aggregate([
                { $match: { donor: d._id } },
                { $group: { _id: null, totalDonations: { $sum: 1 }, totalMeals: { $sum: '$mealsFed' }, lastDonation: { $max: '$createdAt' } } }
            ]);
            return { ...d.toObject(), totalDonations: s[0]?.totalDonations || 0, totalMeals: s[0]?.totalMeals || 0, lastActive: s[0]?.lastDonation || d.createdAt };
        }));
        res.json({ success: true, count: data.length, data });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// GET /api/admin/ngos
router.get('/ngos', protect, authorize('admin'), async (req, res) => {
    try {
        const filter = { role: 'ngo' };
        if (req.query.search) filter.organization = new RegExp(req.query.search, 'i');
        const ngos = await User.find(filter).sort({ createdAt: -1 });
        const data = await Promise.all(ngos.map(async (n) => {
            const [pickups, volCount] = await Promise.all([
                FoodListing.countDocuments({ acceptedBy: n._id }),
                Volunteer.countDocuments({ ngo: n._id })
            ]);
            return { ...n.toObject(), pickups, volunteerCount: volCount };
        }));
        res.json({ success: true, count: data.length, data });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// PUT /api/admin/ngos/:id/verify
router.put('/ngos/:id/verify', protect, authorize('admin'), async (req, res) => {
    try {
        const ngo = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });
        res.json({ success: true, data: ngo, message: `${ngo.organization} verified!` });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive', 'suspended'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user, message: `${user.organization} is now ${status}` });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// DELETE /api/admin/listings/expired
router.delete('/listings/expired', protect, authorize('admin'), async (req, res) => {
    try {
        const result = await FoodListing.deleteMany({ status: 'expired' });
        res.json({ success: true, message: `${result.deletedCount} expired listings cleared` });
    } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
