import { describe, it, expect } from 'vitest';
import { aiService } from '../services/aiService.js';
import { AIPlanSchema } from '../schemas/index.js';
import { IEvent } from '../types/index.js';

export const BENCHMARK_SCENARIOS: Record<string, IEvent> = {
  wedding_luxury: {
    id: 'bench_wedding',
    name: "Aarav & Meera's Royal Jodhpur Nuptials",
    type: 'wedding',
    date: '2027-04-18', // ~170 days out
    location: 'Jodhpur, Rajasthan',
    guestCount: 350,
    budget: 3500000,
    currency: 'INR',
    themePreference: 'Royal Rajputana Grandeur',
    venuePreference: 'Heritage Fort Resort & Palace Lawns',
    foodPreferences: 'Multi-cuisine royal feast with live chaat and dessert counters',
    dietaryRestrictions: 'Multi-dietary: Dedicated pure Jain counter (no onion/garlic) and Halal/Coastal Non-Veg delicacies',
    culturalRequirements: 'Baraat procession with brass band, Sangeet choreography stage, Vedic Pheras mandate',
    additionalNotes: 'Need luxury vendor coordination and airport guest shuttles',
    expenses: [],
    tasks: [],
    vendors: [],
    ideas: [],
    chatHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  birthday_vegan_allergy: {
    id: 'bench_birthday',
    name: "Kabir's 30th Rooftop Sunset Soiree",
    type: 'birthday',
    date: '2026-11-22', // ~24 days out
    location: 'Indiranagar, Bengaluru',
    guestCount: 45,
    budget: 120000,
    currency: 'INR',
    themePreference: 'Retro Synthwave & Vinyl Lounge',
    venuePreference: 'Open-Air Rooftop Cafe & Terrace',
    foodPreferences: 'Artisanal tapas, wood-fired sourdough bites, botanical mocktail bar',
    dietaryRestrictions: '100% Strict Vegan (dairy-free) and Severe Peanut/Tree Nut Allergy',
    culturalRequirements: 'Casual, pet-friendly atmosphere with acoustic vinyl DJ',
    additionalNotes: 'Zero dairy, zero peanuts anywhere on the menu',
    expenses: [],
    tasks: [],
    vendors: [],
    ideas: [],
    chatHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  anniversary_silver: {
    id: 'bench_anniversary',
    name: "Sunil & Vandana's 25th Silver Jubilee Gala",
    type: 'anniversary',
    date: '2026-12-28', // ~60 days out
    location: 'South Mumbai',
    guestCount: 80,
    budget: 650000,
    currency: 'INR',
    themePreference: 'Silver & Midnight Plum Elegance',
    venuePreference: 'Boutique Colonial Club Banquet & Verandah',
    foodPreferences: 'Gourmet North Indian & Mediterranean fusion, wine & dessert pairing',
    dietaryRestrictions: 'Pure Vegetarian with high-protein options, diabetic-friendly low glycemic desserts',
    culturalRequirements: 'AV screening of 25-year family journey, live acoustic ghazal & retro Bollywood quartet',
    additionalNotes: 'Commemorative gift hampers for all attending couples',
    expenses: [],
    tasks: [],
    vendors: [],
    ideas: [],
    chatHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  college_fest_sprint: {
    id: 'bench_college',
    name: 'Tarang 2026: Annual Inter-College Cultural & Tech Fest',
    type: 'college_event',
    date: '2026-11-10', // 12 days out! Tight emergency sprint
    location: 'Pune University Campus',
    guestCount: 750,
    budget: 280000,
    currency: 'INR',
    themePreference: 'Neon Cyberpunk & Indie Beats',
    venuePreference: 'Campus Open-Air Amphitheater & Quadrangle',
    foodPreferences: 'Student budget-friendly street counters: Frankies, Momos, Pizza slices, Cold Coffee & Lemonade bar',
    dietaryRestrictions: 'Affordable quick bites with clear veg/non-veg separation',
    culturalRequirements: 'Battle of the bands, pro-audio line array sound, campus dean safety protocols, crowd management barriers',
    additionalNotes: 'Requires rapid 10-day execution sprint; strict campus noise deadline at 10 PM',
    expenses: [],
    tasks: [],
    vendors: [],
    ideas: [],
    chatHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  community_diwali_mela: {
    id: 'bench_community',
    name: 'Shanti Nagar Society Grand Diwali & New Year Mela',
    type: 'community_gathering',
    date: '2026-11-28', // ~30 days out
    location: 'Ahmedabad, Gujarat',
    guestCount: 300,
    budget: 85000, // Modest community fund: ~₹283/head
    currency: 'INR',
    themePreference: 'Traditional Diya & Rangoli Folk Carnival',
    venuePreference: 'Society Central Park & Community Clubhouse',
    foodPreferences: 'Community potluck & live festive snack counters (Jalebi-Fafda, Dhokla, Masala Chai)',
    dietaryRestrictions: '100% Pure Vegetarian, Gujarati Satvik & Jain friendly (no onion, no garlic)',
    culturalRequirements: 'Kids costume contest, senior citizen comfortable shaded seating, eco-friendly green fireworks safety perimeter',
    additionalNotes: 'Managed by resident volunteers; maximize value for modest society budget',
    expenses: [],
    tasks: [],
    vendors: [],
    ideas: [],
    chatHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe('Festivo AI Planning Engine - Multi-Scenario Evaluation Benchmark', () => {
  const scenarioKeys = Object.keys(BENCHMARK_SCENARIOS);

  scenarioKeys.forEach((key) => {
    const scenario = BENCHMARK_SCENARIOS[key];

    describe(`Scenario: ${scenario.name} (${scenario.type})`, () => {
      it('validates against full Zod AIPlanSchema without schema violations', () => {
        const plan = aiService.generateTailoredFallbackPlan(scenario);
        const parseResult = AIPlanSchema.safeParse(plan);
        if (!parseResult.success) {
          console.error(`Validation errors for ${key}:`, parseResult.error.issues);
        }
        expect(parseResult.success).toBe(true);
      });

      it('satisfies exact mathematical consistency for budget allocations', () => {
        const plan = aiService.generateTailoredFallbackPlan(scenario);

        // 1. Total allocated amount must equal total event budget exactly
        const totalAllocated = plan.budgetAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
        expect(totalAllocated).toBe(scenario.budget);

        // 2. Sum of percentages must equal 100% within 0.2% rounding tolerance
        const totalPercentage = plan.budgetAllocations.reduce((sum, a) => sum + a.percentage, 0);
        expect(Math.abs(totalPercentage - 100)).toBeLessThanOrEqual(0.2);

        // 3. No negative allocations
        plan.budgetAllocations.forEach((a) => {
          expect(a.allocatedAmount).toBeGreaterThanOrEqual(0);
          expect(a.percentage).toBeGreaterThanOrEqual(0);
        });

        // 4. Decoration suggestions must not exceed the decoration allocation by more than 10%
        const decorAllocation = plan.budgetAllocations.find((a) => a.category === 'decoration')?.allocatedAmount || 0;
        const totalDecorSuggested = plan.decorationSuggestions.reduce((sum, d) => sum + d.estimatedCost, 0);
        expect(totalDecorSuggested).toBeLessThanOrEqual(decorAllocation * 1.15);
      });

      it('produces sensible, chronological deadlines adapted to the event horizon', () => {
        const plan = aiService.generateTailoredFallbackPlan(scenario);
        const eventDate = new Date(scenario.date);
        const now = new Date('2026-10-29T23:40:47+05:30');
        const daysRemaining = Math.max(1, Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        expect(plan.preparationTimeline.length).toBeGreaterThanOrEqual(3);

        // For a fast-track 12-day sprint, the timeline must NOT say "8-10 Weeks Prior"
        if (daysRemaining <= 14) {
          const hasImpossibleLongHorizon = plan.preparationTimeline.some((m) =>
            m.milestone.toLowerCase().includes('weeks prior') || m.milestone.toLowerCase().includes('months prior')
          );
          expect(hasImpossibleLongHorizon).toBe(false);
        }
      });

      it('adapts catering menu and dietary notes to specific dietary restrictions', () => {
        const plan = aiService.generateTailoredFallbackPlan(scenario);
        const menu = plan.cateringMenuIdeas;
        const dishesText = [
          ...menu.welcomeDrinks,
          ...menu.appetizers,
          ...menu.mainCourse,
          ...menu.desserts,
        ].join(' ').toLowerCase();

        // Check Vegan & Nut-Free adaptation for Scenario 2
        if (key === 'birthday_vegan_allergy') {
          // Dishes must strictly have zero dairy and zero nuts
          expect(dishesText).not.toContain('paneer');
          expect(dishesText).not.toContain('rabdi');
          expect(dishesText).not.toContain('cream');
          expect(dishesText).not.toContain('peanut');
          expect(dishesText).not.toContain('almond');
          expect(dishesText).not.toContain('pistachio');
          expect(dishesText).not.toContain('cashew');
          expect(menu.dietaryNotes.toLowerCase()).toContain('vegan');
          expect(menu.dietaryNotes.toLowerCase()).toContain('nut');
        }

        // Check Jain & Pure Veg adaptation for Scenario 5
        if (key === 'community_diwali_mela') {
          expect(dishesText).not.toContain('chicken');
          expect(dishesText).not.toContain('fish');
          expect(dishesText).not.toContain('onion');
          expect(dishesText).not.toContain('garlic');
          expect(menu.dietaryNotes.toLowerCase()).toContain('jain');
        }
      });

      it('adapts venue recommendation capacity and price range to guest count and budget', () => {
        const plan = aiService.generateTailoredFallbackPlan(scenario);
        expect(plan.venueRecommendations.length).toBeGreaterThanOrEqual(1);

        const venue = plan.venueRecommendations[0];
        // Venue capacity must encompass guest count
        expect(venue.capacityMatch.toLowerCase()).toContain(String(scenario.guestCount));

        // College event venue should reflect campus or high-capacity grounds
        if (scenario.type === 'college_event') {
          const venueText = (venue.venueType + ' ' + venue.capacityMatch).toLowerCase();
          expect(venueText.includes('campus') || venueText.includes('amphitheater') || venueText.includes('auditorium') || venueText.includes('grounds')).toBe(true);
        }
      });
    });
  });

  describe('Edge-Case & Robustness Stress Tests', () => {
    it('handles micro-budget (₹25,000) with zero NaN and exact rupee equality', () => {
      const microEvent: IEvent = {
        ...BENCHMARK_SCENARIOS.birthday_vegan_allergy,
        budget: 25000,
        guestCount: 15,
      };
      const plan = aiService.generateTailoredFallbackPlan(microEvent);
      const totalAllocated = plan.budgetAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      expect(totalAllocated).toBe(25000);
      plan.budgetAllocations.forEach((a) => {
        expect(isNaN(a.allocatedAmount)).toBe(false);
        expect(isNaN(a.percentage)).toBe(false);
        expect(a.allocatedAmount).toBeGreaterThanOrEqual(0);
      });
    });

    it('handles prime/odd budget values (₹3,33,333) without single-rupee rounding leakage', () => {
      const oddEvent: IEvent = {
        ...BENCHMARK_SCENARIOS.anniversary_silver,
        budget: 333333,
        guestCount: 77,
      };
      const plan = aiService.generateTailoredFallbackPlan(oddEvent);
      const totalAllocated = plan.budgetAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      expect(totalAllocated).toBe(333333);
    });

    it('handles mega luxury budget (₹1,00,00,000 / 1 Crore) for 800 guests', () => {
      const megaEvent: IEvent = {
        ...BENCHMARK_SCENARIOS.wedding_luxury,
        budget: 10000000,
        guestCount: 800,
      };
      const plan = aiService.generateTailoredFallbackPlan(megaEvent);
      const totalAllocated = plan.budgetAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      expect(totalAllocated).toBe(10000000);
      expect(plan.venueRecommendations[0].capacityMatch).toContain('800');
    });

    it('handles emergency 24-hour horizon (event is tomorrow) gracefully without negative milestones', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const emergencyEvent: IEvent = {
        ...BENCHMARK_SCENARIOS.college_fest_sprint,
        date: tomorrow,
      };
      const plan = aiService.generateTailoredFallbackPlan(emergencyEvent);
      expect(plan.preparationTimeline.length).toBeGreaterThanOrEqual(3);
      plan.preparationTimeline.forEach((m) => {
        expect(m.milestone.toLowerCase()).not.toContain('weeks prior');
        expect(m.milestone.toLowerCase()).not.toContain('months prior');
      });
    });

    it('recovers and mathematically normalizes malformed AI output from external LLMs', () => {
      // Simulates an LLM response where percentages sum to 80%, allocations sum to ₹4,00,000 instead of ₹5,00,000,
      // and required categories like "outfits_styling" and "miscellaneous" are missing
      const malformedLLMResponse = {
        eventSummary: 'An unnormalized plan from an external model',
        recommendedThemes: [{ name: 'Test Theme', description: 'Test', colorPalette: ['#123456'], vibe: 'Vibrant' }],
        decorationSuggestions: [{ area: 'Stage', concept: 'Heavy florals', estimatedCost: 350000 }], // Exceeds decor budget
        venueRecommendations: [{ venueType: 'Club', capacityMatch: '100 guests', estimatedPriceRange: '₹1L', pros: [], considerations: [] }],
        cateringMenuIdeas: {
          welcomeDrinks: ['Cooler'],
          appetizers: ['Snack'],
          mainCourse: ['Pilaf'],
          desserts: ['Sweet'],
          dietaryNotes: 'Standard',
        },
        entertainmentAndActivities: [{ activity: 'Music', description: 'DJ', targetAudience: 'All', timing: 'Evening' }],
        budgetAllocations: [
          { category: 'venue', percentage: 40, allocatedAmount: 200000, explanation: 'Venue' },
          { category: 'catering', percentage: 30, allocatedAmount: 150000, explanation: 'Food' },
          { category: 'decoration', percentage: 10, allocatedAmount: 50000, explanation: 'Decor' },
          // Missing photography, entertainment, invitations, transportation, outfits_styling, miscellaneous
        ],
        preparationTimeline: [
          { milestone: '8-10 Weeks Prior', dueTimeline: 'Week 1', tasks: ['Task 1'] },
        ],
        vendorChecklist: [{ category: 'Venue', criticalQuestions: ['Hours?'], bookingWindow: '2 weeks' }],
        eventDaySchedule: [{ timeSlot: '10:00', activity: 'Setup', responsiblePerson: 'Lead' }],
        riskAndContingencies: [{ risk: 'Rain', impact: 'high', contingencyPlan: 'Move indoors' }],
        personalizedRecommendations: ['Book early'],
        costSavingOpportunities: [{ tip: 'DIY favors', potentialSavings: '₹5,000', tradeoff: 'Time' }],
      };

      const testEvent: IEvent = {
        ...BENCHMARK_SCENARIOS.college_fest_sprint, // 12-day horizon, budget ₹2,80,000
        budget: 500000,
      };

      const repaired = aiService.normalizeAndBalancePlan(malformedLLMResponse, testEvent);

      // 1. Validates against schema
      const parseResult = AIPlanSchema.safeParse(repaired);
      expect(parseResult.success).toBe(true);

      // 2. All 9 categories restored
      expect(repaired.budgetAllocations.length).toBe(9);

      // 3. Percentages sum to 100.0%
      const totalPct = repaired.budgetAllocations.reduce((sum, a) => sum + a.percentage, 0);
      expect(Math.abs(totalPct - 100)).toBeLessThanOrEqual(0.1);

      // 4. Exact rupee sum equals target budget
      const totalRupees = repaired.budgetAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      expect(totalRupees).toBe(500000);

      // 5. Excessive decor suggestions scaled down to fit decor budget
      const decorAlloc = repaired.budgetAllocations.find((a) => a.category === 'decoration')!.allocatedAmount;
      const totalDecorCost = repaired.decorationSuggestions.reduce((sum, d) => sum + d.estimatedCost, 0);
      expect(totalDecorCost).toBeLessThanOrEqual(decorAlloc * 1.15);

      // 6. 12-day event horizon cleaned of "8-10 Weeks Prior" milestone
      const hasLongMilestone = repaired.preparationTimeline.some((m) =>
        m.milestone.toLowerCase().includes('weeks prior') || m.milestone.toLowerCase().includes('months prior')
      );
      expect(hasLongMilestone).toBe(false);
    });
  });
});
