import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import app from '../src/app.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import PaymentWebhookEvent from '../src/models/PaymentWebhookEvent.js';
import config from '../src/config/index.js';
import './setup.js';

describe('DYPULSE Razorpay Payment Gateway & Test Mode Architecture', () => {
  let customerUser;
  let customerCookie;
  let testProduct;
  let testCategory;
  const TEST_SECRET = 'dypulse_test_rzp_secret_key_2026';
  const TEST_KEY_ID = 'rzp_test_DYPULSE2026';
  const TEST_WEBHOOK_SECRET = 'dypulse_webhook_secret_key_2026';

  beforeAll(async () => {
    // Configure test secrets in config for testing cryptographic verification
    config.razorpay.keyId = TEST_KEY_ID;
    config.razorpay.keySecret = TEST_SECRET;
    config.razorpay.webhookSecret = TEST_WEBHOOK_SECRET;

    // Create test category
    testCategory = await Category.findOneAndUpdate(
      { slug: 'cricket-gear' },
      { name: 'Cricket Gear', slug: 'cricket-gear', department: 'PLAY', isActive: true },
      { upsert: true, new: true }
    );

    // Create test product
    testProduct = await Product.findOneAndUpdate(
      { slug: 'varsity-cricket-bat' },
      {
        name: 'Varsity Tournament Cricket Bat',
        slug: 'varsity-cricket-bat',
        category: testCategory._id,
        department: 'PLAY',
        brand: 'DYPULSE PRO',
        priceInPaise: 249900, // ₹2,499
        stock: 50,
        isActive: true,
        variants: [
          { sku: 'CRIC-BAT-SH', size: 'Short Handle', stock: 25, priceOverrideInPaise: 249900 }
        ]
      },
      { upsert: true, new: true }
    );

    // Create test user and obtain session cookie
    await User.deleteMany({ email: 'athlete.payment@dypulse.edu' });
    customerUser = await User.create({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'athlete.payment@dypulse.edu',
      password: 'Password@123',
      role: 'customer',
      status: 'active'
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'athlete.payment@dypulse.edu', password: 'Password@123' });
    customerCookie = loginRes.headers['set-cookie'];
  });

  // Helper to create an order directly in DB for testing
  const createTestOrder = async (overrides = {}) => {
    return Order.create({
      user: customerUser._id,
      items: [
        {
          product: testProduct._id,
          sku: 'CRIC-BAT-SH',
          name: testProduct.name,
          size: 'Short Handle',
          unitPriceInPaise: 249900,
          quantity: 1,
          lineTotalInPaise: 249900
        }
      ],
      shippingAddress: {
        fullName: 'Rahul Sharma',
        phone: '9876543210',
        street: 'Hostel 3, Room 204, North Campus',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '400706'
      },
      paymentMethod: 'ONLINE',
      paymentStatus: 'pending',
      orderStatus: 'placed',
      subtotalInPaise: 249900,
      shippingChargeInPaise: 0,
      discountInPaise: 0,
      totalInPaise: 249900,
      ...overrides
    });
  };

  it('1. GET /api/v1/payments/config returns payment configuration and test mode flags', async () => {
    const res = await request(app).get('/api/v1/payments/config');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isConfigured).toBe(true);
    expect(res.body.data.isTestMode).toBe(true); // Since key starts with rzp_test_
    expect(res.body.data.keyId).toBe(TEST_KEY_ID);
    expect(res.body.data.supportedMethods).toContain('COD');
    expect(res.body.data.supportedMethods).toContain('ONLINE');
  });

  it('2. POST /api/v1/payments/verify successfully verifies authentic HMAC-SHA256 signature', async () => {
    const order = await createTestOrder();
    const razorpayOrderId = 'order_test_rzp_' + Date.now();
    const razorpayPaymentId = 'pay_test_rzp_' + Date.now();

    // Generate valid HMAC signature matching the server's secret
    const validSignature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Cookie', customerCookie)
      .send({
        orderId: order._id.toString(),
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.paymentStatus).toBe('paid');
    // Fulfillment status must remain separate!
    expect(res.body.data.order.orderStatus).toBe('placed');
    expect(res.body.data.order.paymentDetails.razorpayPaymentId).toBe(razorpayPaymentId);
    expect(res.body.data.order.paymentDetails.paidAt).not.toBeNull();
  });

  it('3. POST /api/v1/payments/verify rejects tampered or fraudulent signatures (400)', async () => {
    const order = await createTestOrder();
    const razorpayOrderId = 'order_test_rzp_' + Date.now();
    const razorpayPaymentId = 'pay_test_rzp_' + Date.now();
    const fakeSignature = 'deadbeef_fraudulent_signature_1234567890abcdef';

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Cookie', customerCookie)
      .send({
        orderId: order._id.toString(),
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: fakeSignature
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PAYMENT_SIGNATURE_MISMATCH');

    // Confirm order in database remains unpaid
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.paymentStatus).toBe('pending');
  });

  it('4. POST /api/v1/payments/verify rejects missing verification parameters (400)', async () => {
    const order = await createTestOrder();

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Cookie', customerCookie)
      .send({
        orderId: order._id.toString()
        // Missing razorpayOrderId, razorpayPaymentId, razorpaySignature
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_VERIFICATION_PARAMS');
  });

  it('5. POST /api/v1/payments/verify enforces idempotency on already paid orders', async () => {
    const order = await createTestOrder({
      paymentStatus: 'paid',
      paymentDetails: {
        razorpayOrderId: 'order_test_existing',
        razorpayPaymentId: 'pay_test_existing',
        paidAt: new Date()
      }
    });

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Cookie', customerCookie)
      .send({
        orderId: order._id.toString(),
        razorpayOrderId: 'order_test_existing',
        razorpayPaymentId: 'pay_test_existing',
        razorpaySignature: 'any_signature'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.alreadyPaid).toBe(true);
  });

  it('6. POST /api/v1/payments/verify blocks payment on cancelled orders (400)', async () => {
    const order = await createTestOrder({
      orderStatus: 'cancelled',
      cancellation: { reason: 'Student cancelled', cancelledAt: new Date(), restocked: true }
    });

    const validSignature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update('order_123|pay_123')
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Cookie', customerCookie)
      .send({
        orderId: order._id.toString(),
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: validSignature
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ORDER_CANCELLED');
  });

  it('7. POST /api/v1/payments/record-failure logs payment attempt failure while keeping fulfillment separate', async () => {
    const order = await createTestOrder();

    const res = await request(app)
      .post('/api/v1/payments/record-failure')
      .set('Cookie', customerCookie)
      .send({
        orderId: order._id.toString(),
        razorpayOrderId: 'order_fail_123',
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Payment failed due to insufficient student account balance',
          reason: 'payment_failed',
          step: 'payment_authorization'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.paymentStatus).toBe('failed');
    expect(updatedOrder.paymentDetails.failureReason).toContain('insufficient student account balance');
    // Order fulfillment status must remain 'placed' so student can retry or switch to COD!
    expect(updatedOrder.orderStatus).toBe('placed');
  });

  it('8. POST /api/v1/payments/switch-method/:id allows switching between ONLINE and COD', async () => {
    const order = await createTestOrder();

    // Switch from ONLINE to COD
    const resCod = await request(app)
      .post(`/api/v1/payments/switch-method/${order._id}`)
      .set('Cookie', customerCookie)
      .send({ newMethod: 'COD' });

    expect(resCod.status).toBe(200);
    expect(resCod.body.data.order.paymentMethod).toBe('COD');
    expect(resCod.body.data.order.paymentStatus).toBe('pending');

    // Switch back from COD to ONLINE
    const resOnline = await request(app)
      .post(`/api/v1/payments/switch-method/${order._id}`)
      .set('Cookie', customerCookie)
      .send({ newMethod: 'ONLINE' });

    expect(resOnline.status).toBe(200);
    expect(resOnline.body.data.order.paymentMethod).toBe('ONLINE');
  });

  it('9. POST /api/v1/payments/webhook rejects webhook calls without signature (400)', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .send({ event: 'payment.captured' });

    expect(res.status).toBe(400);
  });

  it('10. POST /api/v1/payments/webhook rejects calls with invalid signature (400)', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', 'invalid_signature_hex')
      .send({ event: 'payment.captured' });

    expect(res.status).toBe(400);
  });

  it('11. POST /api/v1/payments/webhook processes payment.captured and marks order paid', async () => {
    const rzpOrderId = 'order_webhook_' + Date.now();
    const order = await createTestOrder({
      'paymentDetails.razorpayOrderId': rzpOrderId
    });

    const webhookBody = {
      event_id: 'evt_captured_' + Date.now(),
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_webhook_' + Date.now(),
            order_id: rzpOrderId,
            amount: 249900,
            status: 'captured'
          }
        }
      }
    };

    const rawString = JSON.stringify(webhookBody);
    const validWebhookSig = crypto
      .createHmac('sha256', TEST_WEBHOOK_SECRET)
      .update(rawString)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', validWebhookSig)
      .send(webhookBody);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');

    const updated = await Order.findById(order._id);
    expect(updated.paymentStatus).toBe('paid');
  });

  it('12. POST /api/v1/payments/webhook drops duplicate webhook events idempotently', async () => {
    const eventId = 'evt_duplicate_guard_' + Date.now();
    await PaymentWebhookEvent.create({
      eventId,
      eventType: 'payment.captured',
      payload: {}
    });

    const webhookBody = {
      event_id: eventId,
      event: 'payment.captured',
      payload: {}
    };

    const rawString = JSON.stringify(webhookBody);
    const validWebhookSig = crypto
      .createHmac('sha256', TEST_WEBHOOK_SECRET)
      .update(rawString)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', validWebhookSig)
      .send(webhookBody);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('already_processed');
  });

  it('13. COD orders remain fully available and preserve pending payment status upon creation', async () => {
    const order = await createTestOrder({
      paymentMethod: 'COD',
      paymentStatus: 'pending'
    });

    expect(order.paymentMethod).toBe('COD');
    expect(order.paymentStatus).toBe('pending');
    expect(order.orderStatus).toBe('placed');
  });
});
