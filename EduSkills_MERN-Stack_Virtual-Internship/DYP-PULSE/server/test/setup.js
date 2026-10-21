import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';
import { connectDB } from '../src/config/db.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
});
