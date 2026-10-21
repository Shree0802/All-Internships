import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import config from '../config/index.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { seedCategories } from './categories.js';
import { seedProducts } from './products.js';
import { resolveProductImage } from './seedImagesAndStock.js';

const seed = async () => {
  try {
    await connectDB();
    console.log('[SEED] Connected to database');

    // 1. Clean legacy products with string categories or past automated test artifacts
    await Product.deleteMany({ category: { $type: 'string' } });
    await Product.deleteMany({
      $or: [
        { name: /17925/ },
        { slug: /17925/ },
        { name: /^(Product Alpha|Product Beta|Soft Delete Test|Order Test Product)/i }
      ]
    });
    await Category.deleteMany({
      $or: [
        { slug: /^varsity-accessories-17925/ },
        { slug: /^admin-test-gear/ },
        { slug: /^concurrency-gear/ }
      ]
    });

    // 2. Seed or Upsert Categories
    console.log('[SEED] Seeding categories...');
    const categoryMap = new Map();

    for (const catData of seedCategories) {
      const category = await Category.findOneAndUpdate(
        { slug: catData.slug },
        { $set: catData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap.set(category.slug, category._id);
    }
    console.log(`[SEED] ${categoryMap.size} categories ensured.`);

    // 2. Seed or Upsert Admin and Test Customer
    const adminEmail = (config.admin.email || 'admin@dypulse.com').toLowerCase();
    const adminPassword = config.admin.password || 'DypulseAdmin@2024';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        firstName: 'DYPULSE',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
        status: 'active'
      });
      await admin.save();
      console.log(`[SEED] Admin account created: ${adminEmail}`);
    } else {
      admin.role = 'admin';
      admin.isActive = true;
      admin.status = 'active';
      admin.password = adminPassword;
      await admin.save();
      console.log(`[SEED] Admin account updated: ${adminEmail}`);
    }

    const customerEmail = 'customer@dypulse.com';
    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      customer = new User({
        firstName: 'Test',
        lastName: 'Customer',
        email: customerEmail,
        password: 'Customer@123',
        role: 'customer',
        isActive: true,
        status: 'active',
        addresses: [
          {
            label: 'Hostel Room',
            fullName: 'Test Athlete',
            street: 'Hostel 4, Room 204',
            city: 'Navi Mumbai',
            state: 'Maharashtra',
            pincode: '400706',
            isDefault: true
          }
        ]
      });
      await customer.save();
      console.log(`[SEED] Test customer account created: ${customerEmail}`);
    } else {
      customer.isActive = true;
      customer.status = 'active';
      customer.password = 'Customer@123';
      await customer.save();
      console.log(`[SEED] Test customer account updated: ${customerEmail}`);
    }

    // 3. Seed or Upsert Products
    console.log('[SEED] Seeding products with variants and integer paise prices...');
    let seededCount = 0;

    for (const prodData of seedProducts) {
      const catId = categoryMap.get(prodData.categorySlug);
      if (!catId) {
        console.warn(`[SEED] Skipping ${prodData.name}: Category slug '${prodData.categorySlug}' not found.`);
        continue;
      }

      const { categorySlug, ...cleanData } = prodData;
      cleanData.category = catId;

      const totalVariantStock = (cleanData.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
      cleanData.stock = totalVariantStock > 0 ? totalVariantStock : 50;

      // Assign real Unsplash image
      const imgUrl = resolveProductImage(categorySlug, cleanData.name);
      cleanData.images = [{ url: imgUrl, alt: cleanData.name, isPrimary: true }];

      // Synchronize sizes and colors
      const sizeMap = new Map();
      const colorMap = new Map();
      for (const v of cleanData.variants || []) {
        if (v.size) sizeMap.set(v.size, (sizeMap.get(v.size) || 0) + (v.stock || 0));
        if (v.color) colorMap.set(v.color, (colorMap.get(v.color) || 0) + (v.stock || 0));
      }
      cleanData.sizes = Array.from(sizeMap.entries()).map(([size, s]) => ({ size, stock: s }));
      cleanData.colors = Array.from(colorMap.entries()).map(([name, s]) => ({ name, hex: '', stock: s }));

      await Product.findOneAndUpdate(
        { slug: cleanData.slug },
        { $set: cleanData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCount++;
    }

    console.log(`[SEED] Successfully ensured ${seededCount} products in database.`);

    // 4. Seed or Upsert Demo Coupons
    console.log('[SEED] Seeding demo coupons...');
    const Coupon = (await import('../models/Coupon.js')).default;
    const demoCoupons = [
      {
        code: 'CAMPUS10',
        description: '10% off on all campus and sports gear for university students',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmountInPaise: 49900, // Rs 499
        maxDiscountInPaise: 50000,    // Rs 500 cap
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        usageLimit: 5000,
        isActive: true,
        applicableDepartment: 'ALL'
      },
      {
        code: 'VARSITY20',
        description: '20% off on tournament drops and kits over ₹1,499',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmountInPaise: 149900, // Rs 1,499
        maxDiscountInPaise: 100000,    // Rs 1,000 cap
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: 2000,
        isActive: true,
        applicableDepartment: 'ALL'
      },
      {
        code: 'FLAT100',
        description: 'Flat ₹100 instant discount on orders above ₹999',
        discountType: 'fixed',
        discountValue: 10000, // 10,000 paise = Rs 100
        minOrderAmountInPaise: 99900,
        maxDiscountInPaise: 10000,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: 3000,
        isActive: true,
        applicableDepartment: 'ALL'
      }
    ];

    for (const coup of demoCoupons) {
      await Coupon.findOneAndUpdate(
        { code: coup.code },
        { $set: coup },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[SEED] ${demoCoupons.length} demo coupons ensured.`);

    console.log('\n[SEED] ✅ Complete database seed finished!');
    console.log(`  Categories: ${categoryMap.size}`);
    console.log(`  Products: ${seededCount}`);
    console.log(`  Admin Account: ${adminEmail}`);
    console.log('  Customer Account: customer@dypulse.com / Customer@123');
  } catch (error) {
    console.error('[SEED FAILED]:', error);
  } finally {
    await mongoose.disconnect();
    console.log('[SEED] Database connection closed.');
    process.exit(0);
  }
};

seed();
