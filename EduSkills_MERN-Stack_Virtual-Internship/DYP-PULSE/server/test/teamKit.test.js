import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import TeamKitRequest from '../src/models/TeamKitRequest.js';
import './setup.js';

describe('DYPULSE Team Kit Studio API', () => {
  let customerCookie;
  let rivalCustomerCookie;
  let adminCookie;
  let customerUser;
  let rivalUser;
  let adminUser;
  let createdRequestId;
  let createdRequestRef;

  beforeAll(async () => {
    // 1. Ensure test customer 1 (captain)
    customerUser = await User.findOne({ email: 'customer@dypulse.com' });
    if (!customerUser) {
      customerUser = await User.create({
        firstName: 'Virat',
        lastName: 'Captain',
        email: 'customer@dypulse.com',
        password: 'Customer@123',
        role: 'customer'
      });
    }

    // 2. Ensure test customer 2 (rival team captain)
    rivalUser = await User.findOne({ email: 'rival@dypulse.com' });
    if (!rivalUser) {
      rivalUser = await User.create({
        firstName: 'Rival',
        lastName: 'Captain',
        email: 'rival@dypulse.com',
        password: 'Customer@123',
        role: 'customer'
      });
    }

    // 3. Ensure test admin
    adminUser = await User.findOne({ email: 'admin@dypulse.com' });
    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Studio',
        lastName: 'Manager',
        email: 'admin@dypulse.com',
        password: 'DypulseAdmin@2024',
        role: 'admin'
      });
    }

    // Login customer 1
    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer@dypulse.com', password: 'Customer@123' });
    customerCookie = custRes.headers['set-cookie'];

    // Login rival customer 2
    const rivalRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rival@dypulse.com', password: 'Customer@123' });
    rivalCustomerCookie = rivalRes.headers['set-cookie'];

    // Login admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@dypulse.com', password: 'DypulseAdmin@2024' });
    adminCookie = adminRes.headers['set-cookie'];
  });

  // ==========================================
  // AUTHENTICATION & ACCESS CONTROL
  // ==========================================
  describe('Authentication & Access Control', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/team-kits/my-requests');
      expect(res.status).toBe(401);
    });

    it('blocks regular customers from accessing admin team kit endpoints with 403', async () => {
      const res = await request(app)
        .get('/api/v1/team-kits/admin/all')
        .set('Cookie', customerCookie);
      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // CUSTOMER REQUEST SUBMISSION & VALIDATION
  // ==========================================
  describe('Customer Request Submission', () => {
    it('validates required fields: missing sport and kitType returns 400', async () => {
      const res = await request(app)
        .post('/api/v1/team-kits')
        .set('Cookie', customerCookie)
        .send({
          teamInfo: {
            teamName: 'DY Lions',
            organization: 'DY Patil University',
            contactPerson: 'Virat Captain',
            contactEmail: 'virat@dypatil.edu'
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_SPORT_OR_KIT_TYPE');
    });

    it('validates required fields: missing teamInfo returns 400', async () => {
      const res = await request(app)
        .post('/api/v1/team-kits')
        .set('Cookie', customerCookie)
        .send({
          sport: 'Cricket',
          kitType: 'Team jersey',
          design: {
            primaryColor: '#002B49',
            jerseyStyle: 'V-Neck Aero'
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_TEAM_INFO');
    });

    it('validates required fields: missing design preferences returns 400', async () => {
      const res = await request(app)
        .post('/api/v1/team-kits')
        .set('Cookie', customerCookie)
        .send({
          sport: 'Cricket',
          kitType: 'Team jersey',
          teamInfo: {
            teamName: 'DY Lions',
            organization: 'DY Patil University',
            contactPerson: 'Virat Captain',
            contactEmail: 'virat@dypatil.edu'
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_DESIGN_PREFS');
    });

    it('successfully submits a valid team kit request with size breakdown and auto total calculation', async () => {
      const payload = {
        sport: 'Cricket',
        kitType: 'Team jersey',
        teamInfo: {
          teamName: 'DY Titans XI',
          organization: 'DY Patil School of Engineering',
          contactPerson: 'Virat Captain',
          contactEmail: 'virat@dypatil.edu',
          contactPhone: '+91 98765 43210'
        },
        design: {
          primaryColor: '#0A2540',
          secondaryColor: '#FF6B00',
          accentColor: '#FFFFFF',
          jerseyStyle: 'Modern Raglan V-Neck',
          logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
          referenceImageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0',
          rosterNotes: '#7 DHONI (C), #18 KOHLI, #45 ROHIT'
        },
        sizeBreakdown: {
          XS: 2,
          S: 4,
          M: 6,
          L: 5,
          XL: 3,
          XXL: 2
        },
        additionalRequirements: {
          desiredDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          instructions: 'Sublimated moisture-wicking dry-fit mesh fabric with tournament crest on left chest.'
        }
      };

      const res = await request(app)
        .post('/api/v1/team-kits')
        .set('Cookie', customerCookie)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.request).toBeDefined();

      const reqData = res.body.data.request;
      createdRequestId = reqData._id;
      createdRequestRef = reqData.requestReference;

      expect(reqData.requestReference).toMatch(/^TKS-\d{6}-[A-Z0-9]{4}$/);
      expect(reqData.sport).toBe('Cricket');
      expect(reqData.kitType).toBe('Team jersey');
      expect(reqData.status).toBe('Submitted');
      // Total quantity must equal 2 + 4 + 6 + 5 + 3 + 2 = 22
      expect(reqData.totalQuantity).toBe(22);
      expect(reqData.teamInfo.teamName).toBe('DY Titans XI');
      expect(reqData.statusHistory.length).toBeGreaterThanOrEqual(1);
    });

    it('retrieves customer own requests via GET /my-requests', async () => {
      const res = await request(app)
        .get('/api/v1/team-kits/my-requests')
        .set('Cookie', customerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.requests)).toBe(true);
      const match = res.body.data.requests.find((r) => r._id === createdRequestId);
      expect(match).toBeDefined();
      expect(match.teamInfo.teamName).toBe('DY Titans XI');
    });

    it('allows fetching request by MongoDB ID and reference code for owner', async () => {
      // By MongoDB ID
      const resId = await request(app)
        .get(`/api/v1/team-kits/${createdRequestId}`)
        .set('Cookie', customerCookie);
      expect(resId.status).toBe(200);
      expect(resId.body.data.request.requestReference).toBe(createdRequestRef);

      // By reference code
      const resRef = await request(app)
        .get(`/api/v1/team-kits/${createdRequestRef}`)
        .set('Cookie', customerCookie);
      expect(resRef.status).toBe(200);
      expect(resRef.body.data.request._id).toBe(createdRequestId);
    });
  });

  // ==========================================
  // OWNERSHIP & PRIVACY ISOLATION
  // ==========================================
  describe('Ownership & Privacy Protection', () => {
    it('prevents rival customer from inspecting another customer kit request (returns 403)', async () => {
      const res = await request(app)
        .get(`/api/v1/team-kits/${createdRequestId}`)
        .set('Cookie', rivalCustomerCookie);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('prevents rival customer from cancelling another customer kit request (returns 403)', async () => {
      const res = await request(app)
        .post(`/api/v1/team-kits/${createdRequestId}/cancel`)
        .set('Cookie', rivalCustomerCookie)
        .send({ reason: 'Malicious attempt' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });
  });

  // ==========================================
  // ADMIN MANAGEMENT WORKFLOW & QUOTATIONS
  // ==========================================
  describe('Admin Studio Management & Quotations', () => {
    it('admin can list all requests with pagination, filter, and search', async () => {
      const res = await request(app)
        .get('/api/v1/team-kits/admin/all')
        .query({ search: 'DY Titans', sport: 'Cricket' })
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requests.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('admin can update request status to "Under Review"', async () => {
      const res = await request(app)
        .put(`/api/v1/team-kits/admin/${createdRequestId}/status`)
        .set('Cookie', adminCookie)
        .send({
          status: 'Under Review',
          note: 'Assigned to senior textile designer for mockups',
          adminNotes: 'Sample fabrics dispatched to team manager'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.request.status).toBe('Under Review');
      expect(res.body.data.request.adminNotes).toBe('Sample fabrics dispatched to team manager');
    });

    it('admin rejects invalid status values with 400', async () => {
      const res = await request(app)
        .put(`/api/v1/team-kits/admin/${createdRequestId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'InvalidStatusString' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_STATUS');
    });

    it('admin records an official quotation for the custom kit', async () => {
      const res = await request(app)
        .put(`/api/v1/team-kits/admin/${createdRequestId}/quotation`)
        .set('Cookie', adminCookie)
        .send({
          estimatedPrice: 19800, // ₹19,800
          pricePerUnit: 900, // ₹900/jersey
          notes: 'Includes custom names, numbers, embroidery crest and 2-day priority campus delivery'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.request.status).toBe('Quotation Prepared');
      expect(res.body.data.request.quotation.estimatedPriceInPaise).toBe(1980000);
      expect(res.body.data.request.quotation.pricePerUnitInPaise).toBe(90000);
      expect(res.body.data.request.quotation.notes).toContain('Includes custom names');
    });
  });

  // ==========================================
  // CANCELLATION RULES & RESTRICTIONS
  // ==========================================
  describe('Cancellation Rules', () => {
    let secondRequestId;

    beforeAll(async () => {
      // Create a second request for cancellation tests
      const secondRes = await request(app)
        .post('/api/v1/team-kits')
        .set('Cookie', customerCookie)
        .send({
          sport: 'Football',
          kitType: 'Full sports kit',
          teamInfo: {
            teamName: 'DY Warriors FC',
            organization: 'DY Patil University',
            contactPerson: 'Virat Captain',
            contactEmail: 'virat@dypatil.edu',
            contactPhone: '+91 98765 43212'
          },
          design: {
            primaryColor: '#C8102E',
            jerseyStyle: 'Crew Neck Strike'
          },
          sizeBreakdown: { M: 10, L: 8 },
          totalQuantity: 18
        });

      secondRequestId = secondRes.body.data.request._id;
    });

    it('allows customer to cancel request while status is "Submitted"', async () => {
      const res = await request(app)
        .post(`/api/v1/team-kits/${secondRequestId}/cancel`)
        .set('Cookie', customerCookie)
        .send({ reason: 'Tournament postponed to next semester' });

      expect(res.status).toBe(200);
      expect(res.body.data.request.status).toBe('Cancelled');
      const latestHistory = res.body.data.request.statusHistory.slice(-1)[0];
      expect(latestHistory.note).toContain('Tournament postponed');
    });

    it('blocks customer from cancelling a request once in "In Production"', async () => {
      // Admin advances createdRequestId to "In Production"
      await request(app)
        .put(`/api/v1/team-kits/admin/${createdRequestId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'In Production', note: 'Fabric printing started' });

      // Customer attempts to cancel
      const res = await request(app)
        .post(`/api/v1/team-kits/${createdRequestId}/cancel`)
        .set('Cookie', customerCookie)
        .send({ reason: 'We want to change colors' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CANCELLATION_DISALLOWED');
    });
  });
});
