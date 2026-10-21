import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Products API endpoints', () => {
  it('GET /api/v1/products returns product list and pagination', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toHaveProperty('total');
  });

  it('GET /api/v1/products/department/PLAY returns only PLAY items', async () => {
    const res = await request(app).get('/api/v1/products/department/PLAY');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.department).toBe('PLAY');
    res.body.data.products.forEach((p) => {
      expect(p.department).toBe('PLAY');
    });
  });

  it('GET /api/v1/products/department/CAMPUS returns only CAMPUS items', async () => {
    const res = await request(app).get('/api/v1/products/department/CAMPUS');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.department).toBe('CAMPUS');
    res.body.data.products.forEach((p) => {
      expect(p.department).toBe('CAMPUS');
    });
  });

  it('GET /api/v1/products/featured returns only featured items', async () => {
    const res = await request(app).get('/api/v1/products/featured');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    res.body.data.products.forEach((p) => {
      expect(p.isFeatured).toBe(true);
    });
  });

  it('GET /api/v1/products/:slug returns 404 for non-existent slug', async () => {
    const res = await request(app).get('/api/v1/products/non-existent-product-slug-12345');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });
});
