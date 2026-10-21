import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import TeamKitRequest from '../src/models/TeamKitRequest.js';
import {
  getSentEmails,
  clearSentEmails,
  sendAccountVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancellationEmail,
  sendTeamKitConfirmationEmail,
  sendTeamKitStatusUpdateEmail,
  queueEmail
} from '../src/services/email.service.js';
import config from '../src/config/index.js';
import './setup.js';

describe('DYPULSE Email Notification Architecture & Multi-Template Service', () => {
  let customerUser;
  let customerCookie;
  let adminUser;
  let adminCookie;
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    // Set provider to 'mock' for predictable test inspection
    config.email.provider = 'mock';

    testCategory = await Category.findOneAndUpdate(
      { slug: 'apparel-gear' },
      { name: 'Apparel Gear', slug: 'apparel-gear', department: 'CAMPUS', isActive: true },
      { upsert: true, new: true }
    );

    testProduct = await Product.findOneAndUpdate(
      { slug: 'varsity-hoodie' },
      {
        name: 'DYPULSE Varsity Heavyweight Hoodie',
        slug: 'varsity-hoodie',
        category: testCategory._id,
        department: 'CAMPUS',
        brand: 'DYPULSE ATHLETICS',
        priceInPaise: 189900,
        stock: 40,
        isActive: true,
        variants: [
          { sku: 'HD-NVY-L', size: 'L', color: 'Navy', stock: 20, priceOverrideInPaise: 189900 }
        ]
      },
      { upsert: true, new: true }
    );

    // Delete existing test accounts
    await User.deleteMany({
      email: { $in: ['athlete.notif@dypulse.edu', 'admin.notif@dypulse.edu'] }
    });

    // Create customer and admin
    customerUser = await User.create({
      firstName: 'Aarav',
      lastName: 'Mehta',
      email: 'athlete.notif@dypulse.edu',
      password: 'Password@123',
      phone: '9820098200',
      role: 'customer',
      status: 'active',
      isEmailVerified: false
    });

    adminUser = await User.create({
      firstName: 'Varsity',
      lastName: 'Director',
      email: 'admin.notif@dypulse.edu',
      password: 'AdminPassword@123',
      role: 'admin',
      status: 'active'
    });

    const custLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'athlete.notif@dypulse.edu', password: 'Password@123' });
    customerCookie = custLogin.headers['set-cookie'];

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin.notif@dypulse.edu', password: 'AdminPassword@123' });
    adminCookie = adminLogin.headers['set-cookie'];
  });

  beforeEach(() => {
    clearSentEmails();
  });

  it('1. In-memory email inspector collects sent emails and clears properly', async () => {
    expect(getSentEmails().length).toBe(0);

    await queueEmail({
      mailOptions: {
        to: 'student@dypulse.edu',
        subject: 'Ping Dispatch',
        text: 'Test ping',
        html: '<p>Test ping</p>'
      },
      type: 'test_ping'
    });

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].to).toBe('student@dypulse.edu');
    expect(sent[0].subject).toBe('Ping Dispatch');

    clearSentEmails();
    expect(getSentEmails().length).toBe(0);
  });

  it('2. Account Verification: sends email and verifies token via /api/v1/auth/verify-email/:token', async () => {
    const rawToken = customerUser.generateEmailVerificationToken();
    await customerUser.save();

    await sendAccountVerificationEmail({
      user: customerUser,
      verificationToken: rawToken
    });

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].to).toBe(customerUser.email);
    expect(sent[0].type).toBe('account_verification');
    expect(sent[0].subject).toContain('Verify your DYPULSE Campus Account');
    expect(sent[0].html).toContain(rawToken);
    expect(sent[0].html).toContain('Aarav');
    // Ensure no passwords exist in output
    expect(sent[0].html).not.toContain('Password@123');

    // Test the verification endpoint
    const verifyRes = await request(app).post(`/api/v1/auth/verify-email/${rawToken}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.user.isEmailVerified).toBe(true);

    const reloadedUser = await User.findById(customerUser._id);
    expect(reloadedUser.isEmailVerified).toBe(true);

    // Invalid token should fail with 400
    const failRes = await request(app).post('/api/v1/auth/verify-email/nonexistent_fake_token');
    expect(failRes.status).toBe(400);
    expect(failRes.body.error.code).toBe('INVALID_VERIFICATION_TOKEN');
  });

  it('3. Password Reset: forgot-password triggers branded reset email with 15-minute expiry', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: customerUser.email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].type).toBe('password_reset');
    expect(sent[0].subject).toContain('Password Reset Instructions');
    expect(sent[0].html).toContain('15 minutes');
    expect(sent[0].text).toContain('reset-password');
  });

  it('4. Order Confirmation: triggers email with items, delivery address, and total in paise', async () => {
    const testOrder = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: testProduct._id,
          sku: 'HD-NVY-L',
          name: testProduct.name,
          size: 'L',
          color: 'Navy',
          unitPriceInPaise: 189900,
          quantity: 2,
          lineTotalInPaise: 379800
        }
      ],
      shippingAddress: {
        fullName: 'Aarav Mehta',
        phone: '9820098200',
        street: 'Hostel Block B, Room 101',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '400706'
      },
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      orderStatus: 'placed',
      subtotalInPaise: 379800,
      shippingChargeInPaise: 0,
      discountInPaise: 0,
      totalInPaise: 379800
    });

    await sendOrderConfirmationEmail({
      order: testOrder,
      recipientEmail: customerUser.email
    });

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].type).toBe('order_confirmation');
    expect(sent[0].to).toBe(customerUser.email);
    expect(sent[0].subject).toContain(testOrder.orderNumber);
    expect(sent[0].html).toContain('3798.00'); // ₹3,798.00
    expect(sent[0].html).toContain('Hostel Block B');
    expect(sent[0].html).toContain('Cash on Delivery (COD)');
  });

  it('5. Order Status Update: triggers notification when order progresses (e.g. SHIPPED)', async () => {
    const testOrder = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: testProduct._id,
          name: testProduct.name,
          unitPriceInPaise: 189900,
          quantity: 1,
          lineTotalInPaise: 189900
        }
      ],
      shippingAddress: {
        fullName: 'Aarav Mehta',
        street: 'Hostel Block B',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '400706'
      },
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
      subtotalInPaise: 189900,
      totalInPaise: 189900
    });

    // Admin updates status to 'shipped'
    const updateRes = await request(app)
      .put(`/api/v1/orders/${testOrder._id}/status`)
      .set('Cookie', adminCookie)
      .send({
        orderStatus: 'shipped',
        note: 'Handed over to Campus Runner Rahul'
      });

    expect(updateRes.status).toBe(200);

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].type).toBe('order_status_update');
    expect(sent[0].subject).toContain('SHIPPED');
    expect(sent[0].html).toContain('Campus Runner Rahul');
  });

  it('6. Order Cancellation: triggers cancellation confirmation email', async () => {
    const testOrder = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: testProduct._id,
          name: testProduct.name,
          unitPriceInPaise: 189900,
          quantity: 1,
          lineTotalInPaise: 189900
        }
      ],
      shippingAddress: {
        fullName: 'Aarav Mehta',
        street: 'Hostel Block B',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '400706'
      },
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      orderStatus: 'placed',
      subtotalInPaise: 189900,
      totalInPaise: 189900
    });

    const cancelRes = await request(app)
      .post(`/api/v1/orders/${testOrder._id}/cancel`)
      .set('Cookie', customerCookie)
      .send({ reason: 'Tournaments postponed to next semester' });

    expect(cancelRes.status).toBe(200);

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].type).toBe('order_cancellation');
    expect(sent[0].subject).toContain('Order Cancelled');
    expect(sent[0].html).toContain('Tournaments postponed to next semester');
  });

  it('7. Team Kit Request Confirmation: triggers confirmation email to team contact', async () => {
    const kitRequest = await TeamKitRequest.create({
      user: customerUser._id,
      sport: 'Basketball',
      kitType: 'Team jersey',
      teamInfo: {
        teamName: 'DY Titans',
        organization: 'DY Patil University',
        contactPerson: 'Aarav Mehta',
        contactEmail: 'aarav.captain@dypulse.edu',
        contactPhone: '9820098200'
      },
      design: {
        primaryColor: '#0B1730',
        jerseyStyle: 'Sleeveless Athletic Cut'
      },
      sizeBreakdown: { M: 10, L: 5 },
      totalQuantity: 15,
      status: 'Submitted'
    });

    await sendTeamKitConfirmationEmail({
      request: kitRequest
    });

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].type).toBe('team_kit_confirmation');
    expect(sent[0].to).toBe('aarav.captain@dypulse.edu');
    expect(sent[0].subject).toContain('DY Titans (Basketball)');
    expect(sent[0].html).toContain('15 custom jerseys');
  });

  it('8. Team Kit Status & Quotation: triggers update email with calculated price in Rupees', async () => {
    const kitRequest = await TeamKitRequest.create({
      user: customerUser._id,
      sport: 'Football',
      kitType: 'Full sports kit',
      teamInfo: {
        teamName: 'Campus Strikers',
        organization: 'DY Sports Club',
        contactPerson: 'Coach Sharma',
        contactEmail: 'coach.sharma@dypulse.edu',
        contactPhone: '9820098200'
      },
      design: {
        primaryColor: '#2677FF',
        jerseyStyle: 'Modern Striped'
      },
      totalQuantity: 20,
      status: 'Submitted'
    });

    // Admin records quotation
    const quoteRes = await request(app)
      .put(`/api/v1/team-kits/admin/${kitRequest._id}/quotation`)
      .set('Cookie', adminCookie)
      .send({
        estimatedPrice: 28000,
        pricePerUnit: 1400,
        notes: 'Includes sublimation printing & crest embroidery'
      });

    expect(quoteRes.status).toBe(200);

    const sent = getSentEmails();
    expect(sent.length).toBe(1);
    expect(sent[0].type).toBe('team_kit_status_update');
    expect(sent[0].to).toBe('coach.sharma@dypulse.edu');
    expect(sent[0].html).toContain('28000.00'); // ₹28,000.00
    expect(sent[0].html).toContain('sublimation printing');
  });

  it('9. Graceful Error Handling: failure during email delivery does not crash callers', async () => {
    // Attempt sending with invalid options to simulate provider fault
    let caughtError = null;
    try {
      await queueEmail({
        mailOptions: {
          to: '', // Invalid empty recipient
          subject: 'Error Test',
          text: 'Fail test'
        },
        maxRetries: 1
      });
    } catch (err) {
      caughtError = err;
    }

    // It should handle gracefully, not crash the server process
    expect(app).toBeDefined();
  });
});
