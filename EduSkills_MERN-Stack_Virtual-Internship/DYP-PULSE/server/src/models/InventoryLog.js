import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    variantSku: {
      type: String,
      trim: true,
      default: ''
    },
    variantDetails: {
      size: { type: String, default: '' },
      color: { type: String, default: '' }
    },
    changeType: {
      type: String,
      enum: ['manual_adjustment', 'order_placed', 'order_cancelled', 'initial_seed', 'restock'],
      default: 'manual_adjustment'
    },
    changeQuantity: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'changeQuantity must be an integer'
      }
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'previousStock must be an integer >= 0'
      }
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'newStock must be an integer >= 0'
      }
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    referenceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    }
  },
  {
    timestamps: true
  }
);

inventoryLogSchema.index({ createdAt: -1 });
inventoryLogSchema.index({ variantSku: 1 });
inventoryLogSchema.index({ product: 1, createdAt: -1 });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
export default InventoryLog;
