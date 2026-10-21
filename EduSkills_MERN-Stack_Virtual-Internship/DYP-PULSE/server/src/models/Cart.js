import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer'
      },
      default: 1
    },
    size: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    priceInPaise: {
      type: Number,
      required: [true, 'Price in paise is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Price in paise must be an integer'
      }
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for backward-compatibility with code expecting price in Rupees
cartItemSchema
  .virtual('price')
  .get(function () {
    return this.priceInPaise != null ? this.priceInPaise / 100 : 0;
  })
  .set(function (valInRupees) {
    if (typeof valInRupees === 'number') {
      this.priceInPaise = Math.round(valInRupees * 100);
    }
  });

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

cartSchema.virtual('subtotalInPaise').get(function () {
  return (this.items || []).reduce(
    (sum, item) => sum + (item.priceInPaise || 0) * (item.quantity || 1),
    0
  );
});

cartSchema.virtual('subtotal').get(function () {
  return (this.subtotalInPaise || 0) / 100;
});

cartSchema.virtual('itemCount').get(function () {
  return (this.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
