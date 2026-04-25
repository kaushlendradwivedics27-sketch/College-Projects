/**
 * seed.js — Populate MealMitra database with realistic sample data
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const FoodListing = require('./models/FoodListing');
const Volunteer = require('./models/Volunteer');

const seed = async () => {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await FoodListing.deleteMany({});
    await Volunteer.deleteMany({});

    // ——— USERS ———
    console.log('👤 Creating users...');
    const hashedPw = await bcrypt.hash('password123', 12);

    const admin = await User.create({
        firstName: 'Platform', lastName: 'Admin', email: 'admin@mealmitra.org',
        password: hashedPw, role: 'admin', organization: 'MealMitra HQ',
        phone: '+91 1800366324', city: 'Mumbai', isVerified: true
    });

    const donors = await User.insertMany([
        { firstName: 'Ravi', lastName: 'Mehta', email: 'ravi@restaurant.com', password: hashedPw, role: 'donor', organization: "Ravi's Restaurant", phone: '+91 9876543210', city: 'Mumbai', address: '12 Marine Lines, Near CST Station', isVerified: true, status: 'active' },
        { firstName: 'Anita', lastName: 'Sharma', email: 'anita@grandpalace.com', password: hashedPw, role: 'donor', organization: 'Grand Palace Hotel', phone: '+91 9812345678', city: 'Delhi', address: '45 Connaught Place', isVerified: true, status: 'active' },
        { firstName: 'Suresh', lastName: 'Reddy', email: 'suresh@iitcanteen.edu', password: hashedPw, role: 'donor', organization: 'IIT Canteen', phone: '+91 9900112233', city: 'Bengaluru', address: 'IIT Campus, Whitefield', isVerified: true, status: 'active' },
        { firstName: 'Kavitha', lastName: 'Nair', email: 'kavitha@zomato.com', password: hashedPw, role: 'donor', organization: 'Zomato Events', phone: '+91 9988776655', city: 'Hyderabad', address: 'Banjara Hills', isVerified: true, status: 'active' },
        { firstName: 'Deepak', lastName: 'Jain', email: 'deepak@apollo.com', password: hashedPw, role: 'donor', organization: 'Apollo Cafeteria', phone: '+91 9123456789', city: 'Chennai', address: '21 Greams Road', isVerified: true, status: 'inactive' },
        { firstName: 'Mohan', lastName: 'Das', email: 'mohan@eventcatering.com', password: hashedPw, role: 'donor', organization: 'Event Catering Co.', phone: '+91 9234567890', city: 'Kolkata', address: 'Park Street', isVerified: true, status: 'active' },
    ]);

    const ngos = await User.insertMany([
        { firstName: 'Priya', lastName: 'Sharma', email: 'priya@helphand.org', password: hashedPw, role: 'ngo', organization: 'HelpHand NGO', phone: '+91 8899776655', city: 'Bengaluru', registrationNumber: 'NGO-KA-2021-8823', serviceAreas: 'Whitefield, Koramangala, Indiranagar, HSR Layout', isVerified: true, status: 'active' },
        { firstName: 'Amit', lastName: 'Verma', email: 'amit@ashafoundation.org', password: hashedPw, role: 'ngo', organization: 'Asha Foundation', phone: '+91 8877665544', city: 'Mumbai', registrationNumber: 'NGO-MH-2019-1122', serviceAreas: 'Andheri, Bandra, Dadar', isVerified: true, status: 'active' },
        { firstName: 'Neha', lastName: 'Singh', email: 'neha@carefirst.org', password: hashedPw, role: 'ngo', organization: 'CareFirst NGO', phone: '+91 8866554433', city: 'Delhi', registrationNumber: 'NGO-DL-2020-3341', serviceAreas: 'Dwarka, Rohini, Saket', isVerified: true, status: 'active' },
        { firstName: 'Raj', lastName: 'Kumar', email: 'raj@mealbridge.org', password: hashedPw, role: 'ngo', organization: 'MealBridge Delhi', phone: '+91 8855443322', city: 'Delhi', registrationNumber: 'NGO-DL-2022-5567', serviceAreas: 'South Delhi', isVerified: false, status: 'active' },
        { firstName: 'Lakshmi', lastName: 'Iyer', email: 'lakshmi@feedindia.org', password: hashedPw, role: 'ngo', organization: 'FeedIndia Trust', phone: '+91 8844332211', city: 'Chennai', registrationNumber: 'NGO-TN-2021-7789', serviceAreas: 'T Nagar, Adyar, Mylapore', isVerified: true, status: 'active' },
    ]);

    // ——— VOLUNTEERS ———
    console.log('🙋 Creating volunteers...');
    const helpHand = ngos[0];
    await Volunteer.insertMany([
        { name: 'Arjun Patel', role: 'Pickup Driver', pickups: 47, rating: 4.9, status: 'available', phone: '+91 9111222333', ngo: helpHand._id },
        { name: 'Sonal Mehta', role: 'Coordinator', pickups: 38, rating: 4.8, status: 'available', phone: '+91 9222333444', ngo: helpHand._id },
        { name: 'Rahul Kumar', role: 'Pickup Driver', pickups: 29, rating: 4.7, status: 'busy', phone: '+91 9333444555', ngo: helpHand._id },
        { name: 'Priya Das', role: 'Volunteer', pickups: 12, rating: 4.6, status: 'available', phone: '+91 9444555666', ngo: helpHand._id },
        { name: 'Vikram Singh', role: 'Pickup Driver', pickups: 55, rating: 5.0, status: 'busy', phone: '+91 9555666777', ngo: helpHand._id },
        { name: 'Anita Joshi', role: 'Coordinator', pickups: 22, rating: 4.8, status: 'available', phone: '+91 9666777888', ngo: helpHand._id },
    ]);

    // ——— FOOD LISTINGS ———
    console.log('🍽️  Creating food listings...');
    const now = Date.now();
    const ravi = donors[0], anita = donors[1], suresh = donors[2];
    const hh = ngos[0], af = ngos[1];

    await FoodListing.insertMany([
        // Active available listings
        { name: 'Chicken Biryani', category: 'Cooked Meals', quantity: 80, unit: 'Servings', status: 'available', pickupAddress: 'Andheri West, Mumbai', city: 'Mumbai', availableFrom: new Date(), expiryTime: new Date(now + 2 * 3600000), contactName: 'Ravi Mehta', contactPhone: '+91 9876543210', donor: ravi._id, donorName: ravi.organization },
        { name: 'Fresh Salad Bowls', category: 'Cooked Meals', quantity: 40, unit: 'Servings', status: 'available', pickupAddress: 'Andheri West, Mumbai', city: 'Mumbai', availableFrom: new Date(), expiryTime: new Date(now + 45 * 60000), contactName: 'Ravi Mehta', contactPhone: '+91 9876543210', donor: ravi._id, donorName: ravi.organization },
        { name: 'Samosas & Chutney', category: 'Snacks', quantity: 120, unit: 'Pieces', status: 'available', pickupAddress: 'Andheri West, Mumbai', city: 'Mumbai', availableFrom: new Date(), expiryTime: new Date(now + 1.5 * 3600000), contactName: 'Ravi Mehta', contactPhone: '+91 9876543210', donor: ravi._id, donorName: ravi.organization },
        { name: 'Dal Tadka & Rice', category: 'Cooked Meals', quantity: 100, unit: 'Servings', status: 'available', pickupAddress: 'Whitefield, Bengaluru', city: 'Bengaluru', availableFrom: new Date(), expiryTime: new Date(now + 50 * 60000), contactName: 'Suresh Reddy', contactPhone: '+91 9900112233', donor: suresh._id, donorName: suresh.organization },
        { name: 'Assorted Pastries', category: 'Bakery Items', quantity: 60, unit: 'Pieces', status: 'available', pickupAddress: 'Indiranagar, Bengaluru', city: 'Bengaluru', availableFrom: new Date(), expiryTime: new Date(now + 3 * 3600000), contactName: 'Suresh Reddy', contactPhone: '+91 9900112233', donor: suresh._id, donorName: suresh.organization },
        { name: 'Fruit Platter', category: 'Fruits', quantity: 25, unit: 'Kg', status: 'available', pickupAddress: 'Connaught Place, Delhi', city: 'Delhi', availableFrom: new Date(), expiryTime: new Date(now + 4 * 3600000), contactName: 'Anita Sharma', contactPhone: '+91 9812345678', donor: anita._id, donorName: anita.organization },
        { name: 'Vegetable Soup', category: 'Cooked Meals', quantity: 50, unit: 'Liters', status: 'available', pickupAddress: 'Koramangala, Bengaluru', city: 'Bengaluru', availableFrom: new Date(), expiryTime: new Date(now + 1.5 * 3600000), contactName: 'Suresh Reddy', contactPhone: '+91 9900112233', donor: suresh._id, donorName: suresh.organization },
        { name: 'Bread & Butter', category: 'Bakery Items', quantity: 80, unit: 'Pieces', status: 'available', pickupAddress: 'HSR Layout, Bengaluru', city: 'Bengaluru', availableFrom: new Date(), expiryTime: new Date(now + 5 * 3600000), contactName: 'Suresh Reddy', contactPhone: '+91 9900112233', donor: suresh._id, donorName: suresh.organization },
        // Accepted
        { name: 'Paneer Tikka', category: 'Cooked Meals', quantity: 60, unit: 'Servings', status: 'accepted', pickupAddress: 'Andheri West, Mumbai', city: 'Mumbai', availableFrom: new Date(now - 2 * 3600000), expiryTime: new Date(now + 1 * 3600000), contactName: 'Ravi Mehta', contactPhone: '+91 9876543210', donor: ravi._id, donorName: ravi.organization, acceptedBy: hh._id, acceptedByName: 'HelpHand NGO', acceptedAt: new Date(), volunteer: 'Arjun Patel' },
        // Delivered (historical)
        { name: 'Biryani Party Pack', category: 'Cooked Meals', quantity: 200, unit: 'Servings', status: 'delivered', pickupAddress: 'Andheri West, Mumbai', city: 'Mumbai', availableFrom: new Date(now - 48 * 3600000), expiryTime: new Date(now - 44 * 3600000), contactName: 'Ravi Mehta', contactPhone: '+91 9876543210', donor: ravi._id, donorName: ravi.organization, acceptedBy: af._id, acceptedByName: 'Asha Foundation', deliveredAt: new Date(now - 46 * 3600000), mealsFed: 200 },
        { name: 'Veg Curry & Chapati', category: 'Cooked Meals', quantity: 50, unit: 'Servings', status: 'delivered', pickupAddress: 'Connaught Place, Delhi', city: 'Delhi', availableFrom: new Date(now - 72 * 3600000), expiryTime: new Date(now - 68 * 3600000), contactName: 'Anita Sharma', contactPhone: '+91 9812345678', donor: anita._id, donorName: anita.organization, acceptedBy: ngos[2]._id, acceptedByName: 'CareFirst NGO', deliveredAt: new Date(now - 70 * 3600000), mealsFed: 50 },
        { name: 'Bread Loaves', category: 'Bakery Items', quantity: 30, unit: 'Pieces', status: 'delivered', pickupAddress: 'Whitefield, Bengaluru', city: 'Bengaluru', availableFrom: new Date(now - 96 * 3600000), expiryTime: new Date(now - 90 * 3600000), contactName: 'Suresh Reddy', contactPhone: '+91 9900112233', donor: suresh._id, donorName: suresh.organization, acceptedBy: hh._id, acceptedByName: 'HelpHand NGO', deliveredAt: new Date(now - 93 * 3600000), mealsFed: 30 },
        { name: 'Soup Pots', category: 'Cooked Meals', quantity: 20, unit: 'Liters', status: 'delivered', pickupAddress: 'Banjara Hills, Hyderabad', city: 'Hyderabad', availableFrom: new Date(now - 120 * 3600000), expiryTime: new Date(now - 116 * 3600000), contactName: 'Kavitha Nair', contactPhone: '+91 9988776655', donor: donors[3]._id, donorName: 'Zomato Events', acceptedBy: hh._id, acceptedByName: 'HelpHand NGO', deliveredAt: new Date(now - 118 * 3600000), mealsFed: 60 },
        { name: 'Fruit Mix', category: 'Fruits', quantity: 15, unit: 'Kg', status: 'delivered', pickupAddress: 'Andheri West, Mumbai', city: 'Mumbai', availableFrom: new Date(now - 144 * 3600000), expiryTime: new Date(now - 138 * 3600000), contactName: 'Ravi Mehta', contactPhone: '+91 9876543210', donor: ravi._id, donorName: ravi.organization, acceptedBy: af._id, acceptedByName: 'Asha Foundation', deliveredAt: new Date(now - 140 * 3600000), mealsFed: 90 },
        // Expired
        { name: 'Cookies', category: 'Snacks', quantity: 100, unit: 'Pieces', status: 'expired', pickupAddress: 'Andheri West, Mumbai', city: 'Mumbai', availableFrom: new Date(now - 168 * 3600000), expiryTime: new Date(now - 164 * 3600000), contactName: 'Ravi Mehta', contactPhone: '+91 9876543210', donor: ravi._id, donorName: ravi.organization, mealsFed: 0 },
    ]);

    console.log('\n✅ Seed complete!');
    console.log(`   👤 ${1 + donors.length + ngos.length} users (1 admin, ${donors.length} donors, ${ngos.length} NGOs)`);
    console.log('   🙋 6 volunteers');
    console.log('   🍽️  16 food listings\n');
    console.log('📧 Login credentials (password: password123):');
    console.log('   Admin:  admin@mealmitra.org');
    console.log('   Donor:  ravi@restaurant.com');
    console.log('   NGO:    priya@helphand.org\n');

    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
