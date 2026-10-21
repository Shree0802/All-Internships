import mongoose from 'mongoose';

const sizeBreakdownSchema = new mongoose.Schema(
  {
    XS: { type: Number, default: 0, min: 0 },
    S: { type: Number, default: 0, min: 0 },
    M: { type: Number, default: 0, min: 0 },
    L: { type: Number, default: 0, min: 0 },
    XL: { type: Number, default: 0, min: 0 },
    XXL: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const teamKitRequestSchema = new mongoose.Schema(
  {
    requestReference: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    sport: {
      type: String,
      required: [true, 'Sport selection is required'],
      enum: {
        values: ['Cricket', 'Football', 'Basketball', 'Badminton', 'Other'],
        message: '{VALUE} is not a supported sport'
      }
    },
    kitType: {
      type: String,
      required: [true, 'Kit type is required'],
      enum: {
        values: ['Team jersey', 'Full sports kit', 'Training wear', 'Custom merchandise', 'Other'],
        message: '{VALUE} is not a valid kit type'
      }
    },
    teamInfo: {
      teamName: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [100, 'Team name cannot exceed 100 characters']
      },
      organization: {
        type: String,
        required: [true, 'College or organization name is required'],
        trim: true,
        maxlength: [120, 'Organization name cannot exceed 120 characters']
      },
      contactPerson: {
        type: String,
        required: [true, 'Contact person name is required'],
        trim: true,
        maxlength: [100, 'Contact person name cannot exceed 100 characters']
      },
      contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
      },
      contactPhone: {
        type: String,
        required: [true, 'Contact phone is required'],
        trim: true
      }
    },
    design: {
      primaryColor: {
        type: String,
        required: [true, 'Primary color is required'],
        trim: true
      },
      secondaryColor: {
        type: String,
        trim: true,
        default: ''
      },
      accentColor: {
        type: String,
        trim: true,
        default: ''
      },
      jerseyStyle: {
        type: String,
        required: [true, 'Jersey style is required'],
        trim: true
      },
      logoUrl: {
        type: String,
        trim: true,
        default: ''
      },
      referenceImageUrl: {
        type: String,
        trim: true,
        default: ''
      },
      rosterNotes: {
        type: String,
        trim: true,
        default: ''
      },
      playerName: {
        type: String,
        trim: true,
        default: ''
      },
      jerseyNumber: {
        type: String,
        trim: true,
        default: ''
      }
    },
    sizeBreakdown: {
      type: sizeBreakdownSchema,
      default: () => ({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 })
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [1, 'Total quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Total quantity must be an integer'
      }
    },
    additionalRequirements: {
      desiredDeliveryDate: {
        type: Date,
        default: null
      },
      instructions: {
        type: String,
        trim: true,
        default: ''
      }
    },
    quotation: {
      estimatedPriceInPaise: {
        type: Number,
        default: null
      },
      pricePerUnitInPaise: {
        type: Number,
        default: null
      },
      notes: {
        type: String,
        default: ''
      },
      preparedAt: {
        type: Date,
        default: null
      }
    },
    status: {
      type: String,
      enum: {
        values: [
          'Submitted',
          'Under Review',
          'Quotation Prepared',
          'Approved',
          'In Production',
          'Completed',
          'Rejected',
          'Cancelled'
        ],
        message: '{VALUE} is not a valid status'
      },
      default: 'Submitted'
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now }
      }
    ],
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for rupee representation of quotation
teamKitRequestSchema.virtual('estimatedPrice').get(function () {
  return this.quotation?.estimatedPriceInPaise != null
    ? this.quotation.estimatedPriceInPaise / 100
    : null;
});

teamKitRequestSchema.virtual('pricePerUnit').get(function () {
  return this.quotation?.pricePerUnitInPaise != null
    ? this.quotation.pricePerUnitInPaise / 100
    : null;
});

// Auto-generate reference number pre-validation: TKS-<timestamp>-<random>
teamKitRequestSchema.pre('validate', function (next) {
  if (!this.requestReference) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.requestReference = `TKS-${timestamp}-${random}`;
  }

  // Enforce totalQuantity matches sum of size breakdown if sizeBreakdown has entries
  if (this.sizeBreakdown) {
    const calculatedSum =
      (this.sizeBreakdown.XS || 0) +
      (this.sizeBreakdown.S || 0) +
      (this.sizeBreakdown.M || 0) +
      (this.sizeBreakdown.L || 0) +
      (this.sizeBreakdown.XL || 0) +
      (this.sizeBreakdown.XXL || 0);

    if (calculatedSum > 0 && this.totalQuantity !== calculatedSum) {
      this.totalQuantity = calculatedSum;
    }
  }

  next();
});

teamKitRequestSchema.index({ user: 1, createdAt: -1 });
teamKitRequestSchema.index({ status: 1 });
teamKitRequestSchema.index({ 'teamInfo.teamName': 'text', 'teamInfo.organization': 'text' });

const TeamKitRequest = mongoose.model('TeamKitRequest', teamKitRequestSchema);

export default TeamKitRequest;
