export type EventType = 
  | 'wedding' 
  | 'birthday' 
  | 'anniversary' 
  | 'college_event' 
  | 'community_gathering' 
  | 'custom';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type VendorCategory = 
  | 'venue' 
  | 'catering' 
  | 'photography' 
  | 'videography' 
  | 'decorations' 
  | 'entertainment' 
  | 'invitations' 
  | 'transportation' 
  | 'makeup_styling' 
  | 'cake_desserts' 
  | 'equipment_rental'
  | 'other';

export type BookingStatus = 
  | 'to_research' 
  | 'shortlisted' 
  | 'contacted' 
  | 'negotiating' 
  | 'booked' 
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export type ExpenseCategory = 
  | 'venue' 
  | 'catering' 
  | 'decoration' 
  | 'photography' 
  | 'entertainment' 
  | 'invitations' 
  | 'transportation' 
  | 'outfits_styling' 
  | 'miscellaneous';

export interface IExpense {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  id: string;
  eventId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  notes?: string;
  isDayOf?: boolean;
  timeSlot?: string;
}

export interface IVendor {
  id: string;
  eventId: string;
  name: string;
  category: VendorCategory;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  estimatedCost: number;
  actualCost: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingDeadline?: string;
  notes?: string;
}

export interface IIdea {
  id: string;
  eventId: string;
  title: string;
  description: string;
  category: string;
  estimatedCostRange?: string;
  whyItFits: string;
  implementationSuggestions: string[];
  isFavorite: boolean;
}

export interface IChatMessage {
  id: string;
  eventId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_expense' | 'adjust_budget' | 'add_task' | 'add_vendor' | 'update_plan';
    payload: any;
    label: string;
  };
}

export interface IAIPlan {
  eventSummary: string;
  recommendedThemes: Array<{
    name: string;
    description: string;
    colorPalette: string[];
    vibe: string;
  }>;
  decorationSuggestions: Array<{
    area: string;
    concept: string;
    estimatedCost: number;
  }>;
  venueRecommendations: Array<{
    venueType: string;
    capacityMatch: string;
    estimatedPriceRange: string;
    pros: string[];
    considerations: string[];
  }>;
  cateringMenuIdeas: {
    welcomeDrinks: string[];
    appetizers: string[];
    mainCourse: string[];
    desserts: string[];
    dietaryNotes: string;
  };
  entertainmentAndActivities: Array<{
    activity: string;
    description: string;
    targetAudience: string;
    timing: string;
  }>;
  budgetAllocations: Array<{
    category: ExpenseCategory;
    percentage: number;
    allocatedAmount: number;
    explanation: string;
  }>;
  preparationTimeline: Array<{
    milestone: string;
    dueTimeline: string;
    tasks: string[];
  }>;
  vendorChecklist: Array<{
    category: string;
    criticalQuestions: string[];
    bookingWindow: string;
  }>;
  eventDaySchedule: Array<{
    timeSlot: string;
    activity: string;
    responsiblePerson: string;
    notes?: string;
  }>;
  riskAndContingencies: Array<{
    risk: string;
    impact: 'low' | 'medium' | 'high';
    contingencyPlan: string;
  }>;
  personalizedRecommendations: string[];
  costSavingOpportunities: Array<{
    tip: string;
    potentialSavings: string;
    tradeoff: string;
  }>;
  generatedAt: string;
  aiModelUsed: string;
}

export interface IEvent {
  id: string;
  name: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  currency: string;
  themePreference?: string;
  venuePreference?: string;
  foodPreferences?: string;
  dietaryRestrictions?: string;
  culturalRequirements?: string;
  additionalNotes?: string;
  plan?: IAIPlan;
  expenses: IExpense[];
  tasks: ITask[];
  vendors: IVendor[];
  ideas: IIdea[];
  chatHistory: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}
