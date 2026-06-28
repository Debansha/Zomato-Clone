const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('../src/modules/auth/user.model');
const Restaurant = require('../src/modules/restaurant/restaurant.model');
const MenuItem = require('../src/modules/menu/menuItem.model');

// Mock Data
const users = [
  { name: 'Admin User', email: 'admin@zomato.com', password: 'password123', role: 'admin' },
  { name: 'Restaurant Owner', email: 'owner@zomato.com', password: 'password123', role: 'restaurant_owner' },
  { name: 'Delivery Boy', email: 'delivery@zomato.com', password: 'password123', role: 'delivery_partner' },
  { name: 'Hungry Customer', email: 'customer@zomato.com', password: 'password123', role: 'customer' },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zomato-clone';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear DB
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data');

    // Create Users
    const createdUsers = await User.create(users);
    const ownerId = createdUsers[1]._id;

    // Create Restaurant
    const restaurant = await Restaurant.create({
      owner: ownerId,
      name: 'Truffles',
      description: 'Legendary burgers and steaks',
      cuisines: ['Burger', 'American', 'Desserts'],
      address: { street: 'Koramangala 5th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
      location: { type: 'Point', coordinates: [77.6163, 12.9345] },
      priceRange: 2,
      isVeg: false,
      isVerified: true,
      avgRating: 4.5,
    });

    // Create Menu Items
    await MenuItem.create([
      { restaurant: restaurant._id, name: 'All American Cheese Burger', price: 250, category: 'Recommended', isVeg: false, isBestseller: true },
      { restaurant: restaurant._id, name: 'Peri Peri Fries', price: 150, category: 'starters', isVeg: true, isBestseller: true },
      { restaurant: restaurant._id, name: 'Ferrero Rocher Shake', price: 220, category: 'beverages', isVeg: true, isBestseller: false },
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
