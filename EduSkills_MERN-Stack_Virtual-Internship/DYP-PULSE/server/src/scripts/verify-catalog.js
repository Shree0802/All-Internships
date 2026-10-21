import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

async function check() {
  await connectDB();
  console.log('\n--- VERIFYING CATEGORIES AND PRODUCTS ---');
  const categories = await Category.find().sort({ department: 1, name: 1 });
  console.log(`Total Categories: ${categories.length}`);
  
  for (const cat of categories) {
    const count = await Product.countDocuments({ category: cat._id });
    console.log(`[${cat.department}] ${cat.name} (${cat.slug}): ${count} products`);
  }

  console.log('\n--- VERIFYING SPORTS IN PLAY ---');
  const sports = ['cricket', 'football', 'basketball', 'badminton', 'running', 'fitness'];
  for (const sp of sports) {
    const count = await Product.countDocuments({ sport: sp });
    console.log(`Sport: ${sp} => ${count} products`);
  }

  console.log('\n--- VERIFYING BUDGET TIERS ---');
  const under499 = await Product.countDocuments({ priceInPaise: { $lte: 49900 } });
  const under999 = await Product.countDocuments({ priceInPaise: { $lte: 99900 } });
  const under1499 = await Product.countDocuments({ priceInPaise: { $lte: 149900 } });
  const under1999 = await Product.countDocuments({ priceInPaise: { $lte: 199900 } });
  const total = await Product.countDocuments();

  console.log(`Under ₹499: ${under499} products`);
  console.log(`Under ₹999: ${under999} products`);
  console.log(`Under ₹1,499: ${under1499} products`);
  console.log(`Under ₹1,999: ${under1999} products`);
  console.log(`Total active products in database: ${total}`);

  await mongoose.disconnect();
}

check();
