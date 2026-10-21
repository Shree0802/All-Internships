import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import Coupon from '../src/models/Coupon.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Review from '../src/models/Review.js';
import TeamKitRequest from '../src/models/TeamKitRequest.js';
import './setup.js';

describe('DYPULSE Advanced Integrated Features (Features 1 - 7)', () => {
  let customerCookie;
  let customer2Cookie;
  let adminCookie;
  let customerUser;
  let customer2User;
  let adminUser;
  let playCategory;
  let campusCategory;
  let budgetProductCheap;
  let budgetProductExpensive;
  let budgetProductVariantOverride;
  let deliveredOrder;
  let deliveredProduct;

  beforeAll(async () => {
    // 1. Categories
    playCategory = await Category.findOneAndUpdate(
      { slug: 'badminton' },
      { name: 'Badminton Gear', slug: 'badminton', department: 'PLAY', isActive: true },
      { upsert: true, new: true }
    );

    campusCategory = await Category.findOneAndUpdate(
      { slug: 'stationery' },
      { name: 'Campus Stationery', slug: 'stationery', department: 'CAMPUS', isActive: true },
      { upsert: true, new: true }
    );

    // 2. Users: delete stale test users and re-create via User.create to trigger password hash hook
    await User.deleteMany({
      email: { $in: ['athlete.feat@dypulse.com', 'rookie.feat@dypulse.com', 'admin.feat@dypulse.com'] }
    });

    customerUser = await User.create({
      firstName: 'Prathamesh',
      lastName: 'Athlete',
      email: 'athlete.feat@dypulse.com',
      password: 'Password@123',
      role: 'customer'
    });

    customer2User = await User.create({
      firstName: 'Rookie',
      lastName: 'Player',
      email: 'rookie.feat@dypulse.com',
      password: 'Password@123',
      role: 'customer'
    });

    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'Director',
      email: 'admin.feat@dypulse.com',
      password: 'DypulseAdmin@2024',
      role: 'admin'
    });

    // 3. Authenticate users and acquire session cookies
    const c1Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'athlete.feat@dypulse.com', password: 'Password@123' });
    expect(c1Res.status).toBe(200);
    customerCookie = c1Res.headers['set-cookie'];

    const c2Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rookie.feat@dypulse.com', password: 'Password@123' });
    expect(c2Res.status).toBe(200);
    customer2Cookie = c2Res.headers['set-cookie'];

    const aRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin.feat@dypulse.com', password: 'DypulseAdmin@2024' });
    expect(aRes.status).toBe(200);
    adminCookie = aRes.headers['set-cookie'];

    // 4. Products for Budget Finder & Recommendations
    budgetProductCheap = await Product.create({
      name: `Pro Badminton Grip Tape ${Date.now()}`,
      slug: `grip-tape-${Date.now()}`,
      description: 'Super absorbent non-slip racket grip tape',
      department: 'PLAY',
      category: playCategory._id,
      brand: 'DYPULSE PLAY',
      sport: 'Badminton',
      priceInPaise: 29900, // ₹299
      stock: 50,
      variants: [{ sku: `GRIP-${Date.now()}`, size: 'Standard', color: 'Neon Blue', stock: 50 }],
      isActive: true
    });

    budgetProductExpensive = await Product.create({
      name: `Carbon Pro Badminton Racket ${Date.now()}`,
      slug: `racket-${Date.now()}`,
      description: 'High modulus graphite tournament racket',
      department: 'PLAY',
      category: playCategory._id,
      brand: 'DYPULSE PLAY',
      sport: 'Badminton',
      priceInPaise: 349900, // ₹3,499
      stock: 20,
      variants: [{ sku: `RCKT-${Date.now()}`, size: '3U/G4', color: 'Matte Black', stock: 20 }],
      isActive: true
    });

    // Product with base price above ₹499 but a variant override of ₹399
    budgetProductVariantOverride = await Product.create({
      name: `Tournament Shuttlecock Pack ${Date.now()}`,
      slug: `shuttle-pack-${Date.now()}`,
      description: 'Goose feather tournament grade shuttlecocks',
      department: 'PLAY',
      category: playCategory._id,
      brand: 'DYPULSE PLAY',
      sport: 'Badminton',
      priceInPaise: 79900, // ₹799 base
      stock: 30,
      variants: [
        { sku: `SHTL-12-${Date.now()}`, size: 'Pack of 12', color: 'White', priceOverrideInPaise: 79900, stock: 15 },
        { sku: `SHTL-3-${Date.now()}`, size: 'Trial Pack of 3', color: 'White', priceOverrideInPaise: 39900, stock: 15 } // ₹399 override
      ],
      isActive: true
    });

    // Delivered Product & Order for Reviews
    deliveredProduct = await Product.create({
      name: `Collegiate Gym Duffel ${Date.now()}`,
      slug: `gym-duffel-${Date.now()}`,
      description: 'Water resistant shoe-compartment duffel bag',
      department: 'CAMPUS',
      category: campusCategory._id,
      brand: 'DYPULSE CAMPUS',
      priceInPaise: 129900, // ₹1,299
      stock: 40,
      variants: [{ sku: `BAG-${Date.now()}`, size: 'One Size', color: 'Navy', stock: 40 }],
      isActive: true
    });

    deliveredOrder = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: deliveredProduct._id,
          sku: deliveredProduct.variants[0].sku,
          name: deliveredProduct.name,
          unitPriceInPaise: deliveredProduct.priceInPaise,
          quantity: 1,
          lineTotalInPaise: deliveredProduct.priceInPaise,
          size: deliveredProduct.variants[0].size,
          color: deliveredProduct.variants[0].color
        }
      ],
      shippingAddress: {
        fullName: 'Prathamesh Athlete',
        phone: '9876543210',
        street: 'Hostel 4, Room 210',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      },
      paymentMethod: 'COD',
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      subtotalInPaise: 129900,
      shippingFeeInPaise: 0,
      discountInPaise: 0,
      totalInPaise: 129900
    });
  });

  // ========================================================
  // FEATURE 1: CAMPUS BUDGET FINDER
  // ========================================================
  describe('FEATURE 1: Campus Budget Finder', () => {
    it('filters products under maxPrice limit (Under ₹499 tier)', async () => {
      // 499 rupees = ₹499 (49900 paise)
      const res = await request(app)
        .get('/api/v1/products')
        .query({ maxPrice: 499, department: 'PLAY' });

      expect(res.status).toBe(200);
      const prods = res.body.data.products;
      expect(Array.isArray(prods)).toBe(true);

      // The ₹299 grip tape should be present
      const foundGrip = prods.find((p) => p._id.toString() === budgetProductCheap._id.toString());
      expect(foundGrip).toBeDefined();

      // The ₹399 variant override product should also be returned
      const foundOverride = prods.find((p) => p._id.toString() === budgetProductVariantOverride._id.toString());
      expect(foundOverride).toBeDefined();

      // The ₹3,499 racket must NOT be present
      const foundRacket = prods.find((p) => p._id.toString() === budgetProductExpensive._id.toString());
      expect(foundRacket).toBeUndefined();

      // No returned product should have its lowest price exceed maxPrice
      for (const prod of prods) {
        const minVariantPrice =
          prod.variants && prod.variants.length > 0
            ? Math.min(...prod.variants.map((v) => v.priceOverrideInPaise || prod.priceInPaise))
            : prod.priceInPaise;
        expect(minVariantPrice).toBeLessThanOrEqual(49900);
      }
    });

    it('respects department and category combination with budget filter', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ maxPrice: 1500, department: 'CAMPUS' });

      expect(res.status).toBe(200);
      const prods = res.body.data.products;
      for (const p of prods) {
        expect(p.department).toBe('CAMPUS');
      }
    });
  });

  // ========================================================
  // FEATURE 2: COUPON SYSTEM
  // ========================================================
  describe('FEATURE 2: Coupon System Robustness', () => {
    let expiredCoupon;
    let exhaustedCoupon;
    let departmentRestrictedCoupon;
    let singleUseCoupon;

    beforeAll(async () => {
      const ts = Date.now().toString().slice(-6);

      expiredCoupon = await Coupon.create({
        code: `EXP_${ts}`,
        description: 'Expired promo',
        discountType: 'fixed',
        discountValue: 10000,
        minOrderAmountInPaise: 20000,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
        isActive: true
      });

      exhaustedCoupon = await Coupon.create({
        code: `MAX_${ts}`,
        description: 'Exhausted promo',
        discountType: 'fixed',
        discountValue: 10000,
        minOrderAmountInPaise: 20000,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 1,
        usageCount: 1, // exhausted
        isActive: true
      });

      departmentRestrictedCoupon = await Coupon.create({
        code: `PO_${ts}`,
        description: 'Sports only promo',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmountInPaise: 20000,
        eligibleDepartments: ['PLAY'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      singleUseCoupon = await Coupon.create({
        code: `PU_${ts}`,
        description: 'Once per student coupon',
        discountType: 'fixed',
        discountValue: 5000, // ₹50
        minOrderAmountInPaise: 20000,
        perUserLimit: 1,
        usageLimit: 100,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    });

    it('rejects expired coupon during validation', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .set('Cookie', customerCookie)
        .send({
          code: expiredCoupon.code,
          subtotalInPaise: 50000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/expired/i);
    });

    it('rejects coupon when usage limit is exhausted', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .set('Cookie', customerCookie)
        .send({
          code: exhaustedCoupon.code,
          subtotalInPaise: 50000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/usage limit/i);
    });

    it('rejects department-restricted coupon when cart contains ineligible items', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .set('Cookie', customerCookie)
        .send({
          code: departmentRestrictedCoupon.code,
          subtotalInPaise: 50000,
          departments: ['CAMPUS'] // only campus items in cart
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/only valid for/i);
    });

    it('accepts department-restricted coupon when matching department is in cart', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .set('Cookie', customerCookie)
        .send({
          code: departmentRestrictedCoupon.code,
          subtotalInPaise: 50000,
          departments: ['PLAY']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discountInPaise).toBe(10000); // 20% of 50000 = 10000
    });

    it('enforces per-user limit when user has already placed an order with coupon', async () => {
      // 1. First order with perUserCoupon by customerUser
      await Order.create({
        user: customerUser._id,
        items: [
          {
            product: budgetProductCheap._id,
            sku: budgetProductCheap.variants[0].sku,
            name: budgetProductCheap.name,
            unitPriceInPaise: budgetProductCheap.priceInPaise,
            quantity: 1,
            lineTotalInPaise: budgetProductCheap.priceInPaise
          }
        ],
        shippingAddress: {
          fullName: 'Prathamesh Athlete',
          phone: '9876543210',
          street: 'Hostel 4, Room 210',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001'
        },
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        orderStatus: 'placed',
        coupon: {
          code: singleUseCoupon.code,
          discountInPaise: 5000
        },
        subtotalInPaise: 29900,
        shippingFeeInPaise: 0,
        discountInPaise: 5000,
        totalInPaise: 24900
      });

      // 2. Customer attempts to apply same coupon on next checkout -> should be rejected
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .set('Cookie', customerCookie)
        .send({
          code: singleUseCoupon.code,
          subtotalInPaise: 30000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/reached the limit/i);

      // 3. Different customer (customer2) can still use it
      const res2 = await request(app)
        .post('/api/v1/coupons/validate')
        .set('Cookie', customer2Cookie)
        .send({
          code: singleUseCoupon.code,
          subtotalInPaise: 30000
        });

      expect(res2.status).toBe(200);
      expect(res2.body.success).toBe(true);
    });
  });

  // ========================================================
  // FEATURE 3: PRODUCT REVIEWS & VERIFIED PURCHASES
  // ========================================================
  describe('FEATURE 3: Product Reviews & Verified Purchases', () => {
    let createdReviewId;

    it('rejects review submission from unauthenticated user', async () => {
      const res = await request(app)
        .post(`/api/v1/products/${deliveredProduct._id}/reviews`)
        .send({
          rating: 5,
          reviewText: 'Great campus duffel!'
        });

      expect(res.status).toBe(401);
    });

    it('rejects review when customer has not purchased or had order delivered', async () => {
      // customer2 has never purchased deliveredProduct
      const res = await request(app)
        .post(`/api/v1/products/${deliveredProduct._id}/reviews`)
        .set('Cookie', customer2Cookie)
        .send({
          rating: 4,
          reviewText: 'I would like to try this gym bag!'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('REVIEW_ELIGIBILITY_REQUIRED');
    });

    it('allows verified purchaser to submit a review and updates product rating average', async () => {
      const res = await request(app)
        .post(`/api/v1/products/${deliveredProduct._id}/reviews`)
        .set('Cookie', customerCookie)
        .send({
          rating: 5,
          title: 'Tournament Ready!',
          reviewText: 'Incredible build quality, comfortably fits badminton rackets and turf shoes.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
      expect(res.body.data.review.verifiedPurchase).toBe(true);
      createdReviewId = res.body.data.review._id;

      // Check that product ratings stats were updated
      const updatedProduct = await Product.findById(deliveredProduct._id);
      expect(updatedProduct.ratings.count).toBe(1);
      expect(updatedProduct.ratings.average).toBe(5);
    });

    it('prevents duplicate reviews for the same product and order', async () => {
      const res = await request(app)
        .post(`/api/v1/products/${deliveredProduct._id}/reviews`)
        .set('Cookie', customerCookie)
        .send({
          rating: 4,
          title: 'Second review attempt',
          reviewText: 'Trying to review again from the same order.'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('DUPLICATE_REVIEW');
    });

    it('fetches approved reviews via public reviews endpoint', async () => {
      const res = await request(app).get(`/api/v1/products/${deliveredProduct._id}/reviews`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.reviews[0].verifiedPurchase).toBe(true);
    });

    it('allows admin to view all reviews and moderate status', async () => {
      const allRes = await request(app)
        .get('/api/v1/reviews/admin/all')
        .set('Cookie', adminCookie);

      expect(allRes.status).toBe(200);
      expect(Array.isArray(allRes.body.data.reviews)).toBe(true);

      const modRes = await request(app)
        .put(`/api/v1/reviews/admin/${createdReviewId}/moderate`)
        .set('Cookie', adminCookie)
        .send({ moderationStatus: 'approved' });

      expect(modRes.status).toBe(200);
      expect(modRes.body.data.review.moderationStatus).toBe('approved');
    });

    it('allows owner to edit permitted review and rejects unauthorized customer edits', async () => {
      const editRes = await request(app)
        .put(`/api/v1/reviews/${createdReviewId}`)
        .set('Cookie', customerCookie)
        .send({
          rating: 4,
          title: 'Updated: Excellent duffel',
          reviewText: 'After 3 tournaments, zipper and shoe pocket holding up exceptionally well.'
        });

      expect(editRes.status).toBe(200);
      expect(editRes.body.data.review.rating).toBe(4);
      expect(editRes.body.data.review.title).toBe('Updated: Excellent duffel');

      // Customer 2 attempt should be rejected with 403
      const unauthRes = await request(app)
        .put(`/api/v1/reviews/${createdReviewId}`)
        .set('Cookie', customer2Cookie)
        .send({ rating: 1, reviewText: 'Unauthorized edit attempt by different user' });

      expect(unauthRes.status).toBe(403);
    });
  });

  // ========================================================
  // FEATURE 4: EXPLAINABLE PRODUCT RECOMMENDATIONS
  // ========================================================
  describe('FEATURE 4: Explainable Product Recommendations', () => {
    it('returns explainable recommendations with reasons and excludes the target product', async () => {
      const res = await request(app).get(`/api/v1/products/${budgetProductCheap._id}/recommendations`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const recs = res.body.data.recommendations;
      expect(Array.isArray(recs)).toBe(true);

      // Must not recommend itself
      const selfRec = recs.find((r) => r._id.toString() === budgetProductCheap._id.toString());
      expect(selfRec).toBeUndefined();

      // If recommendations exist, verify recommendationReason tag
      if (recs.length > 0) {
        for (const rec of recs) {
          expect(rec.recommendationReason).toBeDefined();
          expect(typeof rec.recommendationReason).toBe('string');
          expect(rec.isActive).toBe(true);
        }
      }
    });
  });

  // ========================================================
  // FEATURE 5: RECENTLY VIEWED PRODUCTS
  // ========================================================
  describe('FEATURE 5: Recently Viewed Tracking', () => {
    it('records and retrieves recently viewed products for authenticated user', async () => {
      // 1. Record grip tape
      const postRes = await request(app)
        .post(`/api/v1/products/${budgetProductCheap._id}/recently-viewed`)
        .set('Cookie', customerCookie);
      expect(postRes.status).toBe(200);

      // 2. Fetch recently viewed
      const getRes = await request(app)
        .get('/api/v1/products/recently-viewed')
        .set('Cookie', customerCookie);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      const prods = getRes.body.data.products;
      expect(Array.isArray(prods)).toBe(true);
      expect(prods.length).toBeGreaterThanOrEqual(1);

      const found = prods.find((p) => p._id.toString() === budgetProductCheap._id.toString());
      expect(found).toBeDefined();
    });

    it('supports guest fallback list via comma-separated ids query param', async () => {
      const res = await request(app)
        .get('/api/v1/products/recently-viewed')
        .query({ ids: `${budgetProductCheap._id},${budgetProductExpensive._id}` });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(2);
    });
  });

  // ========================================================
  // FEATURE 6: SEARCH SUGGESTIONS
  // ========================================================
  describe('FEATURE 6: Search Suggestions', () => {
    it('returns structured suggestions with products, categories, sports, and brands', async () => {
      const res = await request(app)
        .get('/api/v1/products/search/suggestions')
        .query({ q: 'badmin' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      expect(data).toHaveProperty('products');
      expect(data).toHaveProperty('categories');
      expect(data).toHaveProperty('sports');
      expect(data).toHaveProperty('brands');

      // The badminton sport should be matched case-insensitively
      const lowerSports = data.sports.map((s) => s.toLowerCase());
      expect(lowerSports).toContain('badminton');
    });

    it('handles short or empty search strings gracefully without crashing', async () => {
      const res = await request(app)
        .get('/api/v1/products/search/suggestions')
        .query({ q: '' });

      expect(res.status).toBe(200);
      expect(res.body.data.products).toEqual([]);
      expect(res.body.data.categories).toEqual([]);
    });
  });

  // ========================================================
  // FEATURE 7: ADMIN ANALYTICS
  // ========================================================
  describe('FEATURE 7: Admin Analytics', () => {
    let cancelledOrder;

    beforeAll(async () => {
      // Create a cancelled order to ensure it is strictly excluded from qualifying revenue
      cancelledOrder = await Order.create({
        user: customer2User._id,
        items: [
          {
            product: budgetProductExpensive._id,
            sku: budgetProductExpensive.variants[0].sku,
            name: budgetProductExpensive.name,
            unitPriceInPaise: budgetProductExpensive.priceInPaise,
            quantity: 2,
            lineTotalInPaise: budgetProductExpensive.priceInPaise * 2
          }
        ],
        shippingAddress: {
          fullName: 'Rookie Player',
          phone: '9876543211',
          street: 'Hostel 1',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001'
        },
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        orderStatus: 'cancelled',
        subtotalInPaise: budgetProductExpensive.priceInPaise * 2,
        shippingFeeInPaise: 0,
        discountInPaise: 0,
        totalInPaise: budgetProductExpensive.priceInPaise * 2
      });

      // Create a valid TeamKitRequest for analytics
      await TeamKitRequest.create({
        requestReference: `TKR-TEST-${Date.now().toString().slice(-6)}`,
        user: customerUser._id,
        sport: 'Badminton',
        kitType: 'Team jersey',
        teamInfo: {
          teamName: 'DYP Badminton Varsity',
          organization: 'DY Patil University',
          contactPerson: 'Prathamesh',
          contactEmail: 'athlete.feat@dypulse.com',
          contactPhone: '9876543210'
        },
        design: {
          primaryColor: 'Navy Blue',
          jerseyStyle: 'Sublimated QuickDry'
        },
        status: 'Submitted',
        totalQuantity: 12,
        sizeBreakdown: { XS: 0, S: 0, M: 6, L: 6, XL: 0, XXL: 0 }
      });
    });

    it('rejects non-admin from accessing admin analytics', async () => {
      const res = await request(app)
        .get('/api/v1/orders/admin/analytics')
        .set('Cookie', customerCookie);

      expect(res.status).toBe(403);
    });

    it('returns complete database analytics to admin and excludes cancelled orders from revenue', async () => {
      const res = await request(app)
        .get('/api/v1/orders/admin/analytics')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // 1. Orders
      expect(data.orders).toBeDefined();
      expect(data.orders.total).toBeGreaterThanOrEqual(2);
      expect(data.orders.byStatus.cancelled).toBeGreaterThanOrEqual(1);

      // 2. Revenue (Strictly excludes cancelled order)
      expect(data.revenue).toBeDefined();
      expect(data.revenue.qualifyingRevenueInPaise).toBeGreaterThan(0);
      expect(data.revenue.averageOrderValueInPaise).toBeGreaterThan(0);

      // 3. Products & Low stock breakdown
      expect(data.products).toBeDefined();
      expect(data.products.total).toBeGreaterThan(0);
      expect(data.products.byDepartment.PLAY).toBeGreaterThan(0);
      expect(data.products.byDepartment.CAMPUS).toBeGreaterThan(0);
      expect(typeof data.products.lowStockVariantCount).toBe('number');

      // 4. Top selling products
      expect(Array.isArray(data.topSellingProducts)).toBe(true);

      // 5. Team kit statistics
      expect(data.teamKits).toBeDefined();
      expect(data.teamKits.total).toBeGreaterThanOrEqual(1);
    });
  });
});
