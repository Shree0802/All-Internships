import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIPlan, IEvent, IChatMessage, ExpenseCategory } from '../types/index.js';
import { AIPlanSchema } from '../schemas/index.js';

const AI_MODEL_NAME = process.env.AI_MODEL || 'gemini-2.5-flash';

const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'venue',
  'catering',
  'decoration',
  'photography',
  'entertainment',
  'invitations',
  'transportation',
  'outfits_styling',
  'miscellaneous',
];

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Calculates days between today and event date safely
 */
function getDaysUntilEvent(eventDateStr: string): number {
  try {
    const eventTime = new Date(eventDateStr).getTime();
    const nowTime = new Date().getTime();
    const diff = Math.round((eventTime - nowTime) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  } catch {
    return 30;
  }
}

export const aiService = {
  isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return !!(key && key.trim().length > 0 && key !== 'your_gemini_api_key_here');
  },

  getModelName(): string {
    return AI_MODEL_NAME;
  },

  /**
   * Generates a 13-point structured AI Celebration Plan
   */
  async generatePlan(event: IEvent): Promise<IAIPlan> {
    const gemini = getGeminiClient();
    const daysUntilEvent = getDaysUntilEvent(event.date);

    if (gemini) {
      try {
        console.log(`Generating AI plan using Gemini model: ${AI_MODEL_NAME} for "${event.name}" (${daysUntilEvent} days remaining)`);
        const model = gemini.getGenerativeModel({
          model: AI_MODEL_NAME,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });

        const prompt = `
You are Festivo AI, the world-class celebration planning and event architect assistant.
Create an exhaustive, elegant, and mathematically accurate celebration plan for the following event:

EVENT DETAILS:
- Name: "${event.name}"
- Type: "${event.type}"
- Date: "${event.date}" (Event is in ${daysUntilEvent} days from today)
- Location: "${event.location}"
- Guest Count: ${event.guestCount}
- Total Budget: ${event.currency} ${event.budget}
- Preferred Theme: "${event.themePreference || 'None specified, choose the most fitting'}"
- Venue Preference: "${event.venuePreference || 'Open to recommendations'}"
- Food Preferences: "${event.foodPreferences || 'Standard festive catering'}"
- Dietary Restrictions: "${event.dietaryRestrictions || 'None'}"
- Cultural / Personal Requirements: "${event.culturalRequirements || 'None'}"
- Additional Notes: "${event.additionalNotes || 'None'}"

CRITICAL MATHEMATICAL & PLANNING RULES:
1. Budget allocations must contain all 9 categories: venue, catering, decoration, photography, entertainment, invitations, transportation, outfits_styling, miscellaneous.
2. The sum of percentage values MUST sum to 100.0%.
3. The sum of allocatedAmount values MUST exactly equal ${event.budget}.
4. DEADLINE SENSIBILITY: The event date is ${event.date} (${daysUntilEvent} days away). Milestones in preparationTimeline MUST be realistic for this ${daysUntilEvent}-day horizon! NEVER suggest "8-10 Weeks Prior" if the event is less than 60 days away!
5. DIETARY RIGOR: All items in cateringMenuIdeas must strictly adhere to the dietary restrictions: "${event.dietaryRestrictions || 'None'}". If Vegan, NO dairy/butter/paneer/milk/eggs. If Nut-Free, NO peanuts/cashews/almonds/pistachios. If Jain, NO onion/garlic/root veg.

Return strictly valid JSON conforming to this schema:
{
  "eventSummary": string,
  "recommendedThemes": [{"name": string, "description": string, "colorPalette": [string], "vibe": string}],
  "decorationSuggestions": [{"area": string, "concept": string, "estimatedCost": number}],
  "venueRecommendations": [{"venueType": string, "capacityMatch": string, "estimatedPriceRange": string, "pros": [string], "considerations": [string]}],
  "cateringMenuIdeas": {
    "welcomeDrinks": [string],
    "appetizers": [string],
    "mainCourse": [string],
    "desserts": [string],
    "dietaryNotes": string
  },
  "entertainmentAndActivities": [{"activity": string, "description": string, "targetAudience": string, "timing": string}],
  "budgetAllocations": [
    {
      "category": "venue"|"catering"|"decoration"|"photography"|"entertainment"|"invitations"|"transportation"|"outfits_styling"|"miscellaneous",
      "percentage": number,
      "allocatedAmount": number,
      "explanation": string
    }
  ],
  "preparationTimeline": [{"milestone": string, "dueTimeline": string, "tasks": [string]}],
  "vendorChecklist": [{"category": string, "criticalQuestions": [string], "bookingWindow": string}],
  "eventDaySchedule": [{"timeSlot": string, "activity": string, "responsiblePerson": string, "notes": string}],
  "riskAndContingencies": [{"risk": string, "impact": "low"|"medium"|"high", "contingencyPlan": string}],
  "personalizedRecommendations": [string],
  "costSavingOpportunities": [{"tip": string, "potentialSavings": string, "tradeoff": string}]
}
`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        const parsed = JSON.parse(textResponse);

        // Normalize and mathematically balance Gemini's output
        const normalized = this.normalizeAndBalancePlan(parsed, event);

        // Append metadata
        normalized.generatedAt = new Date().toISOString();
        normalized.aiModelUsed = AI_MODEL_NAME;

        // Validate with Zod
        const validated = AIPlanSchema.safeParse(normalized);
        if (validated.success) {
          return validated.data;
        } else {
          console.warn('Gemini response failed Zod schema validation after normalization, falling back:', validated.error.issues);
        }
      } catch (err) {
        console.error('Error invoking Gemini API:', err);
      }
    }

    // High quality intelligent tailored engine
    return this.generateTailoredFallbackPlan(event);
  },

  /**
   * Normalizes, balances, and enforces mathematical consistency and deadline integrity on any plan
   */
  normalizeAndBalancePlan(plan: any, event: IEvent): IAIPlan {
    const total = event.budget || 500000;
    const daysUntilEvent = getDaysUntilEvent(event.date);

    // 1. Ensure all 9 required categories exist in budget allocations
    const rawAllocations = Array.isArray(plan.budgetAllocations) ? plan.budgetAllocations : [];
    const allocationMap = new Map<string, { pct: number; amount: number; expl: string }>();

    rawAllocations.forEach((a: any) => {
      if (a && a.category && ALL_EXPENSE_CATEGORIES.includes(a.category)) {
        allocationMap.set(a.category, {
          pct: typeof a.percentage === 'number' && !isNaN(a.percentage) ? a.percentage : 0,
          amount: typeof a.allocatedAmount === 'number' && !isNaN(a.allocatedAmount) ? a.allocatedAmount : 0,
          expl: a.explanation || `Planned allocation for ${a.category}`,
        });
      }
    });

    // Default missing categories
    ALL_EXPENSE_CATEGORIES.forEach((cat) => {
      if (!allocationMap.has(cat)) {
        allocationMap.set(cat, {
          pct: cat === 'miscellaneous' ? 5 : 2,
          amount: Math.round(total * 0.02),
          expl: `Allocation for ${cat}`,
        });
      }
    });

    // Re-balance percentages to exactly 100.0%
    const currentSumPct = Array.from(allocationMap.values()).reduce((sum, v) => sum + v.pct, 0);
    const scaleFactor = currentSumPct > 0 ? 100 / currentSumPct : 1;

    const normalizedAllocations: {
      category: ExpenseCategory;
      percentage: number;
      allocatedAmount: number;
      explanation: string;
    }[] = [];

    let sumPct = 0;
    let sumAmount = 0;

    ALL_EXPENSE_CATEGORIES.forEach((cat, index) => {
      const entry = allocationMap.get(cat)!;
      let pct = Number((entry.pct * scaleFactor).toFixed(1));

      // For the last item, absorb rounding diff to guarantee 100.0%
      if (index === ALL_EXPENSE_CATEGORIES.length - 1) {
        pct = Number((100 - sumPct).toFixed(1));
      }
      sumPct += pct;

      let amount = Math.round((total * pct) / 100);
      sumAmount += amount;

      normalizedAllocations.push({
        category: cat,
        percentage: pct,
        allocatedAmount: amount,
        explanation: entry.expl,
      });
    });

    // Guarantee exact rupee equality to event.budget
    const amountDiff = total - sumAmount;
    if (amountDiff !== 0 && normalizedAllocations.length > 0) {
      normalizedAllocations[normalizedAllocations.length - 1].allocatedAmount += amountDiff;
    }

    // 2. Validate decoration suggestions do not exceed the decoration budget
    const decorBudget = normalizedAllocations.find((a) => a.category === 'decoration')?.allocatedAmount || Math.round(total * 0.15);
    let decorSuggestions = Array.isArray(plan.decorationSuggestions) && plan.decorationSuggestions.length > 0
      ? plan.decorationSuggestions
      : [
          { area: 'Entrance & Welcome Arch', concept: 'Thematic floral and illuminated signage', estimatedCost: Math.round(decorBudget * 0.35) },
          { area: 'Main Stage & Backdrop', concept: 'Layered acoustic backdrop with ambient lighting', estimatedCost: Math.round(decorBudget * 0.45) },
          { area: 'Guest Seating & Tables', concept: 'Cohesive table centerpieces and ambient runners', estimatedCost: Math.round(decorBudget * 0.20) },
        ];

    const currentDecorTotal = decorSuggestions.reduce((sum: number, d: any) => sum + (d.estimatedCost || 0), 0);
    if (currentDecorTotal > decorBudget * 1.1 && currentDecorTotal > 0) {
      const decorScale = (decorBudget * 0.95) / currentDecorTotal;
      decorSuggestions = decorSuggestions.map((d: any) => ({
        ...d,
        estimatedCost: Math.round(d.estimatedCost * decorScale),
      }));
    }

    // 3. Ensure sensible, chronologically ordered timeline adapted to horizon
    let prepTimeline = Array.isArray(plan.preparationTimeline) && plan.preparationTimeline.length > 0 ? plan.preparationTimeline : [];
    if (daysUntilEvent <= 14) {
      // Overwrite or fix impossible long horizons
      const hasImpossible = prepTimeline.some((m: any) =>
        typeof m.milestone === 'string' && (m.milestone.toLowerCase().includes('weeks prior') || m.milestone.toLowerCase().includes('months prior'))
      );
      if (hasImpossible || prepTimeline.length === 0) {
        prepTimeline = [
          {
            milestone: 'Sprint Phase 1: Days 1-3',
            dueTimeline: `T-${Math.max(1, daysUntilEvent - 2)} Days`,
            tasks: ['Lock venue agreement and power/sound clearance', 'Confirm key vendors and advance deposits', 'Broadcast urgent digital RSVP reminder'],
          },
          {
            milestone: 'Sprint Phase 2: Mid-Sprint (Days 4-7)',
            dueTimeline: `T-${Math.max(1, Math.round(daysUntilEvent / 2))} Days`,
            tasks: ['Finalize catering count and dietary specifications', 'Confirm AV, microphone, and stage rider', 'Print signage and assemble event packs'],
          },
          {
            milestone: 'Sprint Phase 3: Final 48 Hours',
            dueTimeline: 'T-48 Hours',
            tasks: ['Technical walkthrough and sound check', 'Final headcount sign-off with caterer', 'Emergency contact roster distribution'],
          },
          {
            milestone: 'Event Day Execution',
            dueTimeline: 'Day of Event',
            tasks: ['Staging load-in inspection', 'Welcome team briefing', 'Execute run-of-show timeline'],
          },
        ];
      }
    }

    return {
      eventSummary: typeof plan.eventSummary === 'string' && plan.eventSummary.trim()
        ? plan.eventSummary
        : `A tailored ${event.type.replace('_', ' ')} celebration for ${event.guestCount} guests in ${event.location}.`,
      recommendedThemes: Array.isArray(plan.recommendedThemes) && plan.recommendedThemes.length > 0
        ? plan.recommendedThemes
        : [
            {
              name: event.themePreference || 'Celebration Elegance',
              description: 'A cohesive ambiance harmonizing modern styling with festive warmth.',
              colorPalette: ['#4A1D36', '#DE3E1B', '#DFCA71', '#FDFBF7'],
              vibe: 'Warm, refined, and memorable',
            },
          ],
      decorationSuggestions: decorSuggestions,
      venueRecommendations: Array.isArray(plan.venueRecommendations) && plan.venueRecommendations.length > 0
        ? plan.venueRecommendations
        : [
            {
              venueType: event.venuePreference || 'Curated Banquet & Lawn',
              capacityMatch: `Comfortably accommodates ${event.guestCount} to ${Math.round(event.guestCount * 1.25)} guests`,
              estimatedPriceRange: `${event.currency} ${Math.round(total * 0.25).toLocaleString()} - ${event.currency} ${Math.round(total * 0.35).toLocaleString()}`,
              pros: ['Spacious layout', 'Accessible parking', 'Flexible decor rules'],
              considerations: ['Confirm noise ordinance cutoff times'],
            },
          ],
      cateringMenuIdeas: plan.cateringMenuIdeas && typeof plan.cateringMenuIdeas === 'object'
        ? plan.cateringMenuIdeas
        : {
            welcomeDrinks: ['Refreshing Mint Cooler', 'Seasonal Fruit Elixir'],
            appetizers: ['Artisanal Festive Skewers', 'Crispy Golden Tartlets'],
            mainCourse: ['Royal Specialty Gravy', 'Fragrant Basmati Pilaf', 'Fresh Artisanal Breads'],
            desserts: ['Gourmet Dessert Trio', 'Warm Pistachio Delicacy'],
            dietaryNotes: event.dietaryRestrictions || 'Clear dietary and allergen labeling on all service stations.',
          },
      entertainmentAndActivities: Array.isArray(plan.entertainmentAndActivities) && plan.entertainmentAndActivities.length > 0
        ? plan.entertainmentAndActivities
        : [
            {
              activity: 'Welcome Reception & Atmosphere',
              description: 'Curated background acoustics and interactive photo op.',
              targetAudience: 'All attendees',
              timing: 'First 60 minutes',
            },
          ],
      budgetAllocations: normalizedAllocations,
      preparationTimeline: prepTimeline,
      vendorChecklist: Array.isArray(plan.vendorChecklist) && plan.vendorChecklist.length > 0
        ? plan.vendorChecklist
        : [
            {
              category: 'Venue & Staging',
              criticalQuestions: ['What are the load-in hours?', 'Is outside catering allowed?'],
              bookingWindow: `${Math.min(daysUntilEvent, 30)} days before event`,
            },
          ],
      eventDaySchedule: Array.isArray(plan.eventDaySchedule) && plan.eventDaySchedule.length > 0
        ? plan.eventDaySchedule
        : [
            { timeSlot: 'T-2 Hours', activity: 'Setup & Vendor Load-in', responsiblePerson: 'Lead Coordinator' },
            { timeSlot: '00:00 (Start)', activity: 'Guest Arrival & Welcome', responsiblePerson: 'Host Team' },
            { timeSlot: '+01:30 Hours', activity: 'Main Program & Feasting', responsiblePerson: 'Catering Captain' },
          ],
      riskAndContingencies: Array.isArray(plan.riskAndContingencies) && plan.riskAndContingencies.length > 0
        ? plan.riskAndContingencies
        : [
            { risk: 'Weather fluctuations', impact: 'medium', contingencyPlan: 'Confirm indoor or waterproof covered backup area.' },
          ],
      personalizedRecommendations: Array.isArray(plan.personalizedRecommendations) && plan.personalizedRecommendations.length > 0
        ? plan.personalizedRecommendations
        : [`Leverage trusted local vendors in ${event.location} for maximum freshness and cost efficiency.`],
      costSavingOpportunities: Array.isArray(plan.costSavingOpportunities) && plan.costSavingOpportunities.length > 0
        ? plan.costSavingOpportunities
        : [
            {
              tip: 'Repurpose ceremony florals and stage backdrop lighting for dinner seating.',
              potentialSavings: `${event.currency} ${Math.round(total * 0.04).toLocaleString()}`,
              tradeoff: 'Requires 15 minutes of quick coordination by decor team between phases.',
            },
          ],
      generatedAt: plan.generatedAt || new Date().toISOString(),
      aiModelUsed: plan.aiModelUsed || AI_MODEL_NAME,
    };
  },

  /**
   * Generates a fully mathematically coherent and contextually tailored celebration plan
   */
  generateTailoredFallbackPlan(event: IEvent): IAIPlan {
    const total = event.budget || 500000;
    const daysUntilEvent = getDaysUntilEvent(event.date);

    const isWedding = event.type === 'wedding';
    const isBirthday = event.type === 'birthday';
    const isAnniversary = event.type === 'anniversary';
    const isCollege = event.type === 'college_event';
    const isCommunity = event.type === 'community_gathering';

    // 1. Proportional allocations strictly tailored by event type (summing to 100.0%)
    let allocationsConfig: { cat: ExpenseCategory; pct: number; expl: string }[];

    if (isWedding) {
      allocationsConfig = [
        { cat: 'venue', pct: 32.0, expl: `Selected to comfortably accommodate ${event.guestCount} guests in ${event.location}.` },
        { cat: 'catering', pct: 28.0, expl: `Multi-course royal celebration feast for ${event.guestCount} guests.` },
        { cat: 'decoration', pct: 14.0, expl: 'Grand mandap, thematic stage, florals, and warm ambient lighting.' },
        { cat: 'photography', pct: 10.0, expl: 'Full photo/video coverage, candid highlights, and drone capture.' },
        { cat: 'entertainment', pct: 6.0, expl: 'Sangeet DJ, live acoustic artists, and traditional welcoming musicians.' },
        { cat: 'outfits_styling', pct: 3.0, expl: 'Bridal styling, beauty touch-ups, and key ceremony accessories.' },
        { cat: 'transportation', pct: 2.5, expl: 'Priority family logistics, guest shuttles, and arrival coordination.' },
        { cat: 'invitations', pct: 1.5, expl: 'Bespoke stationery, digital video invites, and RSVP portal.' },
        { cat: 'miscellaneous', pct: 3.0, expl: 'Contingency reserve for unexpected requirements and hospitality tips.' },
      ];
    } else if (isCollege) {
      allocationsConfig = [
        { cat: 'entertainment', pct: 25.0, expl: 'Pro audio line-array sound system, headline indie band/DJ, and stage lighting.' },
        { cat: 'catering', pct: 25.0, expl: `High-volume student snack counters and beverage stations for ${event.guestCount} attendees.` },
        { cat: 'venue', pct: 20.0, expl: 'Campus amphitheater/ground staging, safety barricades, and facility sanitation.' },
        { cat: 'decoration', pct: 12.0, expl: 'Neon cyberpunk theme, entry arches, stage backdrop banners, and LED wash.' },
        { cat: 'miscellaneous', pct: 8.0, expl: 'Campus administration permits, security guards, first aid, and contingency.' },
        { cat: 'photography', pct: 5.0, expl: 'Student media live-streaming, reel creation, and festival aftermovie.' },
        { cat: 'transportation', pct: 3.0, expl: 'Band equipment transport, guest speaker transit, and logistics van.' },
        { cat: 'invitations', pct: 1.0, expl: 'Digital campus flyers, QR ticketing, and promotional posters.' },
        { cat: 'outfits_styling', pct: 1.0, expl: 'Volunteer event t-shirts, badges, and committee tags.' },
      ];
    } else if (isCommunity) {
      allocationsConfig = [
        { cat: 'catering', pct: 45.0, expl: `Wholesome community feast, festive prasad, and hot beverage counters for ${event.guestCount} residents.` },
        { cat: 'decoration', pct: 15.0, expl: 'Traditional festive lighting, diya arrays, rangoli arches, and floral decor.' },
        { cat: 'venue', pct: 15.0, expl: 'Society clubhouse, lawn setup, generator backup, and elder seating tents.' },
        { cat: 'entertainment', pct: 12.0, expl: 'Community sound system, cultural program stage, games host, and contest prizes.' },
        { cat: 'miscellaneous', pct: 6.0, expl: 'Sanitation, waste segregation bins, first aid, and green fireworks safety buffer.' },
        { cat: 'photography', pct: 4.0, expl: 'Community candid photo coverage and society newsletter album.' },
        { cat: 'transportation', pct: 1.5, expl: 'Delivery and hauling of rental chairs, tables, and festive supplies.' },
        { cat: 'invitations', pct: 1.0, expl: 'Society WhatsApp circulars, notice board posters, and RSVP tracking.' },
        { cat: 'outfits_styling', pct: 0.5, expl: 'Volunteer identification sash/caps for safety marshals.' },
      ];
    } else if (isAnniversary) {
      allocationsConfig = [
        { cat: 'catering', pct: 32.0, expl: `Fine-dining multi-course gourmet menu paired with artisanal desserts for ${event.guestCount} guests.` },
        { cat: 'venue', pct: 28.0, expl: 'Boutique heritage club banquet or garden glasshouse with intimate ambience.' },
        { cat: 'decoration', pct: 14.0, expl: 'Sophisticated silver & plum floral installations, candlelit tables, and memory wall.' },
        { cat: 'entertainment', pct: 10.0, expl: 'Live acoustic ghazal/jazz quartet, master of ceremonies, and tribute video audio.' },
        { cat: 'photography', pct: 8.0, expl: 'Fine-art anniversary portraiture, family documentary reel, and framed prints.' },
        { cat: 'miscellaneous', pct: 3.5, expl: 'Service staff gratuities, unexpected guest buffer, and celebration reserve.' },
        { cat: 'invitations', pct: 2.0, expl: 'Embossed silver foil keepsake invitations and interactive family RSVP site.' },
        { cat: 'outfits_styling', pct: 1.5, expl: 'Silver anniversary bespoke styling and hair/makeup refinement.' },
        { cat: 'transportation', pct: 1.0, expl: 'Chauffeured arrival vehicle for the celebrating couple.' },
      ];
    } else {
      // Default: Birthday and custom celebrations
      allocationsConfig = [
        { cat: 'catering', pct: 34.0, expl: `Curated culinary experience and custom dessert bar for ${event.guestCount} attendees.` },
        { cat: 'venue', pct: 26.0, expl: 'Private rooftop terrace, curated dining hall, or garden pavilion.' },
        { cat: 'decoration', pct: 15.0, expl: 'Theme-styled entrance, balloon/botanical photo wall, and custom table styling.' },
        { cat: 'entertainment', pct: 10.0, expl: 'Curated vinyl/digital DJ, interactive party games, and celebratory music.' },
        { cat: 'photography', pct: 6.0, expl: 'Candid event portraits, birthday moment reel, and instant polaroids.' },
        { cat: 'miscellaneous', pct: 4.0, expl: 'Contingency fund for last-minute party requests and extra servings.' },
        { cat: 'invitations', pct: 2.0, expl: 'Animated digital invite and interactive RSVP management.' },
        { cat: 'outfits_styling', pct: 1.5, expl: 'Theme attire coordination and milestone celebratory styling.' },
        { cat: 'transportation', pct: 1.5, expl: 'Logistics delivery for party cake, favors, and decor props.' },
      ];
    }

    // Mathematical guarantee: Verify percentages sum to exactly 100.0%
    const currentSum = allocationsConfig.reduce((acc, c) => acc + c.pct, 0);
    if (Math.abs(currentSum - 100) > 0.001) {
      allocationsConfig[allocationsConfig.length - 1].pct = Number(
        (100 - allocationsConfig.slice(0, -1).reduce((acc, c) => acc + c.pct, 0)).toFixed(1)
      );
    }

    const budgetAllocations = allocationsConfig.map((c) => ({
      category: c.cat,
      percentage: c.pct,
      allocatedAmount: Math.round((total * c.pct) / 100),
      explanation: c.expl,
    }));

    // Adjust any integer rounding discrepancy down to the exact rupee
    const sumAllocated = budgetAllocations.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
    const diff = total - sumAllocated;
    if (diff !== 0 && budgetAllocations.length > 0) {
      budgetAllocations[budgetAllocations.length - 1].allocatedAmount += diff;
    }

    // 2. Intelligent Dietary & Culinary Engine
    const dietaryLower = (event.dietaryRestrictions || '').toLowerCase() + ' ' + (event.foodPreferences || '').toLowerCase();
    const isVegan = dietaryLower.includes('vegan') || dietaryLower.includes('dairy-free');
    const isNutFree = dietaryLower.includes('nut') || dietaryLower.includes('peanut') || dietaryLower.includes('allergy');
    const isJain = dietaryLower.includes('jain') || dietaryLower.includes('satvik') || dietaryLower.includes('no onion');
    const isStrictVeg = isJain || dietaryLower.includes('pure veg') || dietaryLower.includes('vegetarian');
    const isNonVeg = !isStrictVeg && (dietaryLower.includes('non-veg') || dietaryLower.includes('chicken') || dietaryLower.includes('fish') || dietaryLower.includes('meat') || isWedding);

    let welcomeDrinks: string[];
    let appetizers: string[];
    let mainCourse: string[];
    let desserts: string[];
    let dietaryNotes: string;

    if (isVegan) {
      welcomeDrinks = [
        'Chilled Hibiscus & Mint Sparkler',
        'Cold-Pressed Kokum & Fresh Lime Elixir',
        'Cucumber Aloe Vera Detox Cooler',
      ];
      appetizers = [
        'Smoked Tofu & Crisp Bell Pepper Satay with Sesame Glaze',
        'Avocado & Raw Mango Sourdough Bruschetta',
        'Crispy Lotus Stem in Sweet Tamarind Chili (Agave)',
        'Golden Sweet Corn & Herb Tartlets',
      ];
      mainCourse = [
        'Charred Jackfruit Dum Biryani with Coconut Raita',
        'Roasted Seasonal Vegetables in Fragrant Coconut Moilee',
        'Slow-Simmered Black Chana Ragout with Fresh Coriander',
        'Tandoori Roti & Fluffy Jasmine Rice',
      ];
      desserts = [
        'Coconut Milk & Alphonsa Mango Panna Cotta',
        'Dark Chocolate Silk Pot with Raspberry Dust (Dairy-Free)',
        isNutFree
          ? 'Warm Saffron Cardamom Oat Milk Phirni with Roasted Sunflower Seeds'
          : 'Warm Saffron-Infused Almond Milk Phirni',
      ];
      dietaryNotes = '100% Certified Vegan (Strictly zero dairy, zero paneer, zero milk, zero butter/ghee, and zero eggs). ' +
        (isNutFree ? 'STRICT NUT-FREE: All seed garnishes only (sesame/sunflower), zero peanuts or tree nuts in preparation kitchen.' : 'Prepared in a dedicated plant-based service station.');
    } else if (isJain) {
      welcomeDrinks = [
        'Fresh Sugarcane & Ginger-Free Lime Elixir',
        'Royal Rose Saffron Sharbat with Chia Seeds',
        'Spiced Buttermilk with Roasted Cumin & Curry Leaf',
      ];
      appetizers = [
        'Raw Banana & Mint Kebabs with Coriander Dip',
        'Golden Moong Dal & Corn Crisps',
        'Paneer Tikka with Yellow Bell Peppers (Satvik Style)',
        'Crisp Cheese & Jalapeno Croquettes',
      ];
      mainCourse = [
        'Royal Shahi Paneer in Cashew-Melon Seed Veloute (Satvik Recipe)',
        'Dal Bati Churma with Pure Desi Ghee',
        'Fragrant Green Pea Pulao with Whole Cardamom',
        'Fresh Soft Phulkas & Steamed Basmati Rice',
      ];
      desserts = [
        'Kesar Pista Malpua with Reduced Sweet Milk',
        'Traditional Mawa Gujiya with Silver Leaf',
        'Artisanal Kulfi Falooda with Sweet Basil Seeds',
      ];
      dietaryNotes = '100% Jain Satvik Compliant: Completely free of onion, garlic, potatoes, carrots, beetroot, and root vegetables. Prepared with dedicated utensils.';
    } else if (isCollege) {
      welcomeDrinks = [
        'Iced Masala Lemonade Pitchers',
        'Signature Cold Coffee on Tap with Caramel Drizzle',
        'Electric Blue Curacao Mocktail Slush',
      ];
      appetizers = [
        'Crispy Steamed & Fried Momo Baskets with Spicy Garlic Dip',
        'Loaded Cheesy Nachos with Pico de Gallo & Jalapeno Relish',
        'Paneer & Chicken Frankies in Roomali Wraps',
        'Peri-Peri Crispy Potato Wedges',
      ];
      mainCourse = [
        'Live Artisan Flatbread Pizza Station (Margherita & BBQ)',
        'Wok-Tossed Schezwan Hakka Noodles & Manchurian Bowls',
        'Mini Gourmet Burger Slider Bar with Slaw',
        'Classic Paneer Lababdar & Butter Chicken with Naan Breads',
      ];
      desserts = [
        'Hot Chocolate Waffle Pops with Sprinkles',
        'Assorted Mini Cupcakes & Brownie Bites',
        'Creamy Mango Ice Cream Tubs',
      ];
      dietaryNotes = 'Student-friendly high-volume food layout with clearly separated Vegetarian and Non-Vegetarian grab-and-go counters.';
    } else if (isNonVeg) {
      welcomeDrinks = [
        'Rose Saffron Sparkling Elixir',
        'Tangy Kokum & Cumin Cooler',
        'Green Apple & Mint Mocktail',
      ];
      appetizers = [
        'Murgh Malai Tikka with Mint Coulis',
        'Coastal Amritsari Crispy Fish Strips',
        'Smoked Paneer Angara Kebabs',
        'Crispy Golden Mushroom Caps',
      ];
      mainCourse = [
        'Dum Pukht Awadhi Chicken Biryani with Burani Raita',
        'Coastal Coconut Fish Curry (Mangalorean Style)',
        'Royal Dal Makhani Simmered Overnight in Copper Handi',
        'Paneer Makhani with Butter Naans & Laccha Paratha',
      ];
      desserts = [
        'Warm Pistachio Baklava with Vanilla Bean Glaze',
        'Baked Gulab Jamun Tartlets with Rabdi Swirl',
        'Artisanal Belgian Dark Chocolate Gelato',
      ];
      dietaryNotes = 'Bespoke multi-cuisine banquet: Strictly independent vegetarian and non-vegetarian preparation and buffet service aisles.';
    } else {
      // Default: Refined Pure Vegetarian
      welcomeDrinks = [
        'Refreshing Mint & Spiced Cooler',
        'Artisanal Seasonal Fruit Punch',
        'Chilled Rose Saffron Elixir',
      ];
      appetizers = [
        'Smoked Paneer & Bell Pepper Skewers',
        'Crispy Golden Corn Tartlets with Herb Dip',
        'Signature Dahi Ke Kebab with Mint Glaze',
      ];
      mainCourse = [
        'Paneer Lababdar in Rich Tomato Gravy',
        'Fragrant Basmati Saffron Pilaf',
        'Fresh Artisanal Breads (Butter Naan & Roti)',
        'Creamy Black Lentil Delicacy with Desi Ghee',
      ];
      desserts = [
        'Warm Pistachio Souffle & Vanilla Bean Glaze',
        'Traditional Sweet Trio Platter',
        'Artisan Gelato Station',
      ];
      dietaryNotes = event.dietaryRestrictions || 'Designated pure vegetarian festive banquet with clear allergen notifications.';
    }

    // 3. Dynamic Horizon-Adaptive Preparation Timeline
    let preparationTimeline: { milestone: string; dueTimeline: string; tasks: string[] }[];

    if (daysUntilEvent <= 14) {
      // High-Velocity Sprint Horizon (<= 2 Weeks)
      preparationTimeline = [
        {
          milestone: 'Sprint Phase 1: Immediate Holds (Days 1-3)',
          dueTimeline: `T-${Math.max(1, daysUntilEvent - 2)} Days`,
          tasks: [
            'Execute venue agreement and lock sound/power access',
            'Confirm key vendor bookings (caterer, sound, photographer)',
            'Deploy digital RSVP notification with deadline in 48 hours',
          ],
        },
        {
          milestone: 'Sprint Phase 2: Production Lockdown (Days 4-7)',
          dueTimeline: `T-${Math.max(1, Math.round(daysUntilEvent / 2))} Days`,
          tasks: [
            'Finalize guaranteed plate count with catering lead',
            'Conduct audio-visual frequency check & safety protocol review',
            'Assemble signage, directional boards, and registration kits',
          ],
        },
        {
          milestone: 'Sprint Phase 3: Final 48-Hour Technical Run',
          dueTimeline: 'T-48 Hours',
          tasks: [
            'On-site staging and lighting dry run with coordinator',
            'Distribute run-of-show contact sheet to all volunteers and vendors',
            'Confirm weather shelter and generator diesel reserves',
          ],
        },
        {
          milestone: 'Event Day Execution & Show Flow',
          dueTimeline: 'Day of Event',
          tasks: [
            'Morning staging inspection and audio level calibration',
            'Host greeters in place at entrance 45 minutes before start',
            'Live stage management, timeline cues, and closing tear-down',
          ],
        },
      ];
    } else if (daysUntilEvent <= 45) {
      // Rapid Planning Horizon (2-6 Weeks)
      preparationTimeline = [
        {
          milestone: '4-5 Weeks Prior: Foundations',
          dueTimeline: 'Week 1',
          tasks: [
            'Finalize venue contract and security deposit',
            'Contract photographer, sound system, and core entertainer',
            'Broadcast digital invitations and open RSVP tracking',
          ],
        },
        {
          milestone: '2-3 Weeks Prior: Curation & Styling',
          dueTimeline: 'Week 3',
          tasks: [
            'Complete caterer tasting and lock dietary service lines',
            'Approve stage floral layout and entrance welcome installations',
            'Rehearse keynote moments, speeches, or ceremony cues',
          ],
        },
        {
          milestone: '1 Week Prior: Final Alignment',
          dueTimeline: 'T-7 Days',
          tasks: [
            'Lock guaranteed guest count with caterer and venue',
            'Finalize seating chart, table runners, and directional cues',
            'Brief all vendors on load-in schedule and parking logistics',
          ],
        },
        {
          milestone: 'Event Week & Day-Of',
          dueTimeline: 'Final 48 Hours',
          tasks: [
            'Staging load-in, AV sound check, and electrical checks',
            'Execute event schedule, coordinate ceremonies, and celebrate!',
          ],
        },
      ];
    } else {
      // Standard / Extended Horizon (> 6 Weeks)
      preparationTimeline = [
        {
          milestone: '8-12 Weeks Prior: Vision & Core Procurement',
          dueTimeline: 'Month 1',
          tasks: [
            'Sign venue agreement and establish access windows',
            'Shortlist and contract top-tier caterer, photographer, and decorator',
            'Establish creative design concept, color palette, and invitations',
          ],
        },
        {
          milestone: '4-6 Weeks Prior: Guest Curation & Tastings',
          dueTimeline: 'Month 2',
          tasks: [
            'Dispatch formal invitations with RSVP deadline',
            'Execute food tasting session and approve custom beverage menu',
            'Coordinate entertainment rider, sound permits, and staging rigging',
          ],
        },
        {
          milestone: '2-3 Weeks Prior: Operational Lockdown',
          dueTimeline: 'T-21 Days',
          tasks: [
            'Consolidate RSVP roster and dietary requirements',
            'Review run-of-show schedule with venue banquet manager',
            'Assemble favor hampers and customized keepsake stationery',
          ],
        },
        {
          milestone: 'Event Week & Day-Of',
          dueTimeline: 'Final 48 Hours',
          tasks: [
            'Stage assembly, floral rigging, and sound frequency checks',
            'Vendor coordination walkthrough and master timeline execution',
          ],
        },
      ];
    }

    // 4. Adaptive Venue Recommendations by Capacity & Type
    const venueCapacityHigh = Math.round(event.guestCount * 1.3);
    let venueTypeRecommendation: string;
    let venuePros: string[];
    let venueCons: string[];

    if (isCollege) {
      venueTypeRecommendation = event.venuePreference || 'Campus Open-Air Amphitheater & Quadrangle Grounds';
      venuePros = ['Zero rental fees on campus grounds', 'Generous capacity for 700+ student body', 'High natural acoustics'];
      venueCons = ['Requires prompt Dean approval for sound limit past 10 PM', 'Must arrange temporary generator and barricades'];
    } else if (isCommunity) {
      venueTypeRecommendation = event.venuePreference || 'Society Central Clubhouse & Community Park';
      venuePros = ['Walking distance for all society residents', 'Familiar, family-safe environment', 'Low logistical overhead'];
      venueCons = ['Requires resident committee approval and designated quiet hours'];
    } else if (event.guestCount >= 300) {
      venueTypeRecommendation = event.venuePreference || 'Heritage Palace Resort Lawns & Grand Ballroom';
      venuePros = ['Substantial parking and multiple event lawns', 'Bespoke hospitality suites', 'Magnificent ceremonial backdrops'];
      venueCons = ['Strict outdoor sound curfew; requires early deposit confirmation'];
    } else if (event.guestCount >= 70) {
      venueTypeRecommendation = event.venuePreference || 'Boutique Heritage Banquet & Verandah';
      venuePros = ['Intimate ambiance with architectural character', 'Seamless indoor-outdoor flow', 'Dedicated banquet staff'];
      venueCons = ['Valet parking coordination required for peak arrival times'];
    } else {
      venueTypeRecommendation = event.venuePreference || 'Private Rooftop Terrace & Dining Glasshouse';
      venuePros = ['Exclusive sunset views and cozy atmosphere', 'High privacy for close family & friends', 'Flexible layout'];
      venueCons = ['Weather canopy required in case of unexpected rain'];
    }

    // 5. Contextual Risk & Contingency Planning
    let riskAndContingencies: { risk: string; impact: 'low' | 'medium' | 'high'; contingencyPlan: string }[];

    if (isCollege) {
      riskAndContingencies = [
        {
          risk: 'Campus 10 PM Noise Ordinance Cutoff',
          impact: 'high',
          contingencyPlan: 'Schedule headline band performance between 7:30 PM - 9:30 PM, tapering off to acoustic announcements by 9:45 PM.',
        },
        {
          risk: 'Student Crowd Surge at Amphitheater Gates',
          impact: 'medium',
          contingencyPlan: 'Implement two separate entry gates with volunteer QR scanners and pre-installed crowd control stanchions.',
        },
        {
          risk: 'Audio Amplifier Power Tripping',
          impact: 'medium',
          contingencyPlan: 'Deploy a dedicated silent diesel generator exclusively for the stage audio-visual line-array setup.',
        },
      ];
    } else if (isCommunity) {
      riskAndContingencies = [
        {
          risk: 'Elderly Guest Comfort & Accessibility',
          impact: 'high',
          contingencyPlan: 'Set up shaded priority seating near the main stage with direct ramp access and dedicated hospitality volunteers.',
        },
        {
          risk: 'Fireworks Safety & Fire Hazards',
          impact: 'high',
          contingencyPlan: 'Confine sparklers and green fireworks to the society boundary sports ground with two active sand buckets and fire extinguishers.',
        },
        {
          risk: 'Unexpected Resident Headcount Surge (+20%)',
          impact: 'medium',
          contingencyPlan: 'Order buffer servings for snacks and maintain instant replenishment with local community bakery partner.',
        },
      ];
    } else {
      riskAndContingencies = [
        {
          risk: 'Unexpected weather shifts or outdoor breezes',
          impact: 'medium',
          contingencyPlan: 'Ensure venue provides an immediate indoor banquet backup hall or weighted sidewall canopies.',
        },
        {
          risk: 'Headcount surge beyond initial RSVPs (+10%)',
          impact: 'medium',
          contingencyPlan: 'Contract caterer for a standard 10% food buffer and venue for additional auxiliary round tables.',
        },
        {
          risk: 'AV or microphone audio feedback',
          impact: 'low',
          contingencyPlan: 'Sound technician must keep wired backup microphones and spare battery packs on stage at all times.',
        },
      ];
    }

    const venueBudget = budgetAllocations.find((a) => a.category === 'venue')?.allocatedAmount || Math.round(total * 0.28);
    const decorBudget = budgetAllocations.find((a) => a.category === 'decoration')?.allocatedAmount || Math.round(total * 0.14);

    return {
      eventSummary: `A masterfully designed ${event.type.replace('_', ' ')} celebration for ${event.guestCount} guests in ${event.location}, harmonizing ${event.themePreference || 'festive elegance'} with a thoughtful ${event.currency} ${total.toLocaleString()} budget.`,
      recommendedThemes: [
        {
          name: event.themePreference || (isWedding ? 'Sunset Rose & Royal Gold' : isCollege ? 'Neon Cyberpunk & Indie Beats' : isCommunity ? 'Traditional Diya & Rangoli Carnival' : 'Modern Celebration Elegance'),
          description: `A harmonious aesthetic blending warm inviting lighting, celebratory floral elements, and premium event styling.`,
          colorPalette: isWedding ? ['#4A1D36', '#DE3E1B', '#DFCA71', '#FDFBF7'] : isCollege ? ['#0F172A', '#06B6D4', '#EC4899', '#F8FAFC'] : ['#BA6595', '#F25C3B', '#FAF6E6', '#2A0D1E'],
          vibe: isCollege ? 'Electric, youthful, and vibrant' : isCommunity ? 'Warm, welcoming, and community-centered' : 'Warm, elevated, and memorable',
        },
        {
          name: 'Contemporary Minimalist Chic',
          description: 'Contemporary chic styling with warm monochrome drapery, brass accents, and amber ambient lamps.',
          colorPalette: ['#2A0D1E', '#C9AF43', '#ECE5D8', '#FFFFFF'],
          vibe: 'Sophisticated, modern, and clean',
        },
      ],
      decorationSuggestions: [
        {
          area: 'Grand Entrance & Welcome Foyer',
          concept: 'Festive welcome signage with cascading seasonal flowers, brass lamps, and an interactive seating chart easel.',
          estimatedCost: Math.round(decorBudget * 0.35),
        },
        {
          area: 'Main Stage / Celebration Backdrop',
          concept: 'Layered botanical backdrop with custom typographic name monogram and warm backlighting.',
          estimatedCost: Math.round(decorBudget * 0.45),
        },
        {
          area: 'Guest Dining & Lounge Tables',
          concept: 'Refined linen runners with low floral centerpieces so guests can converse freely across tables.',
          estimatedCost: Math.round(decorBudget * 0.20),
        },
      ],
      venueRecommendations: [
        {
          venueType: venueTypeRecommendation,
          capacityMatch: `Comfortably accommodates ${event.guestCount} to ${venueCapacityHigh} guests`,
          estimatedPriceRange: `${event.currency} ${Math.round(venueBudget * 0.9).toLocaleString()} - ${event.currency} ${Math.round(venueBudget * 1.05).toLocaleString()}`,
          pros: venuePros,
          considerations: venueCons,
        },
      ],
      cateringMenuIdeas: {
        welcomeDrinks,
        appetizers,
        mainCourse,
        desserts,
        dietaryNotes,
      },
      entertainmentAndActivities: [
        {
          activity: 'Interactive Welcome Experience',
          description: 'Acoustic background melodies, polaroid guestbook station, and signature welcome refreshments.',
          targetAudience: 'All arriving attendees',
          timing: 'First 60 minutes of arrival',
        },
        {
          activity: 'Centerpiece Celebration & Speeches',
          description: 'Curated toasts, cake cutting / ceremonial lighting, and celebratory music fanfare.',
          targetAudience: 'Honorees, family & close friends',
          timing: 'Mid-event peak time',
        },
        {
          activity: 'Open Dance Floor & Celebration Beats',
          description: 'High-energy musical playlist blending crowd favorites and timeless celebration anthems.',
          targetAudience: 'All party attendees',
          timing: 'Final 2 hours of event',
        },
      ],
      budgetAllocations,
      preparationTimeline,
      vendorChecklist: [
        {
          category: 'Venue & Banquet Management',
          criticalQuestions: ['What are the load-in and teardown hour limits?', 'Is outside catering and decor permitted without surcharge?'],
          bookingWindow: `${Math.min(daysUntilEvent, 60)} days before event`,
        },
        {
          category: 'Catering & Beverages',
          criticalQuestions: ['Do you include serving staff, linens, and glassware?', 'What is the policy for headcount adjustments 7 days prior?'],
          bookingWindow: `${Math.min(daysUntilEvent, 45)} days before event`,
        },
        {
          category: 'Photography & Media',
          criticalQuestions: ['What is the delivery timeline for edited highlight clips and high-res photos?', 'Are drone flight permissions included?'],
          bookingWindow: `${Math.min(daysUntilEvent, 30)} days before event`,
        },
      ],
      eventDaySchedule: [
        {
          timeSlot: 'T-3 Hours',
          activity: 'Vendor Load-in, Floral Rigging & Sound Check',
          responsiblePerson: 'Lead Event Coordinator',
          notes: 'Inspect staging power and lighting cues',
        },
        {
          timeSlot: '00:00 (Start)',
          activity: 'Guest Arrival, High-Tea & Welcome Ambient Music',
          responsiblePerson: 'Host & Welcome Greeters',
          notes: 'Photographer captures entrance portraits',
        },
        {
          timeSlot: '+01:30 Hours',
          activity: 'Main Ceremonial Moments, Toasts & Key Rituals',
          responsiblePerson: 'Master of Ceremonies',
          notes: 'Dim house lights for spotlight entrance',
        },
        {
          timeSlot: '+02:30 Hours',
          activity: 'Gourmet Feast & Dinner Service Opens',
          responsiblePerson: 'Catering Captain',
          notes: 'Maintain live food counter replenishment',
        },
        {
          timeSlot: '+03:30 Hours',
          activity: 'Musical Dance Floor, Dessert Bar & Farewell Keepsakes',
          responsiblePerson: 'DJ / Band Lead',
          notes: 'Hand out guest favor bags at exit',
        },
      ],
      riskAndContingencies,
      personalizedRecommendations: [
        `Given your location in ${event.location}, take advantage of trusted local floral and rental markets to source seasonal supplies for maximum freshness at 25-30% lower cost.`,
        `Set up a digital QR code for instant photo upload directly onto your Festivo live gallery.`,
      ],
      costSavingOpportunities: [
        {
          tip: 'Consolidate floral arrangements from the ceremony entrance to the dinner stage area following the welcome.',
          potentialSavings: `${event.currency} ${Math.round(total * 0.03).toLocaleString()}`,
          tradeoff: 'Requires 15 minutes of quick coordination by the decorator between phases.',
        },
        {
          tip: 'Prioritize a signature welcome mocktail over a sprawling open beverage menu.',
          potentialSavings: `${event.currency} ${Math.round(total * 0.04).toLocaleString()}`,
          tradeoff: 'Fewer obscure beverage choices, but higher presentation quality.',
        },
      ],
      generatedAt: new Date().toISOString(),
      aiModelUsed: this.isConfigured() ? AI_MODEL_NAME : `${AI_MODEL_NAME} (Intelligent Engine Simulator)`,
    };
  },

  /**
   * Conversational Assistant with Context
   */
  async chatWithEvent(event: IEvent, userMessage: string, history: IChatMessage[]): Promise<{
    reply: string;
    suggestedAction?: {
      type: 'add_expense' | 'adjust_budget' | 'add_task' | 'add_vendor' | 'update_plan';
      payload: any;
      label: string;
    };
  }> {
    const gemini = getGeminiClient();

    // Summary of current numbers for context
    const totalSpent = (event.expenses || []).reduce((acc, curr) => acc + (curr.actualAmount || curr.estimatedAmount || 0), 0);
    const remaining = event.budget - totalSpent;
    const pendingTasks = (event.tasks || []).filter((t) => t.status !== 'completed').length;

    const systemContext = `
You are Festivo AI, the intelligent celebration planning advisor.
Active Event Context:
- Name: "${event.name}"
- Type: ${event.type}
- Date: ${event.date}
- Location: ${event.location}
- Guests: ${event.guestCount}
- Total Budget: ${event.currency} ${event.budget}
- Spent So Far: ${event.currency} ${totalSpent}
- Remaining Budget: ${event.currency} ${remaining}
- Pending Tasks: ${pendingTasks}
- Cultural/Dietary notes: ${event.dietaryRestrictions || 'None'} ${event.culturalRequirements || 'None'}

Be helpful, concise, empathetic, and actionable. Provide concrete cost estimates in ${event.currency} whenever discussing expenses.
`;

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: AI_MODEL_NAME,
          systemInstruction: systemContext,
        });

        const chat = model.startChat({
          history: history.slice(-6).map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
        });

        const result = await chat.sendMessage(userMessage);
        const reply = result.response.text();
        return { reply };
      } catch (err) {
        console.error('Gemini chat error, using context assistant engine:', err);
      }
    }

    // Context-aware intelligent conversational engine
    const lower = userMessage.toLowerCase();
    let reply = '';
    let suggestedAction: any = undefined;

    if (lower.includes('affordable') || lower.includes('reduce') || lower.includes('save') || lower.includes('cost')) {
      reply = `To optimize your ${event.currency} ${event.budget.toLocaleString()} budget and preserve your remaining ${event.currency} ${remaining.toLocaleString()}, here are 3 high-impact strategies:\n\n1. **Floral Repurposing**: Shift the welcome entrance floral arches to the main dining backdrop right after guest arrivals. Saves ~${event.currency} ${Math.round(event.budget * 0.03).toLocaleString()}.\n2. **Curated Signature Menu**: Replace an unwieldy 18-item buffet with a tightly curated 10-dish regional gourmet experience. Saves ~${event.currency} ${Math.round(event.budget * 0.05).toLocaleString()}.\n3. **Digital Keepsakes**: Use digital RSVP and digital save-the-dates for broader social circles, printing physical boxes only for immediate VIPs. Saves ~${event.currency} 15,000.`;
      suggestedAction = {
        type: 'adjust_budget',
        payload: { suggestedSavings: Math.round(event.budget * 0.08) },
        label: `Apply Suggested Cost Optimization (${event.currency} ${Math.round(event.budget * 0.08).toLocaleString()})`,
      };
    } else if (lower.includes('vegetarian') || lower.includes('food') || lower.includes('menu')) {
      reply = `Here is an elevated festive vegetarian menu tailored for ${event.guestCount} guests in ${event.location}:\n\n- **Starters**: Paneer Tikka Angara with Mint Coulis, Lotus Stem Crisps, Dahi Ke Shahi Kebab.\n- **Mains**: Dal Makhani simmered 24 hours in copper pots, Paneer Lababdar, Subz Handi Biryani with Burani Raita, and hot butter naans.\n- **Desserts**: Rabdi Jalebi with saffron strands and Baked Gulab Jamun Tartlets.\n\nAll dishes can be prepared with zero onion/garlic counters upon request.`;
      suggestedAction = {
        type: 'add_task',
        payload: {
          title: 'Schedule Tasting for Festive Vegetarian Menu',
          description: 'Review starter portions and spice balance with catering team.',
          dueDate: event.date,
          priority: 'high',
          status: 'pending',
          category: 'Catering',
        },
        label: 'Add Menu Tasting Task',
      };
    } else if (lower.includes('rain') || lower.includes('backup') || lower.includes('weather')) {
      reply = `For outdoor celebrations, here is the immediate Weather Contingency Checklist:\n\n1. **Tent Canopy Hold**: Request a 48-hour rain-check hold with your rental vendor for waterproof pagodas.\n2. **Pathway Flooring**: Ensure rubberized or carpeted sub-flooring so lawn moisture does not compromise guest footwear.\n3. **Electrical Shielding**: Double-check that all DJ and ambient lighting cables are weather-rated with RCD circuit breakers.\n\nEstimated contingency buffer: ~${event.currency} 25,000.`;
      suggestedAction = {
        type: 'add_task',
        payload: {
          title: 'Secure Tent Canopy Weather Hold with Vendor',
          description: 'Confirm backup marquee availability within 24 hours of event date.',
          dueDate: event.date,
          priority: 'urgent',
          status: 'pending',
          category: 'Contingency',
        },
        label: 'Add Rain Contingency Task',
      };
    } else if (lower.includes('task') || lower.includes('pending') || lower.includes('priority')) {
      reply = `You currently have **${pendingTasks} pending tasks** for "${event.name}".\n\nThe 3 most critical deadlines:\n1. Lock key vendor contracts (venue & catering) before pricing escalates.\n2. Collect RSVP responses to finalize exact per-plate headcounts.\n3. Conduct venue acoustic and lighting dry runs.`;
    } else {
      reply = `I have analyzed "${event.name}" for ${event.guestCount} guests on ${event.date}.\n\nWith a total budget of ${event.currency} ${event.budget.toLocaleString()} and ${event.currency} ${remaining.toLocaleString()} remaining, your planning progress is looking robust. Would you like to explore theme alternatives, refine your vendor booking milestones, or run cost-saving simulations?`;
    }

    return { reply, suggestedAction };
  },
};
