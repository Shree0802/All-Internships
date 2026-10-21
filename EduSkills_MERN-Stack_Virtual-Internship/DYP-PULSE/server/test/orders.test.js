import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import Coupon from '../src/models/Coupon.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import './setup.js';

describe('Comprehensive Cart, Wishlist, Checkout, and Order Lifecycle API', () => {
  let customerCookie;
  let adminCookie;
  let customer2Cookie;
  let testCategory;
  let testProduct;
  let singleStockProduct;
  let createdOrderId;

  beforeAll(async () => {
    // 1. Ensure test category
    testCategory = await Category.findOne({ slug: 'cricket' });
    if (!testCategory) {
      testCategory = await Category.create({
        name: 'Cricket Gear',
        slug: 'cricket',
        department: 'PLAY'
      });
    }

    // 2. Ensure admin account
    let admin = await User.findOne({ email: 'admin@dypulse.com' });
    if (!admin) {
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dypulse.com',
        password: 'DypulseAdmin@2024',
        role: 'admin'
      });
    }

    // 3. Ensure test customer 1
    let customer = await User.findOne({ email: 'customer@dypulse.com' });
    if (!customer) {
      customer = await User.create({
        firstName: 'Test',
        lastName: 'Athlete',
        email: 'customer@dypulse.com',
        password: 'Customer@123',
        role: 'customer'
      });
    }

    // 4. Ensure test customer 2 (for authorization tests)
    let customer2 = await User.findOne({ email: 'rival@dypulse.com' });
    if (!customer2) {
      customer2 = await User.create({
        firstName: 'Rival',
        lastName: 'Athlete',
        email: 'rival@dypulse.com',
        password: 'Customer@123',
        role: 'customer'
      });
    }

    // 5. Ensure test coupon
    await Coupon.findOneAndUpdate(
      { code: 'CAMPUS10' },
      {
        $set: {
          code: 'CAMPUS10',
          description: '10% student promo',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmountInPaise: 49900, // Rs 499
          maxDiscountInPaise: 50000,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          usageLimit: 1000,
          isActive: true
        }
      },
      { upsert: true }
    );
  });

  it('authenticates customer and admin sessions', async () => {
    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer@dypulse.com', password: 'Customer@123' });
    expect(custRes.status).toBe(200);
    customerCookie = custRes.headers['set-cookie'];
    expect(customerCookie).toBeDefined();

    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@dypulse.com', password: 'DypulseAdmin@2024' });
    expect(adminRes.status).toBe(200);
    adminCookie = adminRes.headers['set-cookie'];
    expect(adminCookie).toBeDefined();

    const cust2Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rival@dypulse.com', password: 'Customer@123' });
    expect(cust2Res.status).toBe(200);
    customer2Cookie = cust2Res.headers['set-cookie'];
  });

  // ==========================================
  // CART TESTS
  // ==========================================
  it('adds a product variant to user cart and prevents duplicate line items', async () => {
    testProduct = await Product.create({
      name: `English Willow Bat ${Date.now()}`,
      description: 'Grade 1 tournament willow cricket bat',
      department: 'PLAY',
      category: testCategory._id,
      brand: 'DYPULSE PLAY',
      priceInPaise: 299900, // Rs. 2,999
      variants: [
        { sku: `BAT-SH-${Date.now()}`, size: 'Short Handle', color: 'Natural', stock: 15 },
        { sku: `BAT-LH-${Date.now()}`, size: 'Long Handle', color: 'Natural', stock: 10 }
      ],
      isActive: true
    });

    const targetVariant = testProduct.variants[0];

    // Clear cart first
    await request(app).delete('/api/v1/cart/clear').set('Cookie', customerCookie);

    // 1st add: 2 units
    const res1 = await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customerCookie)
      .send({
        productId: testProduct._id.toString(),
        sku: targetVariant.sku,
        size: targetVariant.size,
        color: targetVariant.color,
        quantity: 2
      });

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.cart.items.length).toBe(1);
    expect(res1.body.data.cart.items[0].quantity).toBe(2);

    // 2nd add of identical item: should update existing item quantity (2 + 1 = 3), not duplicate!
    const res2 = await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customerCookie)
      .send({
        productId: testProduct._id.toString(),
        sku: targetVariant.sku,
        size: targetVariant.size,
        color: targetVariant.color,
        quantity: 1
      });

    expect(res2.status).toBe(200);
    expect(res2.body.data.cart.items.length).toBe(1);
    expect(res2.body.data.cart.items[0].quantity).toBe(3);
  });

  it('enforces available stock limits on cart quantity updates', async () => {
    const cartRes = await request(app).get('/api/v1/cart').set('Cookie', customerCookie);
    const item = cartRes.body.data.cart.items[0];

    // Attempt to update quantity to 999 (exceeds stock of 15)
    const overRes = await request(app)
      .put(`/api/v1/cart/${item._id}`)
      .set('Cookie', customerCookie)
      .send({ quantity: 999 });

    expect(overRes.status).toBe(400);
    expect(overRes.body.code).toBe('INSUFFICIENT_STOCK');

    // Valid update to 4
    const validRes = await request(app)
      .put(`/api/v1/cart/${item._id}`)
      .set('Cookie', customerCookie)
      .send({ quantity: 4 });

    expect(validRes.status).toBe(200);
    expect(validRes.body.data.cart.items[0].quantity).toBe(4);
  });

  it('resists client price tampering by relying authoritatively on database priceInPaise', async () => {
    // Attempt adding with fraudulent price
    const fakePriceRes = await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customerCookie)
      .send({
        productId: testProduct._id.toString(),
        sku: testProduct.variants[1].sku,
        size: testProduct.variants[1].size,
        color: testProduct.variants[1].color,
        quantity: 1,
        price: 1, // Attempt to buy for Re. 1
        priceInPaise: 100
      });

    expect(fakePriceRes.status).toBe(200);
    const addedItem = fakePriceRes.body.data.cart.items.find(
      (it) => it.sku === testProduct.variants[1].sku
    );
    // Verified that authoritative database price (299900 paise = Rs 2999) was used!
    expect(addedItem.priceInPaise).toBe(299900);
  });

  // ==========================================
  // WISHLIST TESTS
  // ==========================================
  it('persists items in wishlist, prevents duplicates, and allows moving to cart', async () => {
    // 1. Add to wishlist
    const addWishRes = await request(app)
      .post('/api/v1/wishlist')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id.toString() });

    expect(addWishRes.status).toBe(201);
    expect(addWishRes.body.data.count).toBeGreaterThan(0);

    // 2. Prevent duplicate add
    const dupWishRes = await request(app)
      .post('/api/v1/wishlist')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id.toString() });

    expect(dupWishRes.status).toBe(200);
    expect(dupWishRes.body.message).toContain('already in wishlist');

    // 3. Retrieve wishlist
    const getWishRes = await request(app)
      .get('/api/v1/wishlist')
      .set('Cookie', customerCookie);

    expect(getWishRes.status).toBe(200);
    expect(getWishRes.body.data.wishlist.some((w) => w.productId === testProduct._id.toString())).toBe(true);

    // 4. Move item to cart
    const moveRes = await request(app)
      .post(`/api/v1/wishlist/move-to-cart/${testProduct._id.toString()}`)
      .set('Cookie', customerCookie)
      .send({ quantity: 1 });

    expect(moveRes.status).toBe(200);
    expect(moveRes.body.success).toBe(true);

    // Verify item is removed from wishlist
    const postMoveWish = await request(app)
      .get('/api/v1/wishlist')
      .set('Cookie', customerCookie);
    expect(postMoveWish.body.data.wishlist.some((w) => w.productId === testProduct._id.toString())).toBe(false);
  });

  // ==========================================
  // COUPON VALIDATION TESTS
  // ==========================================
  it('validates coupons, rejects expired/nonexistent codes, and enforces min spend', async () => {
    // Valid coupon above min spend (Rs 499)
    const validRes = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'CAMPUS10', subtotalInPaise: 150000 }); // Rs 1,500

    expect(validRes.status).toBe(200);
    expect(validRes.body.data.discountInPaise).toBe(15000); // 10% = Rs 150 = 15,000 paise

    // Below min spend
    const underRes = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'CAMPUS10', subtotalInPaise: 20000 }); // Rs 200 < Rs 499

    expect(underRes.status).toBe(400);
    expect(underRes.body.code).toBe('COUPON_NOT_APPLICABLE');

    // Non-existent coupon
    const invalidRes = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'BOGUS99', subtotalInPaise: 150000 });

    expect(invalidRes.status).toBe(404);
  });

  // ==========================================
  // CHECKOUT & COD ORDER CREATION
  // ==========================================
  it('calculates checkout summary with free shipping above Rs 1000 and applies coupon', async () => {
    const summaryRes = await request(app)
      .post('/api/v1/orders/calculate-summary')
      .set('Cookie', customerCookie)
      .send({ couponCode: 'CAMPUS10' });

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.subtotalInPaise).toBeGreaterThan(100000);
    expect(summaryRes.body.data.shippingChargeInPaise).toBe(0); // Free delivery >= 1000
    expect(summaryRes.body.data.discountInPaise).toBeGreaterThan(0);
    expect(summaryRes.body.data.totalInPaise).toBe(
      summaryRes.body.data.subtotalInPaise - summaryRes.body.data.discountInPaise
    );
  });

  it('places a Cash on Delivery (COD) order with item snapshots and decrements inventory', async () => {
    const prodBefore = await Product.findById(testProduct._id);
    const initialVariantStock = prodBefore.variants[0].stock;

    // Clean cart and add 2 units of variant 0
    await request(app).delete('/api/v1/cart/clear').set('Cookie', customerCookie);
    await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customerCookie)
      .send({
        productId: testProduct._id.toString(),
        sku: testProduct.variants[0].sku,
        quantity: 2
      });

    const idempotencyKey = `IDEMP-TEST-${Date.now()}`;

    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customerCookie)
      .send({
        shippingAddress: {
          fullName: 'Test Athlete',
          phone: '+91 98765 43210',
          street: 'Hostel Block 4, Room 302',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD',
        couponCode: 'CAMPUS10',
        idempotencyKey,
        notes: 'Hostel security drop'
      });

    expect(orderRes.status).toBe(201);
    const order = orderRes.body.data.order;
    createdOrderId = order._id;

    expect(order.orderNumber).toMatch(/^DYP-/);
    expect(order.paymentMethod).toBe('COD');
    expect(order.paymentStatus).toBe('pending');
    expect(order.orderStatus).toBe('placed');
    expect(order.items[0].sku).toBe(testProduct.variants[0].sku);
    expect(order.items[0].unitPriceInPaise).toBe(299900);
    expect(order.items[0].lineTotalInPaise).toBe(599800); // 299900 * 2
    expect(order.statusHistory.length).toBeGreaterThan(0);

    // Verify inventory was decremented
    const prodAfter = await Product.findById(testProduct._id);
    expect(prodAfter.variants[0].stock).toBe(initialVariantStock - 2);

    // Verify cart was cleared
    const cartRes = await request(app).get('/api/v1/cart').set('Cookie', customerCookie);
    expect(cartRes.body.data.cart.items.length).toBe(0);

    // Duplicate submission with identical idempotencyKey returns existing order
    const dupOrderRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customerCookie)
      .send({
        shippingAddress: {
          street: 'Hostel Block 4, Room 302',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD',
        idempotencyKey
      });

    expect(dupOrderRes.status).toBe(200);
    expect(dupOrderRes.body.data.order._id).toBe(createdOrderId);
  });

  // ==========================================
  // INVENTORY CONSISTENCY & CONCURRENCY
  // ==========================================
  it('prevents purchasing beyond available stock and prevents negative inventory', async () => {
    // Create product with only 1 item in stock
    singleStockProduct = await Product.create({
      name: `Limited Edition Varsity Cap ${Date.now()}`,
      description: 'Single last cap in stock',
      department: 'CAMPUS',
      category: testCategory._id,
      brand: 'DYPULSE CAMPUS',
      priceInPaise: 99900,
      variants: [
        { sku: `CAP-LAST-${Date.now()}`, size: 'Free Size', color: 'Navy', stock: 1 }
      ],
      isActive: true
    });

    // Customer 1 adds the last 1 item
    await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customerCookie)
      .send({
        productId: singleStockProduct._id.toString(),
        sku: singleStockProduct.variants[0].sku,
        quantity: 1
      });

    // Customer 1 places order and takes the last item
    const buyRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customerCookie)
      .send({
        shippingAddress: {
          street: 'Hostel 1',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD'
      });

    expect(buyRes.status).toBe(201);

    // Check that stock is now 0
    const capAfter = await Product.findById(singleStockProduct._id);
    expect(capAfter.variants[0].stock).toBe(0);

    // Customer 2 attempts to add and buy the now out-of-stock item
    const addFailRes = await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customer2Cookie)
      .send({
        productId: singleStockProduct._id.toString(),
        sku: singleStockProduct.variants[0].sku,
        quantity: 1
      });

    expect(addFailRes.status).toBe(400);
    expect(addFailRes.body.code).toBe('INSUFFICIENT_STOCK');

    // Verify stock did not drop below 0
    const finalCap = await Product.findById(singleStockProduct._id);
    expect(finalCap.variants[0].stock).toBe(0);
  });

  // ==========================================
  // AUTHORIZATION & OWNERSHIP
  // ==========================================
  it('forbids customers from accessing other customers orders', async () => {
    // Customer 2 tries to access Customer 1's order
    const forbidRes = await request(app)
      .get(`/api/v1/orders/${createdOrderId}`)
      .set('Cookie', customer2Cookie);

    expect(forbidRes.status).toBe(403);
    expect(forbidRes.body.code).toBe('FORBIDDEN');

    // Customer 1 can access their own order
    const ownRes = await request(app)
      .get(`/api/v1/orders/${createdOrderId}`)
      .set('Cookie', customerCookie);

    expect(ownRes.status).toBe(200);
    expect(ownRes.body.data.order._id).toBe(createdOrderId);
  });

  // ==========================================
  // ORDER CANCELLATION & INVENTORY RESTOCK
  // ==========================================
  it('cancels customer order and automatically replenishes inventory in MongoDB', async () => {
    const prodBefore = await Product.findById(testProduct._id);
    const stockBeforeCancel = prodBefore.variants[0].stock;

    const cancelRes = await request(app)
      .post(`/api/v1/orders/${createdOrderId}/cancel`)
      .set('Cookie', customerCookie)
      .send({ reason: 'Tournament cancelled by university' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.order.orderStatus).toBe('cancelled');
    expect(cancelRes.body.data.order.cancellation.restocked).toBe(true);

    // Verify stock was restored (+2 units)
    const prodAfter = await Product.findById(testProduct._id);
    expect(prodAfter.variants[0].stock).toBe(stockBeforeCancel + 2);
  });

  // ==========================================
  // ADMIN ORDER MANAGEMENT & AUDIT LOG
  // ==========================================
  it('allows admin to query all orders and advance fulfillment status with audit logging', async () => {
    // 1. Admin gets all orders with filtering
    const allRes = await request(app)
      .get('/api/v1/orders/all?orderStatus=ALL')
      .set('Cookie', adminCookie);

    expect(allRes.status).toBe(200);
    expect(allRes.body.data.orders.length).toBeGreaterThan(0);

    // Place a new order to test fulfillment transitions
    await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customerCookie)
      .send({
        productId: testProduct._id.toString(),
        sku: testProduct.variants[0].sku,
        quantity: 1
      });

    const newOrderRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customerCookie)
      .send({
        shippingAddress: {
          street: 'Hostel 2',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD'
      });

    const fulfillOrderId = newOrderRes.body.data.order._id;

    // Admin updates: placed -> confirmed
    const confRes = await request(app)
      .put(`/api/v1/orders/${fulfillOrderId}/status`)
      .set('Cookie', adminCookie)
      .send({ orderStatus: 'confirmed', note: 'Order verified by campus store' });

    expect(confRes.status).toBe(200);
    expect(confRes.body.data.order.orderStatus).toBe('confirmed');

    // Admin updates: confirmed -> shipped
    const shipRes = await request(app)
      .put(`/api/v1/orders/${fulfillOrderId}/status`)
      .set('Cookie', adminCookie)
      .send({ orderStatus: 'shipped', note: 'Dispatched with campus delivery runner' });

    expect(shipRes.status).toBe(200);
    expect(shipRes.body.data.order.orderStatus).toBe('shipped');

    // Admin updates: shipped -> delivered (for COD, payment status automatically marks as paid)
    const delivRes = await request(app)
      .put(`/api/v1/orders/${fulfillOrderId}/status`)
      .set('Cookie', adminCookie)
      .send({ orderStatus: 'delivered', note: 'Delivered at hostel reception' });

    expect(delivRes.status).toBe(200);
    expect(delivRes.body.data.order.orderStatus).toBe('delivered');
    expect(delivRes.body.data.order.paymentStatus).toBe('paid');

    // Verify audit statusHistory contains full trail
    const finalOrder = await Order.findById(fulfillOrderId);
    expect(finalOrder.statusHistory.length).toBeGreaterThanOrEqual(4);
    const statuses = finalOrder.statusHistory.map((s) => s.status);
    expect(statuses).toContain('placed');
    expect(statuses).toContain('confirmed');
    expect(statuses).toContain('shipped');
    expect(statuses).toContain('delivered');
  });
});
