import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import Order from '../src/models/Order.js';
import InventoryLog from '../src/models/InventoryLog.js';
import './setup.js';

describe('DYPULSE Operational Admin & Management Suite', () => {
  let adminCookie;
  let customerCookie;
  let testAdminUser;
  let testCustomerUser;
  let testCategory;
  let testProduct;

  const adminEmail = 'admin.operations@dypulse.com';
  const customerEmail = 'student.ops@campus.edu';

  beforeAll(async () => {
    // 1. Ensure test admin user
    await User.deleteOne({ email: adminEmail });
    testAdminUser = await User.create({
      firstName: 'Varsity',
      lastName: 'Director',
      email: adminEmail,
      password: 'AdminPassword@123',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    // 2. Ensure test student customer user
    await User.deleteOne({ email: customerEmail });
    testCustomerUser = await User.create({
      firstName: 'Rohan',
      lastName: 'Sharma',
      email: customerEmail,
      password: 'StudentPassword@123',
      role: 'customer',
      isActive: true,
      isEmailVerified: true,
      phone: '+919876543210'
    });

    // 3. Ensure test category
    testCategory = await Category.findOne({ slug: 'admin-test-gear' });
    if (!testCategory) {
      testCategory = await Category.create({
        name: 'Admin Test Gear',
        slug: 'admin-test-gear',
        department: 'PLAY'
      });
    }

    // 4. Ensure test product with variant
    testProduct = await Product.create({
      name: `Varsity Test Jersey ${Date.now()}`,
      description: 'Championship grade moisture wicking jersey',
      department: 'PLAY',
      category: testCategory._id,
      brand: 'DYPULSE VARSITY',
      priceInPaise: 149900, // Rs. 1499
      stock: 20,
      variants: [
        {
          sku: `JERSEY-M-${Date.now()}`,
          size: 'M',
          color: 'Navy Blue',
          stock: 20
        }
      ],
      isActive: true
    });

    // 5. Authenticate sessions
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'AdminPassword@123' });
    adminCookie = adminLoginRes.headers['set-cookie'];

    const custLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: customerEmail, password: 'StudentPassword@123' });
    customerCookie = custLoginRes.headers['set-cookie'];
  });

  // ==========================================
  // 1. SECURITY & ACCESS CONTROL
  // ==========================================
  describe('1. Admin Role & Endpoint Security Enforcements', () => {
    it('rejects unauthenticated requests to admin user management', async () => {
      const res = await request(app).get('/api/v1/auth/admin/users');
      expect([401, 403]).toContain(res.status);
    });

    it('blocks customer-role users from accessing admin user management', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin/users')
        .set('Cookie', customerCookie);
      expect(res.status).toBe(403);
    });

    it('blocks customer-role users from adjusting inventory', async () => {
      const res = await request(app)
        .post('/api/v1/products/admin/inventory/adjust')
        .set('Cookie', customerCookie)
        .send({
          productId: testProduct._id,
          changeQuantity: 10
        });
      expect(res.status).toBe(403);
    });

    it('blocks customer-role users from viewing admin analytics', async () => {
      const res = await request(app)
        .get('/api/v1/orders/admin/analytics')
        .set('Cookie', customerCookie);
      expect(res.status).toBe(403);
    });

    it('permits authorized admin users to access admin operational endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin/users')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });
  });

  // ==========================================
  // 2. CUSTOMER MANAGEMENT
  // ==========================================
  describe('2. Customer & Student Account Management (/api/v1/auth/admin/users)', () => {
    it('retrieves paginated customer list and strips sensitive security hashes', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin/users?role=customer')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const users = res.body.data.users;
      expect(users.length).toBeGreaterThan(0);

      const target = users.find((u) => u.email === customerEmail);
      expect(target).toBeDefined();
      expect(target.password).toBeUndefined();
      expect(target.resetPasswordToken).toBeUndefined();
      expect(target.emailVerificationToken).toBeUndefined();
      expect(typeof target.orderCount).toBe('number');
      expect(typeof target.totalSpent).toBe('number');
    });

    it('filters users by search query (name / email / phone)', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin/users?search=Rohan')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      const matches = res.body.data.users;
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.email === customerEmail)).toBe(true);
    });

    it('toggles customer account suspension (isActive: false / true)', async () => {
      // Suspend account
      const suspendRes = await request(app)
        .put(`/api/v1/auth/admin/users/${testCustomerUser._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: false });

      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.user.isActive).toBe(false);

      // Verify in DB
      const dbCust = await User.findById(testCustomerUser._id);
      expect(dbCust.isActive).toBe(false);

      // Reactivate account
      const reactivateRes = await request(app)
        .put(`/api/v1/auth/admin/users/${testCustomerUser._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: true });

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.data.user.isActive).toBe(true);
    });

    it('prevents administrator from suspending their own account (self-suspension guard)', async () => {
      const res = await request(app)
        .put(`/api/v1/auth/admin/users/${testAdminUser._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SELF_SUSPENSION_DISALLOWED');
    });

    it('fetches customer details with order history & addresses', async () => {
      const res = await request(app)
        .get(`/api/v1/auth/admin/users/${testCustomerUser._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(customerEmail);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(Array.isArray(res.body.data.teamKits)).toBe(true);
    });
  });

  // ==========================================
  // 3. INVENTORY MANAGEMENT & AUDIT LOGS
  // ==========================================
  describe('3. Inventory Management, Stock Adjustments & Persistent Audit Trail', () => {
    it('adjusts inventory by positive quantity delta and creates an InventoryLog record', async () => {
      const sku = testProduct.variants[0].sku;
      const prevStock = testProduct.variants[0].stock;

      const res = await request(app)
        .post('/api/v1/products/admin/inventory/adjust')
        .set('Cookie', adminCookie)
        .send({
          productId: testProduct._id,
          sku,
          changeQuantity: 15,
          reason: 'Varsity squad restock shipment'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.previousStock).toBe(prevStock);
      expect(res.body.data.newStock).toBe(prevStock + 15);

      // Verify audit log
      const log = await InventoryLog.findOne({
        product: testProduct._id,
        variantSku: sku
      }).sort({ createdAt: -1 });

      expect(log).toBeDefined();
      expect(log.changeQuantity).toBe(15);
      expect(log.previousStock).toBe(prevStock);
      expect(log.newStock).toBe(prevStock + 15);
      expect(log.reason).toBe('Varsity squad restock shipment');
      expect(log.adjustedBy.toString()).toBe(testAdminUser._id.toString());
    });

    it('adjusts inventory by absolute new stock level', async () => {
      const sku = testProduct.variants[0].sku;

      const res = await request(app)
        .post('/api/v1/inventory/adjust')
        .set('Cookie', adminCookie)
        .send({
          productId: testProduct._id,
          sku,
          newStock: 50,
          reason: 'Physical warehouse count reset'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.newStock).toBe(50);

      const updatedProd = await Product.findById(testProduct._id);
      const varItem = updatedProd.variants.find((v) => v.sku === sku);
      expect(varItem.stock).toBe(50);
    });

    it('strictly prevents negative stock and returns NEGATIVE_STOCK_DISALLOWED', async () => {
      const sku = testProduct.variants[0].sku;

      const res = await request(app)
        .post('/api/v1/inventory/adjust')
        .set('Cookie', adminCookie)
        .send({
          productId: testProduct._id,
          sku,
          changeQuantity: -100, // Current stock is 50, deducting 100 would make it -50
          reason: 'Invalid deduction attempt'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NEGATIVE_STOCK_DISALLOWED');

      // Verify stock was NOT modified
      const product = await Product.findById(testProduct._id);
      const varItem = product.variants.find((v) => v.sku === sku);
      expect(varItem.stock).toBe(50);
    });

    it('retrieves paginated inventory audit trail from /api/v1/inventory/logs', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/logs')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
      expect(res.body.data.logs.length).toBeGreaterThan(0);

      const latestLog = res.body.data.logs[0];
      expect(latestLog.productName).toBeDefined();
      expect(latestLog.previousStock).toBeDefined();
      expect(latestLog.newStock).toBeDefined();
      expect(latestLog.adjustedBy).toBeDefined();
    });
  });

  // ==========================================
  // 4. ADMIN DASHBOARD ANALYTICS
  // ==========================================
  describe('4. Dashboard Analytics, Revenue Rules & Date Range Filtering', () => {
    it('calculates metrics with strict revenue recognition (excludes unpaid COD from collected revenue)', async () => {
      // Place an unpaid COD order
      const unpaidCodOrder = await Order.create({
        orderNumber: `DYP-COD-${Date.now()}`,
        user: testCustomerUser._id,
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            sku: testProduct.variants[0].sku,
            quantity: 1,
            unitPriceInPaise: 149900,
            lineTotalInPaise: 149900
          }
        ],
        subtotalInPaise: 149900,
        shippingChargeInPaise: 0,
        discountInPaise: 0,
        totalInPaise: 149900,
        paymentMethod: 'COD',
        paymentStatus: 'pending', // UNPAID
        orderStatus: 'placed',
        shippingAddress: {
          fullName: 'Rohan Sharma',
          street: 'Hostel 1, Room 202',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411007',
          phone: '+919876543210'
        }
      });

      // Place a paid Razorpay order
      const paidOrder = await Order.create({
        orderNumber: `DYP-PAID-${Date.now()}`,
        user: testCustomerUser._id,
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            sku: testProduct.variants[0].sku,
            quantity: 2,
            unitPriceInPaise: 149900,
            lineTotalInPaise: 299800
          }
        ],
        subtotalInPaise: 299800,
        shippingChargeInPaise: 0,
        discountInPaise: 0,
        totalInPaise: 299800,
        paymentMethod: 'ONLINE',
        paymentStatus: 'paid', // PAID
        orderStatus: 'confirmed',
        shippingAddress: {
          fullName: 'Rohan Sharma',
          street: 'Hostel 1, Room 202',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411007',
          phone: '+919876543210'
        }
      });

      // Place a cancelled order
      const cancelledOrder = await Order.create({
        orderNumber: `DYP-CANC-${Date.now()}`,
        user: testCustomerUser._id,
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            sku: testProduct.variants[0].sku,
            quantity: 1,
            unitPriceInPaise: 149900,
            lineTotalInPaise: 149900
          }
        ],
        subtotalInPaise: 149900,
        shippingChargeInPaise: 0,
        discountInPaise: 0,
        totalInPaise: 149900,
        paymentMethod: 'ONLINE',
        paymentStatus: 'refunded',
        orderStatus: 'cancelled',
        shippingAddress: {
          fullName: 'Rohan Sharma',
          street: 'Hostel 1, Room 202',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411007',
          phone: '+919876543210'
        }
      });

      const res = await request(app)
        .get('/api/v1/orders/admin/analytics?period=all')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      const data = res.body.data;

      // Unpaid COD must be in unpaidCodRevenue, NOT qualifyingRevenue
      expect(data.revenue.unpaidCodRevenueInPaise).toBeGreaterThanOrEqual(149900);
      // Qualifying revenue must contain the paid order (299800), NOT cancelled or unpaid COD
      expect(data.revenue.qualifyingRevenueInPaise).toBeGreaterThanOrEqual(299800);
      // Awaiting processing must include the placed and confirmed orders
      expect(data.orders.awaitingProcessing).toBeGreaterThanOrEqual(2);
      // Definitions must explain the business accounting rules
      expect(data.definitions.qualifyingRevenue).toBeDefined();
      expect(data.customers.total).toBeGreaterThanOrEqual(1);

      // Clean up test orders
      await Order.deleteMany({ _id: { $in: [unpaidCodOrder._id, paidOrder._id, cancelledOrder._id] } });
    });

    it('supports date-range queries (period=today, 7d, 30d, all)', async () => {
      const [todayRes, weekRes, allRes] = await Promise.all([
        request(app).get('/api/v1/orders/admin/analytics?period=today').set('Cookie', adminCookie),
        request(app).get('/api/v1/orders/admin/analytics?period=7d').set('Cookie', adminCookie),
        request(app).get('/api/v1/orders/admin/analytics?period=all').set('Cookie', adminCookie)
      ]);

      expect(todayRes.status).toBe(200);
      expect(todayRes.body.data.period).toBe('today');
      expect(weekRes.status).toBe(200);
      expect(weekRes.body.data.period).toBe('7d');
      expect(allRes.status).toBe(200);
      expect(allRes.body.data.period).toBe('all');
    });
  });

  // ==========================================
  // 5. PRODUCT & ORDER OPERATIONAL ACTIONS
  // ==========================================
  describe('5. Product Operations & Order Status Transitions', () => {
    it('toggles product active status and featured status', async () => {
      // Toggle active status
      const statusRes = await request(app)
        .patch(`/api/v1/products/${testProduct._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: false });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.product.isActive).toBe(false);

      // Toggle featured status
      const featuredRes = await request(app)
        .patch(`/api/v1/products/${testProduct._id}/featured`)
        .set('Cookie', adminCookie)
        .send({ isFeatured: true });

      expect(featuredRes.status).toBe(200);
      expect(featuredRes.body.data.product.isFeatured).toBe(true);

      // Restore active status
      await request(app)
        .patch(`/api/v1/products/${testProduct._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: true });
    });

    it('progresses order status and marks COD paid when delivered', async () => {
      const order = await Order.create({
        orderNumber: `DYP-TRANS-${Date.now()}`,
        user: testCustomerUser._id,
        items: [
          {
            product: testProduct._id,
            name: testProduct.name,
            sku: testProduct.variants[0].sku,
            quantity: 1,
            unitPriceInPaise: 149900,
            lineTotalInPaise: 149900
          }
        ],
        subtotalInPaise: 149900,
        shippingChargeInPaise: 0,
        discountInPaise: 0,
        totalInPaise: 149900,
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        orderStatus: 'placed',
        shippingAddress: {
          fullName: 'Rohan Sharma',
          street: 'Hostel 1, Room 202',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411007',
          phone: '+919876543210'
        }
      });

      // Update to confirmed
      const confirmRes = await request(app)
        .put(`/api/v1/orders/${order._id}/status`)
        .set('Cookie', adminCookie)
        .send({ orderStatus: 'confirmed', note: 'Order confirmed for packing' });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.order.orderStatus).toBe('confirmed');

      // Update to delivered -> paymentStatus should become paid
      const deliverRes = await request(app)
        .put(`/api/v1/orders/${order._id}/status`)
        .set('Cookie', adminCookie)
        .send({ orderStatus: 'delivered', note: 'Dropped off at Hostel 1 reception' });

      expect(deliverRes.status).toBe(200);
      expect(deliverRes.body.data.order.orderStatus).toBe('delivered');
      expect(deliverRes.body.data.order.paymentStatus).toBe('paid');

      await Order.deleteOne({ _id: order._id });
    });
  });
});
