import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import config from '../config/index.js';
import User from '../models/User.js';

/**
 * Secure CLI script to provision or promote an administrative account
 * Usage:
 *   ADMIN_EMAIL=admin@dypulse.edu ADMIN_PASSWORD=SecurePass123! npm run create-admin
 * or:
 *   node src/scripts/createAdmin.js --email admin@dypulse.edu --password SecurePass123! --firstName Varsity --lastName Admin
 */

function parseArgs() {
  const rawArgs = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, ...vals] = arg.slice(2).split('=');
        parsed[key] = vals.join('=');
      } else if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('--')) {
        parsed[arg.slice(2)] = rawArgs[i + 1];
        i++;
      } else {
        parsed[arg.slice(2)] = 'true';
      }
    }
  }
  return parsed;
}

const run = async () => {
  const args = parseArgs();

  const email = (args.email || process.env.ADMIN_EMAIL || config.admin.email || '').trim().toLowerCase();
  const password = args.password || process.env.ADMIN_PASSWORD || config.admin.password || '';
  const firstName = (args.firstName || process.env.ADMIN_FIRST_NAME || 'DYPULSE').trim();
  const lastName = (args.lastName || process.env.ADMIN_LAST_NAME || 'Admin').trim();

  if (!email) {
    console.error('[ADMIN PROVISION ERROR] An admin email is required.');
    console.error('Specify via ADMIN_EMAIL env var or --email argument.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('[ADMIN PROVISION ERROR] An admin password with minimum 8 characters is required.');
    console.error('Specify via ADMIN_PASSWORD env var or --password argument.');
    process.exit(1);
  }

  // Strong password check
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasUpper || !hasLower || !hasDigit) {
    console.error('[ADMIN PROVISION ERROR] Admin password must contain uppercase, lowercase, and a number.');
    process.exit(1);
  }

  try {
    await connectDB();
    console.log('[ADMIN PROVISION] Connected to database');

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.role = 'admin';
      existingUser.status = 'active';
      existingUser.isActive = true;
      existingUser.password = password; // pre-save will hash with bcrypt
      if (firstName) existingUser.firstName = firstName;
      if (lastName) existingUser.lastName = lastName;

      await existingUser.save();
      console.log(`[ADMIN PROVISION SUCCESS] Existing user elevated to administrator: ${email}`);
    } else {
      const newAdmin = new User({
        firstName,
        lastName,
        email,
        password,
        role: 'admin',
        status: 'active',
        isActive: true
      });

      await newAdmin.save();
      console.log(`[ADMIN PROVISION SUCCESS] New administrator account established: ${email}`);
    }

    console.log('[ADMIN PROVISION] Credentials committed securely with bcrypt.');
  } catch (err) {
    console.error('[ADMIN PROVISION FAILED]:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[ADMIN PROVISION] Database disconnected.');
    process.exit(0);
  }
};

run();
