const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const products = [
  // --- Electronics (4 products) ---
  {
    name: 'AuraSound Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in crystal-clear studio audio with active noise cancellation, 40-hour battery life, and ergonomic memory foam earcups.',
    category: 'Electronics',
    price: 14999,
    discount: 15,
    stock: 25,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'UltraVision 4K Smart OLED Monitor 32"',
    description: 'Pro-grade 4K HDR monitor with 144Hz refresh rate, 1ms response time, and vibrant 99% DCI-P3 color gamut accuracy.',
    category: 'Electronics',
    price: 49999,
    discount: 10,
    stock: 12,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'Pulse Pro Fitness Smartwatch',
    description: 'Track your health, ECG, SpO2, sleep stages, and GPS workouts with a sleek titanium case.',
    category: 'Electronics',
    price: 9999,
    discount: 20,
    stock: 35,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'SoundWave Portable Waterproof Bluetooth Speaker',
    description: '360-degree deep bass sound with IPX7 waterproof rating, 24-hour continuous playback.',
    category: 'Electronics',
    price: 3499,
    discount: 5,
    stock: 50,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },

  // --- Fashion (4 products) ---
  {
    name: 'Minimalist Charcoal Wool Blend Trench Coat',
    description: 'Tailored luxury trench coat made from premium Australian merino wool blend.',
    category: 'Fashion',
    price: 8999,
    discount: 25,
    stock: 18,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'Organic Cotton Oversized Streetwear Hoodie',
    description: 'Ultra-soft heavy fleece hoodie crafted from 100% GOTS-certified organic cotton.',
    category: 'Fashion',
    price: 2499,
    discount: 10,
    stock: 40,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'Classic Indigo Denim Jacket',
    description: 'Timeless vintage wash denim jacket featuring durable copper hardware.',
    category: 'Fashion',
    price: 3999,
    discount: 15,
    stock: 30,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'Elegance Silk Pleated Midi Dress',
    description: 'Flowing mulberry silk blend midi dress designed with delicate pleats.',
    category: 'Fashion',
    price: 5499,
    discount: 20,
    stock: 15,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },

  // --- Shoes (4 products) ---
  {
    name: 'Apex Runner Carbon Cushion Sneakers',
    description: 'High-performance running shoes equipped with carbon fiber propulsion plate.',
    category: 'Shoes',
    price: 7999,
    discount: 12,
    stock: 22,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'Heritage Italian Leather Oxford Shoes',
    description: 'Handcrafted full-grain leather oxford dress shoes with Goodyear welted leather soles.',
    category: 'Shoes',
    price: 11999,
    discount: 18,
    stock: 14,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'Urban Glide Retro Canvas High-Tops',
    description: 'Classic skate-inspired canvas sneakers featuring vulcanized rubber outsoles.',
    category: 'Shoes',
    price: 2999,
    discount: 10,
    stock: 45,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'TrailBlazer Waterproof Hiking Boots',
    description: 'Rugged terrain outdoor boot with Vibram rubber traction.',
    category: 'Shoes',
    price: 8499,
    discount: 15,
    stock: 20,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },

  // --- Books (3 products) ---
  {
    name: 'Clean Code & System Design Handbook',
    description: 'Master software engineering patterns, scalable architecture principles, and backend engineering.',
    category: 'Books',
    price: 1499,
    discount: 10,
    stock: 60,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'The Creative Mindset & Modern Design Principles',
    description: 'A guide on visual hierarchy, typography, UI layout systems, and human-centered UX.',
    category: 'Books',
    price: 1299,
    discount: 5,
    stock: 35,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'Financial Intelligence & Wealth Building Guide',
    description: 'Actionable strategies for personal finance, smart investing, and passive income creation.',
    category: 'Books',
    price: 999,
    discount: 15,
    stock: 50,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },

  // --- Accessories (4 products) ---
  {
    name: 'Chronos Mechanical Automatic Leather Watch',
    description: 'Swiss-inspired skeleton automatic movement with sapphire crystal glass.',
    category: 'Accessories',
    price: 18999,
    discount: 20,
    stock: 10,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'Polarized Aviator Titanium Sunglasses',
    description: 'Ultra-lightweight titanium frame aviators with UV400 anti-glare polarized lenses.',
    category: 'Accessories',
    price: 4999,
    discount: 15,
    stock: 28,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'Executive Full-Grain Leather Briefcase',
    description: 'Handcrafted laptop messenger bag with padded 16" MacBook sleeve.',
    category: 'Accessories',
    price: 9499,
    discount: 10,
    stock: 16,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'Minimalist RFID Blocking Aluminum Wallet',
    description: 'Slim pop-up cardholder wallet crafted from aircraft-grade aluminum.',
    category: 'Accessories',
    price: 1999,
    discount: 20,
    stock: 55,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },

  // --- Home Appliances (3 products) ---
  {
    name: 'Barista Touch Espresso & Coffee Machine',
    description: '15-bar Italian pump coffee maker with integrated conical burr grinder.',
    category: 'Home Appliances',
    price: 32999,
    discount: 15,
    stock: 8,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebe02f2a698?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'Smart Air Purifier HEPA H13 Filter',
    description: 'Quiet 3-stage filtration system capturing 99.97% of airborne particles.',
    category: 'Home Appliances',
    price: 8999,
    discount: 10,
    stock: 25,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'RoboClean LiDAR Robot Vacuum & Mop',
    description: 'Precision laser mapping, 4000Pa intense suction, automatic dirt disposal dock.',
    category: 'Home Appliances',
    price: 24999,
    discount: 18,
    stock: 11,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },

  // --- Sports (3 products) ---
  {
    name: 'ProGrip Non-Slip Eco Yoga & Exercise Mat',
    description: '6mm extra thick eco-friendly natural rubber yoga mat.',
    category: 'Sports',
    price: 1999,
    discount: 10,
    stock: 45,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
  {
    name: 'Adjustable Cast Iron Dumbbell Set (50 lbs)',
    description: 'Versatile home gym weight set with quick-lock collar system.',
    category: 'Sports',
    price: 6499,
    discount: 15,
    stock: 20,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    name: 'AeroCarbon Speed Road Bicycle Helmet',
    description: 'Aerodynamic lightweight helmet with MIPS safety system.',
    category: 'Sports',
    price: 4499,
    discount: 12,
    stock: 30,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await User.deleteMany();

    await User.create({
      name: 'Admin Manager',
      email: 'admin@shopsphere.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    await User.create({
      name: 'John Doe',
      email: 'user@shopsphere.com',
      password: 'userpassword123',
      role: 'user',
      phone: '+91 91234 56789',
    });

    const createdProducts = await Product.insertMany(products);

    console.log('====================================================');
    console.log(`Successfully Seeded ShopSphere Database with INR (₹) Prices!`);
    console.log(`- Total Products Seeded: ${createdProducts.length}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Data seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
