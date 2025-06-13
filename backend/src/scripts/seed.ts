import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product } from '../models/Product';
import { User } from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const products = [
  {
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    stock: 15,
    image: 'https://example.com/laptop.jpg'
  },
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 899.99,
    category: 'Electronics',
    stock: 25,
    image: 'https://example.com/phone.jpg'
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones',
    price: 199.99,
    category: 'Audio',
    stock: 30,
    image: 'https://example.com/headphones.jpg'
  },
  {
    name: 'Smart Watch',
    description: 'Fitness and health tracking smartwatch',
    price: 249.99,
    category: 'Wearables',
    stock: 20,
    image: 'https://example.com/watch.jpg'
  },
  {
    name: 'Tablet Pro',
    description: 'Professional tablet for creative work',
    price: 799.99,
    category: 'Electronics',
    stock: 10,
    image: 'https://example.com/tablet.jpg'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/datavista');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Seeded products successfully');

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'vmonk@example.com',
      password: 'password123',
      role: 'admin'
    });

    await testUser.save();
    console.log('Test user created successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 