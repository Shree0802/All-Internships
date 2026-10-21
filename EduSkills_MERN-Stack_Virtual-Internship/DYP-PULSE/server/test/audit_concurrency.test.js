import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import Coupon from '../src/models/Coupon.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Cart from '../src/models/Cart.js';
import './setup.js';

describe('DYPULSE Concurrency, Race Condition, Rollback & Variant Audit', () => {
  let customer1Cookie;
  let customer2Cookie;
  let adminCookie;
  let customer1User;
  let customer2User;
  let testCategory;

  beforeAll(async () => {
    // 1. Ensure test category
    testCategory = await Category.findOne({ slug: 'concurrency-gear' });
    if (!testCategory) {
      testCategory = await Category.create({
        name: 'Concurrency Gear',
        slug: 'concurrency-gear',
        department: 'PLAY'
      });
    }

    // 2. Ensure Customer 1
    customer1User = await User.findOne({ email: 'race_cust1@dypulse.com' });
    if (!customer1User) {
      customer1User = await User.create({
        firstName: 'Racer',
        lastName: 'One',
        email: 'race_cust1@dypulse.com',
        password: 'Password@123',
        role: 'customer'
      });
    }

    // 3. Ensure Customer 2
    customer2User = await User.findOne({ email: 'race_cust2@dypulse.com' });
    if (!customer2User) {
      customer2User = await User.create({
        firstName: 'Racer',
        lastName: 'Two',
        email: 'race_cust2@dypulse.com',
        password: 'Password@123',
        role: 'customer'
      });
    }

    // 4. Ensure Admin
    let adminUser = await User.findOne({ email: 'admin@dypulse.com' });
    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dypulse.com',
        password: 'DypulseAdmin@2024',
        role: 'admin'
      });
    }

    // Authenticate sessions
    const c1Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'race_cust1@dypulse.com', password: 'Password@123' });
    expect(c1Res.status).toBe(200);
    customer1Cookie = c1Res.headers['set-cookie'];

    const c2Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'race_cust2@dypulse.com', password: 'Password@123' });
    expect(c2Res.status).toBe(200);
    customer2Cookie = c2Res.headers['set-cookie'];

    const aRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@dypulse.com', password: 'DypulseAdmin@2024' });
    expect(aRes.status).toBe(200);
    adminCookie = aRes.headers['set-cookie'];
  });

  // =========================================================================
  // 1. CONCURRENCY: TWO CUSTOMERS PURCHASING LAST REMAINING UNIT
  // =========================================================================
  it('prevents overselling when two customers race to purchase the last unit', async () => {
    // Create product with exactly 1 unit of stock
    const raceSku = `RACE-BAT-${Date.now()}`;
    const singleStockProduct = await Product.create({
      name: `Limited Edition Bat ${Date.now()}`,
      description: 'Only 1 unit in varsity store',
      department: 'PLAY',
      category: testCategory._id,
      brand: 'DYPULSE VARSITY',
      priceInPaise: 150000, // Rs. 1,500
      stock: 1,
      variants: [
        {
          sku: raceSku,
          size: 'Standard',
          color: 'Navy',
          stock: 1
        }
      ],
      isActive: true
    });

    // Populate both customers' carts with that single unit
    await Cart.findOneAndUpdate(
      { user: customer1User._id },
      {
        items: [
          {
            product: singleStockProduct._id,
            sku: raceSku,
            size: 'Standard',
            color: 'Navy',
            quantity: 1,
            priceInPaise: 150000
          }
        ]
      },
      { upsert: true }
    );

    await Cart.findOneAndUpdate(
      { user: customer2User._id },
      {
        items: [
          {
            product: singleStockProduct._id,
            sku: raceSku,
            size: 'Standard',
            color: 'Navy',
            quantity: 1,
            priceInPaise: 150000
          }
        ]
      },
      { upsert: true }
    );

    const shippingPayload = {
      street: 'Varsity Sports Complex',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400706'
    };

    // Both users fire checkout requests concurrently
    const [order1Res, order2Res] = await Promise.all([
      request(app)
        .post('/api/v1/orders')
        .set('Cookie', customer1Cookie)
        .send({ shippingAddress: shippingPayload, paymentMethod: 'COD' }),
      request(app)
        .post('/api/v1/orders')
        .set('Cookie', customer2Cookie)
        .send({ shippingAddress: shippingPayload, paymentMethod: 'COD' })
    ]);

    const statuses = [order1Res.status, order2Res.status];
    // Exactly one should succeed (201) and one should fail due to stock depletion (400 or 409)
    expect(statuses).toContain(201);
    expect(statuses.some((s) => s === 409 || s === 400)).toBe(true);

    // Verify stock in database is strictly 0 and never negative
    const refreshedProduct = await Product.findById(singleStockProduct._id);
    expect(refreshedProduct.stock).toBe(0);
    expect(refreshedProduct.variants[0].stock).toBe(0);
  });

  // =========================================================================
  // 2. MULTI-ITEM ORDER ROLLBACK & COUPON ROLLBACK
  // =========================================================================
  it('rolls back previously reserved items and coupon when a multi-item order fails midway', async () => {
    const item1Sku = `MULTI-1-${Date.now()}`;
    const item2Sku = `MULTI-2-${Date.now()}`;

    // Item 1 has 5 units in stock
    const item1 = await Product.create({
      name: `Multi-Rollback Item 1 ${Date.now()}`,
      description: 'Has ample stock',
      department: 'PLAY',
      category: testCategory._id,
      brand: 'DYPULSE',
      priceInPaise: 60000, // Rs. 600
      stock: 5,
      variants: [{ sku: item1Sku, size: 'M', color: 'White', stock: 5 }],
      isActive: true
    });

    // Item 2 has 0 units in stock
    const item2 = await Product.create({
      name: `Multi-Rollback Item 2 ${Date.now()}`,
      description: 'Out of stock',
      department: 'PLAY',
      category: testCategory._id,
      brand: 'DYPULSE',
      priceInPaise: 80000, // Rs. 800
      stock: 0,
      variants: [{ sku: item2Sku, size: 'L', color: 'Black', stock: 0 }],
      isActive: true
    });

    // Setup coupon
    const couponCode = `RBK_${Date.now().toString().slice(-8)}`;
    await Coupon.create({
      code: couponCode,
      description: 'Test rollback coupon',
      discountType: 'fixed',
      discountValue: 100, // Rs 100
      minOrderAmountInPaise: 50000,
      expiresAt: new Date(Date.now() + 86400000),
      usageLimit: 5,
      usageCount: 0,
      isActive: true
    });

    // Setup cart for customer 1 with both items
    await Cart.findOneAndUpdate(
      { user: customer1User._id },
      {
        items: [
          {
            product: item1._id,
            sku: item1Sku,
            size: 'M',
            color: 'White',
            quantity: 2,
            priceInPaise: 60000
          },
          {
            product: item2._id,
            sku: item2Sku,
            size: 'L',
            color: 'Black',
            quantity: 1,
            priceInPaise: 80000
          }
        ],
        couponCode
      },
      { upsert: true }
    );

    // Attempt checkout
    const checkoutRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customer1Cookie)
      .send({
        shippingAddress: {
          street: 'Hostel 4, Room 102',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD',
        couponCode
      });

    // Checkout should fail due to item 2 insufficient stock
    expect(checkoutRes.status).toBe(400);
    expect(checkoutRes.body.code).toBe('INSUFFICIENT_STOCK');

    // Verify Item 1 stock remains intact at 5 (not decremented to 3)
    const refreshedItem1 = await Product.findById(item1._id);
    expect(refreshedItem1.stock).toBe(5);
    expect(refreshedItem1.variants[0].stock).toBe(5);

    // Verify coupon usageCount remains 0 (not incremented)
    const refreshedCoupon = await Coupon.findOne({ code: couponCode });
    expect(refreshedCoupon.usageCount).toBe(0);
  });

  // =========================================================================
  // 3. VARIANT MISMATCH REJECTION
  // =========================================================================
  it('rejects adding or checking out mismatched or non-existent variants', async () => {
    const varSku = `LEGIT-VAR-${Date.now()}`;
    const productWithVariants = await Product.create({
      name: `Pro Jersey ${Date.now()}`,
      description: 'Jersey with defined size variants',
      department: 'PLAY',
      category: testCategory._id,
      brand: 'DYPULSE',
      priceInPaise: 99900,
      stock: 10,
      variants: [
        { sku: varSku, size: 'Medium', color: 'Navy', stock: 10 }
      ],
      isActive: true
    });

    // 1. Attempt to add invalid SKU to cart
    const badSkuAddRes = await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customer1Cookie)
      .send({
        productId: productWithVariants._id.toString(),
        sku: 'FAKE-NONEXISTENT-SKU',
        quantity: 1
      });

    expect(badSkuAddRes.status).toBe(400);
    expect(badSkuAddRes.body.code).toBe('VARIANT_MISMATCH');

    // 2. Attempt to add invalid size/color to cart
    const badSizeAddRes = await request(app)
      .post('/api/v1/cart/add')
      .set('Cookie', customer1Cookie)
      .send({
        productId: productWithVariants._id.toString(),
        size: 'XXXXL',
        color: 'Neon Pink',
        quantity: 1
      });

    expect(badSizeAddRes.status).toBe(400);
    expect(badSizeAddRes.body.code).toBe('VARIANT_MISMATCH');

    // 3. Verify attempting to checkout directly with mismatched variant in cart is rejected
    await Cart.findOneAndUpdate(
      { user: customer1User._id },
      {
        items: [
          {
            product: productWithVariants._id,
            sku: 'CORRUPTED-SKU',
            size: 'Unknown',
            color: 'Unknown',
            quantity: 1,
            priceInPaise: 99900
          }
        ]
      },
      { upsert: true }
    );

    const badCheckoutRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customer1Cookie)
      .send({
        shippingAddress: {
          street: 'Campus Road',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD'
      });

    expect(badCheckoutRes.status).toBe(400);
    expect(badCheckoutRes.body.code).toBe('VARIANT_MISMATCH');

    // Verify stock is untouched
    const checkProduct = await Product.findById(productWithVariants._id);
    expect(checkProduct.variants[0].stock).toBe(10);
  });

  // =========================================================================
  // 4. COUPON CONCURRENCY LIMIT ENFORCEMENT
  // =========================================================================
  it('enforces coupon usage limits under concurrent checkout attempts', async () => {
    const limitedSku = `COUPON-RACE-${Date.now()}`;
    const product = await Product.create({
      name: `Varsity Hoodie ${Date.now()}`,
      description: 'Hoodie for coupon test',
      department: 'CAMPUS',
      category: testCategory._id,
      brand: 'DYPULSE',
      priceInPaise: 120000, // Rs. 1,200
      stock: 20,
      variants: [{ sku: limitedSku, size: 'L', color: 'Maroon', stock: 20 }],
      isActive: true
    });

    // Create coupon with strictly 1 total usage limit
    const exclusiveCouponCode = `ONE_${Date.now().toString().slice(-8)}`;
    await Coupon.create({
      code: exclusiveCouponCode,
      description: 'Strict 1 use coupon',
      discountType: 'fixed',
      discountValue: 200, // Rs 200
      minOrderAmountInPaise: 50000,
      expiresAt: new Date(Date.now() + 86400000),
      usageLimit: 1,
      usageCount: 0,
      isActive: true
    });

    // Seed both customer carts with the product and exclusive coupon
    await Cart.findOneAndUpdate(
      { user: customer1User._id },
      {
        items: [
          {
            product: product._id,
            sku: limitedSku,
            size: 'L',
            color: 'Maroon',
            quantity: 1,
            priceInPaise: 120000
          }
        ],
        couponCode: exclusiveCouponCode
      },
      { upsert: true }
    );

    await Cart.findOneAndUpdate(
      { user: customer2User._id },
      {
        items: [
          {
            product: product._id,
            sku: limitedSku,
            size: 'L',
            color: 'Maroon',
            quantity: 1,
            priceInPaise: 120000
          }
        ],
        couponCode: exclusiveCouponCode
      },
      { upsert: true }
    );

    const shippingPayload = {
      street: 'Hostel 7, Room 303',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400706'
    };

    // Both users place order concurrently with the same 1-use coupon
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/v1/orders')
        .set('Cookie', customer1Cookie)
        .send({ shippingAddress: shippingPayload, paymentMethod: 'COD', couponCode: exclusiveCouponCode }),
      request(app)
        .post('/api/v1/orders')
        .set('Cookie', customer2Cookie)
        .send({ shippingAddress: shippingPayload, paymentMethod: 'COD', couponCode: exclusiveCouponCode })
    ]);

    // Check how many orders succeeded with discount applied
    const order1Discount = res1.body?.data?.order?.discountInPaise || 0;
    const order2Discount = res2.body?.data?.order?.discountInPaise || 0;

    // At most 1 order should receive the coupon discount
    const discountedOrders = [order1Discount, order2Discount].filter((d) => d > 0);
    expect(discountedOrders.length).toBeLessThanOrEqual(1);

    // Verify database coupon usageCount is strictly <= usageLimit (1)
    const refreshedCoupon = await Coupon.findOne({ code: exclusiveCouponCode });
    expect(refreshedCoupon.usageCount).toBeLessThanOrEqual(1);
  });

  // =========================================================================
  // 5. INACTIVE PRODUCT CHECKOUT REJECTION
  // =========================================================================
  it('prevents placing an order if cart contains a deactivated product', async () => {
    const inactiveSku = `DEACT-${Date.now()}`;
    const product = await Product.create({
      name: `Discontinued Shorts ${Date.now()}`,
      description: 'Discontinued product',
      department: 'PLAY',
      category: testCategory._id,
      brand: 'DYPULSE',
      priceInPaise: 79900,
      stock: 10,
      variants: [{ sku: inactiveSku, size: '32', color: 'Black', stock: 10 }],
      isActive: true
    });

    // Customer adds to cart while active
    await Cart.findOneAndUpdate(
      { user: customer1User._id },
      {
        items: [
          {
            product: product._id,
            sku: inactiveSku,
            size: '32',
            color: 'Black',
            quantity: 1,
            priceInPaise: 79900
          }
        ]
      },
      { upsert: true }
    );

    // Admin deactivates product
    product.isActive = false;
    await product.save();

    // Customer attempts checkout
    const checkoutRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customer1Cookie)
      .send({
        shippingAddress: {
          street: 'Main Quadrangle',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD'
      });

    expect(checkoutRes.status).toBe(400);
    expect(checkoutRes.body.code).toBe('PRODUCT_UNAVAILABLE');

    // Verify stock was not deducted
    const refreshed = await Product.findById(product._id);
    expect(refreshed.stock).toBe(10);
    expect(refreshed.variants[0].stock).toBe(10);
  });

  // =========================================================================
  // 6. ORDER CANCELLATION RESTORES STOCK AND REPLENISHES COUPON
  // =========================================================================
  it('restores variant stock and coupon usage when an order is cancelled', async () => {
    const cancelSku = `CANCEL-GEAR-${Date.now()}`;
    const product = await Product.create({
      name: `Track Jacket ${Date.now()}`,
      description: 'Varsity jacket for cancel test',
      department: 'CAMPUS',
      category: testCategory._id,
      brand: 'DYPULSE',
      priceInPaise: 180000, // Rs. 1,800
      stock: 10,
      variants: [{ sku: cancelSku, size: 'XL', color: 'Gold', stock: 10 }],
      isActive: true
    });

    const couponCode = `RST_${Date.now().toString().slice(-8)}`;
    await Coupon.create({
      code: couponCode,
      description: 'Restock test coupon',
      discountType: 'percentage',
      discountValue: 10, // 10%
      minOrderAmountInPaise: 50000,
      expiresAt: new Date(Date.now() + 86400000),
      usageLimit: 10,
      usageCount: 0,
      isActive: true
    });

    // Customer places order for 3 units
    await Cart.findOneAndUpdate(
      { user: customer1User._id },
      {
        items: [
          {
            product: product._id,
            sku: cancelSku,
            size: 'XL',
            color: 'Gold',
            quantity: 3,
            priceInPaise: 180000
          }
        ],
        couponCode
      },
      { upsert: true }
    );

    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', customer1Cookie)
      .send({
        shippingAddress: {
          street: 'Hostel 1, Room 204',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706'
        },
        paymentMethod: 'COD',
        couponCode
      });

    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body.data.order._id;

    // Check stock was decremented from 10 to 7
    let midProduct = await Product.findById(product._id);
    expect(midProduct.variants[0].stock).toBe(7);
    expect(midProduct.stock).toBe(7);

    // Check coupon usageCount is 1
    let midCoupon = await Coupon.findOne({ code: couponCode });
    expect(midCoupon.usageCount).toBe(1);

    // Cancel the order
    const cancelRes = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Cookie', customer1Cookie)
      .send({ reason: 'Changed mind about size' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.order.orderStatus).toBe('cancelled');

    // Check stock was restored back to 10
    const finalProduct = await Product.findById(product._id);
    expect(finalProduct.variants[0].stock).toBe(10);
    expect(finalProduct.stock).toBe(10);

    // Check coupon usageCount was restored back to 0
    const finalCoupon = await Coupon.findOne({ code: couponCode });
    expect(finalCoupon.usageCount).toBe(0);

    // Verify idempotency: calling cancel again does not replenish stock twice
    const secondCancelRes = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Cookie', customer1Cookie)
      .send({ reason: 'Duplicate cancel call' });

    // Should be rejected because already cancelled
    expect(secondCancelRes.status).toBe(400);

    const checkProductAfterSecond = await Product.findById(product._id);
    expect(checkProductAfterSecond.variants[0].stock).toBe(10);
  });
});
