import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    name: {
      type: String,
      required: [true, 'Product name is required']
    },
    size: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    unitPriceInPaise: {
      type: Number,
      required: [true, 'Unit price in paise is required'],
      min: [0, 'Unit price cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Unit price in paise must be an integer'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer'
      }
    },
    lineTotalInPaise: {
      type: Number,
      required: [true, 'Line total in paise is required'],
      min: [0, 'Line total cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Line total in paise must be an integer'
      }
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals for rupee conversion and backward compatibility
orderItemSchema
  .virtual('unitPrice')
  .get(function () {
    return this.unitPriceInPaise != null ? this.unitPriceInPaise / 100 : 0;
  })
  .set(function (val) {
    if (typeof val === 'number') {
      this.unitPriceInPaise = Math.round(val * 100);
    }
  });

orderItemSchema
  .virtual('price')
  .get(function () {
    return this.unitPriceInPaise != null ? this.unitPriceInPaise / 100 : 0;
  })
  .set(function (val) {
    if (typeof val === 'number') {
      this.unitPriceInPaise = Math.round(val * 100);
    }
  });

orderItemSchema
  .virtual('lineTotal')
  .get(function () {
    return this.lineTotalInPaise != null ? this.lineTotalInPaise / 100 : 0;
  })
  .set(function (val) {
    if (typeof val === 'number') {
      this.lineTotalInPaise = Math.round(val * 100);
    }
  });

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    apartment: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true
    }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    orderNumber: {
      type: String,
      unique: true
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item'
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required']
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['COD', 'ONLINE'],
        message: '{VALUE} is not a valid payment method'
      },
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending'
    },
    paymentDetails: {
      razorpayOrderId: { type: String, default: null, index: true },
      razorpayPaymentId: { type: String, default: null, index: true },
      razorpaySignature: { type: String, default: null },
      paidAt: { type: Date, default: null },
      failureReason: { type: String, default: null },
      lastError: { type: mongoose.Schema.Types.Mixed, default: null },
      attemptsCount: { type: Number, default: 0 }
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid order status'
      },
      default: 'placed'
    },
    subtotalInPaise: {
      type: Number,
      required: [true, 'Subtotal in paise is required'],
      min: [0, 'Subtotal cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Subtotal in paise must be an integer'
      }
    },
    shippingChargeInPaise: {
      type: Number,
      default: 0,
      min: [0, 'Shipping charge cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Shipping charge in paise must be an integer'
      }
    },
    discountInPaise: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Discount in paise must be an integer'
      }
    },
    totalInPaise: {
      type: Number,
      required: [true, 'Total in paise is required'],
      min: [0, 'Total cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Total in paise must be an integer'
      }
    },
    coupon: {
      code: { type: String, uppercase: true, default: null },
      discountInPaise: { type: Number, default: 0 }
    },
    statusHistory: [statusHistorySchema],
    cancellation: {
      reason: { type: String, default: null },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      cancelledAt: { type: Date, default: null },
      restocked: { type: Boolean, default: false }
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals for monetary fields in rupees with two-way bindings for backward compatibility
orderSchema
  .virtual('subtotal')
  .get(function () {
    return this.subtotalInPaise != null ? this.subtotalInPaise / 100 : 0;
  })
  .set(function (valInRupees) {
    if (typeof valInRupees === 'number') {
      this.subtotalInPaise = Math.round(valInRupees * 100);
    }
  });

orderSchema
  .virtual('shippingCharge')
  .get(function () {
    return this.shippingChargeInPaise != null ? this.shippingChargeInPaise / 100 : 0;
  })
  .set(function (valInRupees) {
    if (typeof valInRupees === 'number') {
      this.shippingChargeInPaise = Math.round(valInRupees * 100);
    }
  });

orderSchema
  .virtual('discount')
  .get(function () {
    return this.discountInPaise != null ? this.discountInPaise / 100 : 0;
  })
  .set(function (valInRupees) {
    if (typeof valInRupees === 'number') {
      this.discountInPaise = Math.round(valInRupees * 100);
    }
  });

orderSchema
  .virtual('total')
  .get(function () {
    return this.totalInPaise != null ? this.totalInPaise / 100 : 0;
  })
  .set(function (valInRupees) {
    if (typeof valInRupees === 'number') {
      this.totalInPaise = Math.round(valInRupees * 100);
    }
  });

// Pre-validate hook to generate unique orderNumber like DYP-<timestamp>-<random>
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `DYP-${timestamp}-${random}`;
  }

  // Pre-calculate line totals and ensure consistency if not already set
  if (this.items && this.items.length > 0) {
    for (const item of this.items) {
      if (item.unitPriceInPaise != null && item.quantity != null && item.lineTotalInPaise == null) {
        item.lineTotalInPaise = item.unitPriceInPaise * item.quantity;
      }
    }
  }

  // Fallbacks if only rupee values were provided
  if (this.subtotalInPaise == null && typeof this.subtotal === 'number') {
    this.subtotalInPaise = Math.round(this.subtotal * 100);
  }
  if (this.shippingChargeInPaise == null && typeof this.shippingCharge === 'number') {
    this.shippingChargeInPaise = Math.round(this.shippingCharge * 100);
  }
  if (this.discountInPaise == null && typeof this.discount === 'number') {
    this.discountInPaise = Math.round(this.discount * 100);
  }
  if (this.totalInPaise == null && typeof this.total === 'number') {
    this.totalInPaise = Math.round(this.total * 100);
  }

  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
