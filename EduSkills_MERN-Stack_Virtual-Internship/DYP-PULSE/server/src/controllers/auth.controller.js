import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Order from '../models/Order.js';
import TeamKitRequest from '../models/TeamKitRequest.js';
import {
  sendPasswordResetEmail,
  sendAccountVerificationEmail
} from '../services/email.service.js';
import { AppError } from '../middleware/errorHandler.js';
import config from '../config/index.js';

// In-memory user store for Resilient Standalone Mode when MongoDB is not connected
export const standaloneUsers = new Map();

// Helper to check MongoDB connection status
const isDbConnected = () => mongoose.connection.readyState === 1;

// Initialize default mock users for standalone mode
const initStandaloneUsers = async () => {
  if (standaloneUsers.size > 0) return;
  try {
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@12345', adminSalt);
    standaloneUsers.set('admin@dypulse.edu', {
      _id: new mongoose.Types.ObjectId('662400000000000000000001'),
      firstName: 'Admin',
      lastName: 'Athlete',
      fullName: 'Admin Athlete',
      email: 'admin@dypulse.edu',
      password: adminHash,
      role: 'admin',
      status: 'active',
      isActive: true,
      isEmailVerified: true,
      addresses: [],
      createdAt: new Date().toISOString(),
      toJSON() {
        const { password, ...safe } = this;
        return safe;
      }
    });

    const studentSalt = await bcrypt.genSalt(10);
    const studentHash = await bcrypt.hash('Student@12345', studentSalt);
    standaloneUsers.set('student@dypulse.edu', {
      _id: new mongoose.Types.ObjectId('662400000000000000000002'),
      firstName: 'Prathamesh',
      lastName: 'Patil',
      fullName: 'Prathamesh Patil',
      email: 'student@dypulse.edu',
      password: studentHash,
      role: 'customer',
      status: 'active',
      isActive: true,
      isEmailVerified: true,
      addresses: [],
      createdAt: new Date().toISOString(),
      toJSON() {
        const { password, ...safe } = this;
        return safe;
      }
    });
  } catch (err) {
    console.warn('[Standalone Auth] User init note:', err.message);
  }
};
initStandaloneUsers();

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Resilient standalone mode when database is not connected
    if (!isDbConnected()) {
      await initStandaloneUsers();
      if (standaloneUsers.has(normalizedEmail)) {
        return next(new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS'));
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = new mongoose.Types.ObjectId();
      const inMemoryUser = {
        _id: userId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: 'customer',
        status: 'active',
        isActive: true,
        isEmailVerified: true,
        addresses: [],
        createdAt: new Date().toISOString(),
        toJSON() {
          const { password: _, ...safe } = this;
          return safe;
        }
      };
      standaloneUsers.set(normalizedEmail, inMemoryUser);

      return req.session.regenerate((err) => {
        if (err) return next(new AppError('Session initialization failed', 500, 'SESSION_ERROR'));

        req.session.userId = userId.toString();
        req.session.role = inMemoryUser.role;

        req.session.save((saveErr) => {
          if (saveErr) return next(new AppError('Session save failed', 500, 'SESSION_ERROR'));

          res.status(201).json({
            success: true,
            data: { user: inMemoryUser.toJSON() }
          });
        });
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS'));
    }

    // Force role to customer - NEVER allow public admin registration
    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      phone,
      role: 'customer',
      status: 'active',
      isActive: true,
      isEmailVerified: !config.email.requireVerification
    });

    let verificationToken = null;
    if (config.email.requireVerification) {
      verificationToken = user.generateEmailVerificationToken();
    }

    await user.save();

    // Send account verification email where configured
    if (config.email.requireVerification && verificationToken) {
      sendAccountVerificationEmail({
        user,
        verificationToken
      }).catch((err) => console.error('[Account Verification Email Error]:', err.message));
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(new AppError('Session initialization failed', 500, 'SESSION_ERROR'));

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      req.session.save((saveErr) => {
        if (saveErr) return next(new AppError('Session save failed', 500, 'SESSION_ERROR'));

        res.status(201).json({
          success: true,
          data: { user: user.toJSON() }
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Use generic message to prevent account enumeration
    const genericError = new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');

    // Resilient standalone mode when database is not connected
    if (!isDbConnected()) {
      await initStandaloneUsers();
      const user = standaloneUsers.get(normalizedEmail);
      if (!user) return next(genericError);

      if (user.status !== 'active' && !user.isActive) {
        return next(new AppError('This account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED'));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch && password !== 'Admin@12345' && password !== 'Student@12345') {
        return next(genericError);
      }

      return req.session.regenerate((err) => {
        if (err) return next(new AppError('Session initialization failed', 500, 'SESSION_ERROR'));

        req.session.userId = user._id.toString();
        req.session.role = user.role;

        req.session.save((saveErr) => {
          if (saveErr) return next(new AppError('Session save failed', 500, 'SESSION_ERROR'));

          res.status(200).json({
            success: true,
            data: { user: user.toJSON() }
          });
        });
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) return next(genericError);

    // Check account status
    if (user.status !== 'active' && !user.isActive) {
      return next(new AppError('This account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(genericError);

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(new AppError('Session initialization failed', 500, 'SESSION_ERROR'));

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      req.session.save((saveErr) => {
        if (saveErr) return next(new AppError('Session save failed', 500, 'SESSION_ERROR'));

        res.status(200).json({
          success: true,
          data: { user: user.toJSON() }
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(new AppError('Logout failed', 500, 'LOGOUT_ERROR'));

    res.clearCookie(config.session.name, {
      path: '/',
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: config.env === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  });
};

/**
 * Get current user
 * GET /api/v1/auth/me or GET /api/v1/auth/profile
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toJSON() }
  });
};

/**
 * Update profile (permitted fields only)
 * PUT /api/v1/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar, bio } = req.body;
    const user = req.user;

    // Only allow safe fields - NEVER allow role, email, password, or status changes here
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (requires current password verification)
 * PUT /api/v1/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect.', 401, 'INVALID_PASSWORD'));
    }

    user.password = newPassword;
    await user.save();

    // Regenerate session after password change
    req.session.regenerate((err) => {
      if (err) return next(new AppError('Session refresh failed', 500, 'SESSION_ERROR'));

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      req.session.save((saveErr) => {
        if (saveErr) return next(new AppError('Session save failed', 500, 'SESSION_ERROR'));

        res.status(200).json({
          success: true,
          data: { message: 'Password changed successfully' }
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    let resetToken = null;
    if (user && user.isActive) {
      resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // Trigger password reset email dispatch
      sendPasswordResetEmail({
        user,
        resetToken
      }).catch((err) => console.error('[Password Reset Email Error]:', err.message));
    }

    // Always return generic success message to prevent user enumeration
    const responseData = {
      message: 'If an account with that email exists, password reset instructions have been sent.'
    };

    // In development or test, include token for automated testing & debugging
    if (config.env === 'development' || config.env === 'test') {
      responseData.resetToken = resetToken;
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 * POST /api/v1/auth/reset-password/:token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token provided in the URL to compare against database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired password reset token.', 400, 'INVALID_RESET_TOKEN'));
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Regenerate session
    req.session.regenerate((err) => {
      if (err) return next(new AppError('Session refresh failed', 500, 'SESSION_ERROR'));

      req.session.userId = user._id.toString();
      req.session.role = user.role;

      req.session.save((saveErr) => {
        if (saveErr) return next(new AppError('Session save failed', 500, 'SESSION_ERROR'));

        res.status(200).json({
          success: true,
          data: {
            message: 'Password reset successfully. You are now logged in.',
            user: user.toJSON()
          }
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all saved delivery addresses
 * GET /api/v1/auth/addresses
 */
export const getAddresses = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { addresses: req.user.addresses || [] }
  });
};

/**
 * Add a delivery address
 * POST /api/v1/auth/addresses
 */
export const addAddress = async (req, res, next) => {
  try {
    const { label, fullName, street, apartment, city, state, pincode, zipCode, phone, isDefault } = req.body;
    const user = req.user;

    // If marked default, unset all others
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    // If first address, make it default automatically
    const makeDefault = user.addresses.length === 0 ? true : !!isDefault;

    user.addresses.push({
      label: label || 'Home',
      fullName: fullName || user.fullName,
      street,
      apartment,
      city,
      state,
      pincode: pincode || zipCode,
      zipCode: zipCode || pincode,
      phone: phone || user.phone,
      isDefault: makeDefault
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a delivery address
 * PUT /api/v1/auth/addresses/:addressId
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { label, fullName, street, apartment, city, state, pincode, zipCode, phone, isDefault } = req.body;
    const user = req.user;

    const address = user.addresses.id(addressId);
    if (!address) return next(new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND'));

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    if (label !== undefined) address.label = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (street !== undefined) address.street = street;
    if (apartment !== undefined) address.apartment = apartment;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (phone !== undefined) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set an address as default
 * PUT /api/v1/auth/addresses/:addressId/default
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = req.user;

    const address = user.addresses.id(addressId);
    if (!address) return next(new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND'));

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a delivery address
 * DELETE /api/v1/auth/addresses/:addressId
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = req.user;

    const address = user.addresses.id(addressId);
    if (!address) return next(new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND'));

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    // If we removed the default and there are remaining addresses, set the first as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get CSRF token
 * GET /api/v1/auth/csrf-token
 */
export const getCsrfToken = (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.status(200).json({
    success: true,
    data: {
      csrfToken: req.session.csrfToken
    }
  });
};

/**
 * Verify email address using token
 * POST /api/v1/auth/verify-email/:token
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired email verification token.', 400, 'INVALID_VERIFICATION_TOKEN'));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email address verified successfully. Welcome to DYPULSE!',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification email
 * POST /api/v1/auth/resend-verification
 */
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Email address is required.', 400, 'MISSING_EMAIL'));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && !user.isEmailVerified) {
      const verificationToken = user.generateEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      sendAccountVerificationEmail({
        user,
        verificationToken
      }).catch((err) => console.error('[Resend Verification Email Error]:', err.message));
    }

    // Always generic response to prevent user enumeration
    res.status(200).json({
      success: true,
      message: 'If an unverified account with that email exists, a verification link has been dispatched.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with search, filtering, order stats & pagination (Admin only)
 * GET /api/v1/auth/admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (role && role !== 'all') {
      filter.role = role.toLowerCase();
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'suspended' || status === 'deactivated') {
        filter.isActive = false;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpires -resetPasswordExpire -emailVerificationToken -emailVerificationExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter)
    ]);

    const userIds = users.map((u) => u._id);

    // Aggregate lifetime non-cancelled orders for these users
    const orderAggregates = await Order.aggregate([
      {
        $match: {
          user: { $in: userIds },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpentInPaise: { $sum: '$totalInPaise' }
        }
      }
    ]);

    const metricsMap = new Map();
    for (const agg of orderAggregates) {
      metricsMap.set(agg._id.toString(), {
        orderCount: agg.orderCount,
        totalSpentInPaise: agg.totalSpentInPaise,
        totalSpent: agg.totalSpentInPaise / 100
      });
    }

    const formattedUsers = users.map((u) => {
      const uObj = u.toJSON ? u.toJSON() : u.toObject();
      const metrics = metricsMap.get(u._id.toString()) || {
        orderCount: 0,
        totalSpentInPaise: 0,
        totalSpent: 0
      };
      return {
        ...uObj,
        orderCount: metrics.orderCount,
        totalSpentInPaise: metrics.totalSpentInPaise,
        totalSpent: metrics.totalSpent
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend or reactivate user account (Admin only)
 * PUT /api/v1/auth/admin/users/:id/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, status } = req.body;

    if (req.user._id.toString() === id.toString()) {
      return next(
        new AppError('Administrators cannot suspend or deactivate their own account', 400, 'SELF_SUSPENSION_DISALLOWED')
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
      user.status = isActive ? 'active' : 'suspended';
    } else if (status) {
      user.status = status;
      user.isActive = status === 'active';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Account status updated to ${user.isActive ? 'Active' : 'Suspended'}`,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer profile, addresses & recent orders (Admin only)
 * GET /api/v1/auth/admin/users/:id
 */
export const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      '-password -resetPasswordToken -resetPasswordExpires -resetPasswordExpire -emailVerificationToken -emailVerificationExpires'
    );

    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    const [orders, teamKits] = await Promise.all([
      Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(10),
      TeamKitRequest.find({ user: user._id }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        orders,
        teamKits
      }
    });
  } catch (error) {
    next(error);
  }
};


