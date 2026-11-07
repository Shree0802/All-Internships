import { z } from 'zod';

export const EventTypeEnum = z.enum([
  'wedding',
  'birthday',
  'anniversary',
  'college_event',
  'community_gathering',
  'custom',
]);

export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export const TaskStatusEnum = z.enum(['pending', 'in_progress', 'completed']);

export const ExpenseCategoryEnum = z.enum([
  'venue',
  'catering',
  'decoration',
  'photography',
  'entertainment',
  'invitations',
  'transportation',
  'outfits_styling',
  'miscellaneous',
]);

export const VendorCategoryEnum = z.enum([
  'venue',
  'catering',
  'photography',
  'videography',
  'decorations',
  'entertainment',
  'invitations',
  'transportation',
  'makeup_styling',
  'cake_desserts',
  'equipment_rental',
  'other',
]);

export const BookingStatusEnum = z.enum([
  'to_research',
  'shortlisted',
  'contacted',
  'negotiating',
  'booked',
  'cancelled',
]);

export const PaymentStatusEnum = z.enum(['unpaid', 'partially_paid', 'paid']);

export const CreateEventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters').max(100),
  type: EventTypeEnum,
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  guestCount: z.number().int().positive('Guest count must be at least 1').max(50000),
  budget: z.number().nonnegative('Budget cannot be negative'),
  currency: z.string().default('INR'),
  themePreference: z.string().optional().default(''),
  venuePreference: z.string().optional().default(''),
  foodPreferences: z.string().optional().default(''),
  dietaryRestrictions: z.string().optional().default(''),
  culturalRequirements: z.string().optional().default(''),
  additionalNotes: z.string().optional().default(''),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const ExpenseSchema = z.object({
  category: ExpenseCategoryEnum,
  description: z.string().min(1, 'Description is required'),
  estimatedAmount: z.number().nonnegative('Estimated amount must be >= 0'),
  actualAmount: z.number().nonnegative('Actual amount must be >= 0').default(0),
  notes: z.string().optional().default(''),
});

export const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date',
  }),
  priority: TaskPriorityEnum.default('medium'),
  status: TaskStatusEnum.default('pending'),
  category: z.string().optional().default('General'),
  notes: z.string().optional().default(''),
  isDayOf: z.boolean().optional().default(false),
  timeSlot: z.string().optional().default(''),
});

export const VendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  category: VendorCategoryEnum,
  contactName: z.string().optional().default(''),
  contactPhone: z.string().optional().default(''),
  contactEmail: z.string().email().optional().or(z.literal('')).default(''),
  estimatedCost: z.number().nonnegative().default(0),
  actualCost: z.number().nonnegative().default(0),
  bookingStatus: BookingStatusEnum.default('to_research'),
  paymentStatus: PaymentStatusEnum.default('unpaid'),
  bookingDeadline: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const IdeaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().default('General'),
  estimatedCostRange: z.string().optional().default(''),
  whyItFits: z.string().default(''),
  implementationSuggestions: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
});

export const ChatMessageInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
});

// Zod Schema for Structured AI Plan
export const AIPlanSchema = z.object({
  eventSummary: z.string(),
  recommendedThemes: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      colorPalette: z.array(z.string()),
      vibe: z.string(),
    })
  ),
  decorationSuggestions: z.array(
    z.object({
      area: z.string(),
      concept: z.string(),
      estimatedCost: z.number(),
    })
  ),
  venueRecommendations: z.array(
    z.object({
      venueType: z.string(),
      capacityMatch: z.string(),
      estimatedPriceRange: z.string(),
      pros: z.array(z.string()),
      considerations: z.array(z.string()),
    })
  ),
  cateringMenuIdeas: z.object({
    welcomeDrinks: z.array(z.string()),
    appetizers: z.array(z.string()),
    mainCourse: z.array(z.string()),
    desserts: z.array(z.string()),
    dietaryNotes: z.string(),
  }),
  entertainmentAndActivities: z.array(
    z.object({
      activity: z.string(),
      description: z.string(),
      targetAudience: z.string(),
      timing: z.string(),
    })
  ),
  budgetAllocations: z.array(
    z.object({
      category: ExpenseCategoryEnum,
      percentage: z.number(),
      allocatedAmount: z.number(),
      explanation: z.string(),
    })
  ),
  preparationTimeline: z.array(
    z.object({
      milestone: stringOrDate(),
      dueTimeline: z.string(),
      tasks: z.array(z.string()),
    })
  ),
  vendorChecklist: z.array(
    z.object({
      category: z.string(),
      criticalQuestions: z.array(z.string()),
      bookingWindow: z.string(),
    })
  ),
  eventDaySchedule: z.array(
    z.object({
      timeSlot: z.string(),
      activity: z.string(),
      responsiblePerson: z.string(),
      notes: z.string().optional(),
    })
  ),
  riskAndContingencies: z.array(
    z.object({
      risk: z.string(),
      impact: z.enum(['low', 'medium', 'high']),
      contingencyPlan: z.string(),
    })
  ),
  personalizedRecommendations: z.array(z.string()),
  costSavingOpportunities: z.array(
    z.object({
      tip: z.string(),
      potentialSavings: z.string(),
      tradeoff: z.string(),
    })
  ),
  generatedAt: z.string(),
  aiModelUsed: z.string(),
});

function stringOrDate() {
  return z.string();
}
