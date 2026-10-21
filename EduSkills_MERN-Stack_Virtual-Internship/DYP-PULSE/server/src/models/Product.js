import mongoose from 'mongoose';

export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    publicId: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer stock value'
      }
    }
  },
  { _id: false }
);

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    hex: {
      type: String,
      trim: true,
      default: ''
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer stock value'
      }
    }
  },
  { _id: false }
);

export const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required for each variant'],
      uppercase: true,
      trim: true
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
    priceOverrideInPaise: {
      type: Number,
      default: null,
      min: [0, 'Price override cannot be negative'],
      validate: {
        validator: (v) => v === null || v === undefined || Number.isInteger(v),
        message: 'Price override must be an integer paise amount'
      }
    },
    stock: {
      type: Number,
      required: [true, 'Variant stock is required'],
      min: [0, 'Variant stock cannot be negative'],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Variant stock must be an integer quantity'
      }
    },
    image: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual getter and setter for variant price override in INR Rupees
variantSchema.virtual('priceOverride').get(function () {
  return this.priceOverrideInPaise ? Math.round(this.priceOverrideInPaise / 100) : null;
}).set(function (rupees) {
  if (rupees === null || rupees === undefined || rupees === '') {
    this.priceOverrideInPaise = null;
  } else {
    this.priceOverrideInPaise = Math.round(Number(rupees) * 100);
  }
});

const ratingSchema = new mongoose.Schema(
  {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Review count must be an integer'
      }
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['PLAY', 'CAMPUS'],
        message: '{VALUE} is not a valid department. Must be PLAY or CAMPUS'
      }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required']
    },
    subcategory: {
      type: String,
      trim: true,
      default: ''
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    sport: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    priceInPaise: {
      type: Number,
      required: [true, 'Base price in paise is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Price must be an integer in paise'
      }
    },
    compareAtPriceInPaise: {
      type: Number,
      min: [0, 'Compare-at price cannot be negative'],
      default: null,
      validate: {
        validator: (v) => v === null || v === undefined || Number.isInteger(v),
        message: 'Compare-at price must be an integer in paise'
      }
    },
    images: {
      type: [imageSchema],
      default: []
    },
    variants: {
      type: [variantSchema],
      default: []
    },
    sizes: {
      type: [sizeSchema],
      default: []
    },
    colors: {
      type: [colorSchema],
      default: []
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be an integer quantity'
      }
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Low stock threshold must be an integer'
      }
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    tags: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    ratings: {
      type: ratingSchema,
      default: () => ({ average: 0, count: 0 })
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual getter and setter for price in INR (Rupees)
productSchema.virtual('price').get(function () {
  return typeof this.priceInPaise === 'number' ? Math.round(this.priceInPaise / 100) : 0;
}).set(function (rupees) {
  if (typeof rupees === 'number' && !isNaN(rupees)) {
    this.priceInPaise = Math.round(rupees * 100);
  }
});

// Virtual getter and setter for compareAtPrice in INR (Rupees)
productSchema.virtual('compareAtPrice').get(function () {
  return typeof this.compareAtPriceInPaise === 'number'
    ? Math.round(this.compareAtPriceInPaise / 100)
    : null;
}).set(function (rupees) {
  if (rupees === null || rupees === undefined || rupees === '') {
    this.compareAtPriceInPaise = null;
  } else if (typeof rupees === 'number' && !isNaN(rupees)) {
    this.compareAtPriceInPaise = Math.round(rupees * 100);
  }
});

// Virtual for discount percent
productSchema.virtual('discountPercent').get(function () {
  if (this.compareAtPriceInPaise && this.compareAtPriceInPaise > this.priceInPaise) {
    return Math.round(
      ((this.compareAtPriceInPaise - this.priceInPaise) / this.compareAtPriceInPaise) * 100
    );
  }
  return 0;
});

// Pre-validate hook:
// 1. Slug generation
// 2. Validate SKUs uniqueness within product
// 3. Aggregate total stock from variants if variants exist
// 4. Synchronize sizes and colors from variants for backwards-compatible frontend views
productSchema.pre('validate', function (next) {
  // Slug generation
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = generateSlug(this.name);
  }

  // Handle price passed in rupees if priceInPaise is not yet set
  if (this.priceInPaise === undefined && this.get('price') !== undefined) {
    this.priceInPaise = Math.round(Number(this.get('price')) * 100);
  }
  if (this.compareAtPriceInPaise === undefined && this.get('compareAtPrice') !== undefined) {
    const orig = this.get('compareAtPrice');
    this.compareAtPriceInPaise = orig ? Math.round(Number(orig) * 100) : null;
  }

  // Variant SKUs uniqueness validation within this product
  if (this.variants && this.variants.length > 0) {
    const skuSet = new Set();
    for (const v of this.variants) {
      if (!v.sku || !v.sku.trim()) {
        return next(new Error('Each variant must have a valid SKU'));
      }
      const upperSku = v.sku.trim().toUpperCase();
      v.sku = upperSku;
      if (skuSet.has(upperSku)) {
        return next(new Error(`Duplicate variant SKU '${upperSku}' within product`));
      }
      skuSet.add(upperSku);
    }

    // Aggregate variant stock
    const variantStockSum = this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    this.stock = variantStockSum;

    // Synchronize sizes array from variants
    const sizeMap = new Map();
    const colorMap = new Map();

    for (const v of this.variants) {
      if (v.size) {
        sizeMap.set(v.size, (sizeMap.get(v.size) || 0) + (v.stock || 0));
      }
      if (v.color) {
        colorMap.set(v.color, (colorMap.get(v.color) || 0) + (v.stock || 0));
      }
    }

    if (sizeMap.size > 0 && (!this.sizes || this.sizes.length === 0 || this.isModified('variants'))) {
      this.sizes = Array.from(sizeMap.entries()).map(([size, stock]) => ({ size, stock }));
    }

    if (colorMap.size > 0 && (!this.colors || this.colors.length === 0 || this.isModified('variants'))) {
      this.colors = Array.from(colorMap.entries()).map(([name, stock]) => ({ name, stock }));
    }
  }

  next();
});

// Indexes for query performance
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ department: 1 });
productSchema.index({ category: 1 });
productSchema.index({ sport: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ priceInPaise: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

// Text index for search
productSchema.index(
  {
    name: 'text',
    description: 'text',
    brand: 'text',
    sport: 'text',
    tags: 'text'
  },
  {
    weights: {
      name: 10,
      brand: 5,
      sport: 4,
      tags: 3,
      description: 1
    },
    name: 'product_text_search'
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
