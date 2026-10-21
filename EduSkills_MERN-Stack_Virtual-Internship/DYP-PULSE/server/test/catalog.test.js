import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import './setup.js';

describe('DYPULSE Complete Catalog, Category, Variant & Inventory Suite', () => {
  let adminCookie;
  let customerCookie;
  let testCategory;

  const adminEmail = 'admin@dypulse.com';
  const adminPassword = 'DypulseAdmin@2024';
  const customerEmail = 'customer@dypulse.com';
  const customerPassword = 'Customer@123';

  beforeAll(async () => {
    // 1. Authenticate Admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    adminCookie = adminLogin.headers['set-cookie'];

    // 2. Authenticate Customer
    const customerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: customerEmail, password: customerPassword });
    customerCookie = customerLogin.headers['set-cookie'];

    // 3. Ensure a test Category exists
    testCategory = await Category.findOne({ slug: 'cricket' });
    if (!testCategory) {
      testCategory = await Category.create({
        name: 'Test Cricket Category',
        slug: 'cricket',
        department: 'PLAY',
        description: 'Cricket testing equipment'
      });
    }

    // 4. Backfill any existing products that might lack priceInPaise
    const legacyProducts = await Product.find({ priceInPaise: { $exists: false } });
    for (const lp of legacyProducts) {
      const rawPrice = lp.get('price') || 999;
      lp.priceInPaise = Math.round(rawPrice * 100);
      await lp.save();
    }
  });

  // 1. Product creation with variants and integer paise
  it('1. Product creation: Admin can create product with variants, integer paise prices, and category ref', async () => {
    const uniqueName = `Test Varsity Jersey ${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookie)
      .send({
        name: uniqueName,
        description: 'Heavyweight match jersey designed for tournament finals.',
        department: 'PLAY',
        category: testCategory._id.toString(),
        brand: 'DYPULSE PLAY',
        sport: 'cricket',
        price: 999, // In rupees
        compareAtPrice: 1499,
        variants: [
          { sku: `TEST-JRS-M-${Date.now()}`, size: 'M', color: 'Navy', stock: 15 },
          { sku: `TEST-JRS-L-${Date.now()}`, size: 'L', color: 'Navy', stock: 20 }
        ],
        tags: ['varsity', 'jersey', 'cricket'],
        isFeatured: true
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const prod = res.body.data.product;
    expect(prod.name).toBe(uniqueName);
    expect(prod.priceInPaise).toBe(99900); // 999 * 100
    expect(prod.compareAtPriceInPaise).toBe(149900);
    expect(prod.stock).toBe(35); // Sum of variant stock (15 + 20)
    expect(prod.variants.length).toBe(2);
    expect(prod.slug).toBeDefined();
  });

  // 2. Product updates
  it('2. Product updates: Admin can modify details, price, and specifications', async () => {
    const product = await Product.findOne({ isActive: true });
    expect(product).toBeDefined();

    const res = await request(app)
      .put(`/api/v1/products/${product._id}`)
      .set('Cookie', adminCookie)
      .send({
        description: 'Updated description for collegiate athletes.',
        price: 1299
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.priceInPaise).toBe(129900);
    expect(res.body.data.product.description).toContain('collegiate athletes');
  });

  // 3. Invalid prices validation
  it('3. Invalid prices: Rejects negative prices or non-integer paise values', async () => {
    const resNegative = await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookie)
      .send({
        name: 'Negative Price Product',
        description: 'Invalid pricing item',
        department: 'PLAY',
        category: testCategory._id.toString(),
        brand: 'DYPULSE',
        price: -50 // Negative price
      });

    expect(resNegative.status).toBe(400);
    expect(resNegative.body.error.code).toBe('VALIDATION_ERROR');

    const resNonInteger = await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookie)
      .send({
        name: 'Non Integer Paise Product',
        description: 'Invalid pricing item',
        department: 'PLAY',
        category: testCategory._id.toString(),
        brand: 'DYPULSE',
        price: 100,
        priceInPaise: 100.55 // Floating point paise!
      });

    expect(resNonInteger.status).toBe(400);
  });

  // 4. Invalid stock validation
  it('4. Invalid stock: Rejects negative stock quantities or non-integers', async () => {
    const resNegativeStock = await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookie)
      .send({
        name: 'Negative Stock Product',
        description: 'Invalid stock test',
        department: 'PLAY',
        category: testCategory._id.toString(),
        brand: 'DYPULSE',
        price: 599,
        stock: -10
      });

    expect(resNegativeStock.status).toBe(400);
    expect(resNegativeStock.body.error.code).toBe('VALIDATION_ERROR');
  });

  // 5. Duplicate SKUs rejection
  it('5. Duplicate SKUs: Rejects products with duplicate variant SKUs', async () => {
    const duplicateSku = `DUP-SKU-${Date.now()}`;

    // Create first product with SKU
    await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookie)
      .send({
        name: `Product Alpha ${Date.now()}`,
        description: 'Testing duplicate SKU enforcement',
        department: 'CAMPUS',
        category: testCategory._id.toString(),
        brand: 'DYPULSE',
        price: 499,
        variants: [{ sku: duplicateSku, size: 'M', stock: 10 }]
      });

    // Attempt second product with the same SKU
    const secondRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', adminCookie)
      .send({
        name: `Product Beta ${Date.now()}`,
        description: 'Testing duplicate SKU rejection',
        department: 'CAMPUS',
        category: testCategory._id.toString(),
        brand: 'DYPULSE',
        price: 499,
        variants: [{ sku: duplicateSku, size: 'L', stock: 10 }]
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.error.code).toBe('DUPLICATE_SKU');
  });

  // 6. Search query
  it('6. Search: Returns products matching text search across name and description', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({ search: 'bat' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  // 7. Filters (Department, Category, Sport, Price range)
  it('7. Filters: Accurately filters by department, sport, and price bounds', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({
        department: 'PLAY',
        sport: 'cricket',
        minPrice: 500,
        maxPrice: 6000
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.products.forEach((p) => {
      expect(p.department).toBe('PLAY');
      expect(p.priceInPaise).toBeGreaterThanOrEqual(50000);
      expect(p.priceInPaise).toBeLessThanOrEqual(600000);
    });
  });

  // 8. Pagination
  it('8. Pagination: Bounded pagination returns correct page, limit, and total count', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({ page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeLessThanOrEqual(5);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
    expect(res.body.data.pagination.total).toBeGreaterThan(5);
  });

  // 9. Sorting
  it('9. Sorting: Accurately sorts products by price ascending and price descending', async () => {
    const resAsc = await request(app)
      .get('/api/v1/products')
      .query({ sort: 'price_asc', limit: 10 });

    expect(resAsc.status).toBe(200);
    const prices = resAsc.body.data.products.map((p) => p.priceInPaise ?? (p.price * 100));
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }

    const resDesc = await request(app)
      .get('/api/v1/products')
      .query({ sort: 'price_desc', limit: 10 });

    expect(resDesc.status).toBe(200);
    const descPrices = resDesc.body.data.products.map((p) => p.priceInPaise ?? (p.price * 100));
    for (let i = 0; i < descPrices.length - 1; i++) {
      expect(descPrices[i]).toBeGreaterThanOrEqual(descPrices[i + 1]);
    }
  });

  // 10. Product variants & inventory management
  it('10. Variants & Inventory: Admin can add variant, update stock, and audit stock levels', async () => {
    const product = await Product.findOne({ isActive: true });
    expect(product).toBeDefined();

    const newSku = `VAR-NEW-${Date.now()}`;
    const addVarRes = await request(app)
      .post(`/api/v1/products/${product._id}/variants`)
      .set('Cookie', adminCookie)
      .send({
        sku: newSku,
        size: 'XL',
        color: 'Heather Grey',
        stock: 12
      });

    expect(addVarRes.status).toBe(201);
    expect(addVarRes.body.data.product.variants.some((v) => v.sku === newSku)).toBe(true);

    // Update variant stock directly
    const patchRes = await request(app)
      .patch(`/api/v1/products/${product._id}/inventory`)
      .set('Cookie', adminCookie)
      .send({
        sku: newSku,
        stock: 50
      });

    expect(patchRes.status).toBe(200);
    const updated = await Product.findById(product._id);
    const variant = updated.variants.find((v) => v.sku === newSku);
    expect(variant.stock).toBe(50);
  });

  // 11. Unauthorized administration rejection
  it('11. Role authorization: Customers and unauthenticated visitors cannot create or modify products', async () => {
    // Unauthenticated
    const unauthRes = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Hacker Product' });
    expect(unauthRes.status).toBe(401);

    // Customer attempting admin action
    const customerRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', customerCookie)
      .send({ name: 'Customer Attempt Product' });
    expect(customerRes.status).toBe(403);
    expect(customerRes.body.error.code).toBe('FORBIDDEN');
  });

  // 12. Image uploads: Validation and fallback
  it('12. Image uploads: Rejects invalid file types and non-admin uploads; accepts valid images', async () => {
    // Customer cannot upload
    const customerUpload = await request(app)
      .post('/api/v1/uploads')
      .set('Cookie', customerCookie)
      .attach('image', Buffer.from('fake image data'), 'test.jpg');
    expect(customerUpload.status).toBe(403);

    // Rejects non-image file type (e.g. .txt)
    const invalidType = await request(app)
      .post('/api/v1/uploads')
      .set('Cookie', adminCookie)
      .attach('image', Buffer.from('not an image text'), 'malicious.txt');
    expect(invalidType.status).toBe(400);

    // Valid image upload succeeds (using local disk development fallback or Cloudinary)
    const validUpload = await request(app)
      .post('/api/v1/uploads')
      .set('Cookie', adminCookie)
      .attach('image', Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'), 'sample.gif');
    expect(validUpload.status).toBe(201);
    expect(validUpload.body.data.image.url).toBeDefined();
    expect(validUpload.body.data.image.publicId).toBeDefined();
  });

  // 13. Soft deactivation
  it('13. Soft deactivation: DELETE /api/v1/products/:id deactivates product without corrupting data', async () => {
    const product = await Product.create({
      name: `Soft Delete Test ${Date.now()}`,
      description: 'Product for soft deactivation test',
      department: 'CAMPUS',
      category: testCategory._id,
      brand: 'DYPULSE',
      priceInPaise: 49900,
      stock: 10,
      isActive: true
    });

    const delRes = await request(app)
      .delete(`/api/v1/products/${product._id}`)
      .set('Cookie', adminCookie);

    expect(delRes.status).toBe(200);

    // Document still exists in database, but isActive is false
    const inDb = await Product.findById(product._id);
    expect(inDb).toBeDefined();
    expect(inDb.isActive).toBe(false);

    // Public catalog query omits inactive product
    const publicQuery = await request(app).get(`/api/v1/products/${product.slug}`);
    expect(publicQuery.status).toBe(404);
  });

  // 14. Categories API
  it('14. Categories: Lists active categories and supports admin category creation', async () => {
    // Public list
    const listRes = await request(app).get('/api/v1/categories');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data.categories)).toBe(true);

    // Admin create category
    const catName = `Varsity Accessories ${Date.now()}`;
    const createRes = await request(app)
      .post('/api/v1/categories')
      .set('Cookie', adminCookie)
      .send({
        name: catName,
        department: 'PLAY',
        description: 'Accessories for varsity athletes'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.category.name).toBe(catName);
    expect(createRes.body.data.category.slug).toBeDefined();
  });
});
