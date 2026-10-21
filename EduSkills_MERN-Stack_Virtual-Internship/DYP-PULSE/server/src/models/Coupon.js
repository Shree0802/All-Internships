import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [20, 'Coupon code cannot exceed 20 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed'],
        message: '{VALUE} is not a valid discount type'
      },
      required: [true, 'Discount type is required']
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount value must be at least 1']
    },
    // Minimum subtotal in integer paise (e.g., 50000 paise = Rs 500)
    minOrderAmountInPaise: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Minimum order amount in paise must be an integer'
      }
    },
    // Ceiling for percentage discounts in integer paise
    maxDiscountInPaise: {
      type: Number,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || (Number.isInteger(v) && v >= 0);
        },
        message: 'Max discount in paise must be a non-negative integer'
      }
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required']
    },
    usageLimit: {
      type: Number,
      default: 1000,
      min: [1, 'Usage limit must be at least 1']
    },
    perUserLimit: {
      type: Number,
      default: null,
      min: [1, 'Per-user usage limit must be at least 1']
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    applicableDepartment: {
      type: String,
      enum: ['ALL', 'PLAY', 'CAMPUS'],
      default: 'ALL'
    },
    eligibleDepartments: [
      {
        type: String,
        enum: ['PLAY', 'CAMPUS']
      }
    ],
    eligibleProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

couponSchema.virtual('minOrderAmount').get(function () {
  return (this.minOrderAmountInPaise || 0) / 100;
});

couponSchema.virtual('maxDiscount').get(function () {
  return this.maxDiscountInPaise != null ? this.maxDiscountInPaise / 100 : null;
});

couponSchema.methods.isValidForOrder = function (subtotalInPaise, department = null, items = []) {
  if (!this.isActive) {
    return { valid: false, message: 'This coupon is no longer active.' };
  }

  const now = new Date();
  if (this.startDate && now < new Date(this.startDate)) {
    return { valid: false, message: 'This coupon promotion has not started yet.' };
  }

  if (now > new Date(this.expiresAt)) {
    return { valid: false, message: 'This coupon has expired.' };
  }

  if (this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'This coupon has reached its maximum usage limit.' };
  }

  if (subtotalInPaise < this.minOrderAmountInPaise) {
    const minRupees = Math.round(this.minOrderAmountInPaise / 100);
    return {
      valid: false,
      message: `Minimum order subtotal of ₹${minRupees} required to apply this coupon.`
    };
  }

  // Check department restrictions
  if (this.applicableDepartment !== 'ALL') {
    if (department && this.applicableDepartment !== department) {
      return {
        valid: false,
        message: `This coupon is only valid for DYPULSE ${this.applicableDepartment} products.`
      };
    }
  }

  if (this.eligibleDepartments && this.eligibleDepartments.length > 0) {
    if (department && !this.eligibleDepartments.includes(department)) {
      return {
        valid: false,
        message: `This coupon is only valid for ${this.eligibleDepartments.join(', ')} products.`
      };
    }
  }

  // Check eligible products restriction
  if (this.eligibleProducts && this.eligibleProducts.length > 0 && items && items.length > 0) {
    const eligibleIdStrings = this.eligibleProducts.map((p) => p.toString());
    const hasEligibleProduct = items.some((item) => {
      const prodId = (item.product?._id || item.product || '').toString();
      return eligibleIdStrings.includes(prodId);
    });

    if (!hasEligibleProduct) {
      return {
        valid: false,
        message: 'Your cart does not contain any products eligible for this coupon.'
      };
    }
  }

  return { valid: true };
};

couponSchema.methods.isValidForUserAndOrder = async function (userId, subtotalInPaise, options = {}) {
  // First run base validation
  const baseCheck = this.isValidForOrder(subtotalInPaise, options.department, options.items);
  if (!baseCheck.valid) {
    return baseCheck;
  }

  // Check per-user usage limit if user is provided and perUserLimit is configured
  if (userId && this.perUserLimit != null && this.perUserLimit > 0) {
    const OrderModel = mongoose.model('Order');
    const userOrderCount = await OrderModel.countDocuments({
      user: userId,
      $or: [{ 'coupon.code': this.code }, { coupon: this._id }],
      orderStatus: { $ne: 'cancelled' }
    });

    if (userOrderCount >= this.perUserLimit) {
      return {
        valid: false,
        message: `You have reached the limit of ${this.perUserLimit} use(s) for coupon "${this.code}".`
      };
    }
  }

  return { valid: true };
};

couponSchema.methods.calculateDiscountInPaise = function (subtotalInPaise) {
  let discountInPaise = 0;

  if (this.discountType === 'percentage') {
    discountInPaise = Math.round((subtotalInPaise * this.discountValue) / 100);
    if (this.maxDiscountInPaise && discountInPaise > this.maxDiscountInPaise) {
      discountInPaise = this.maxDiscountInPaise;
    }
  } else if (this.discountType === 'fixed') {
    // If fixed, discountValue is represented in paise
    discountInPaise = Math.min(this.discountValue, subtotalInPaise);
  }

  return Math.min(discountInPaise, subtotalInPaise);
};

couponSchema.index({ isActive: 1, expiresAt: 1, startDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
