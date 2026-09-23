const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      enum: {
        values: [
          'Electronics',
          'Fashion',
          'Shoes',
          'Books',
          'Accessories',
          'Home Appliances',
          'Sports',
        ],
        message: 'Please select valid category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [99, 'Discount percentage cannot exceed 99'],
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      default: 10,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: [true, 'Please provide product image URL'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add text indexes for fast search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
