import { Router, Request, Response } from 'express';
import { dataService } from '../services/dataService.js';
import { aiService } from '../services/aiService.js';
import { ChatMessageInputSchema } from '../schemas/index.js';

const router = Router();
const param = (p: string | string[] | undefined): string => (Array.isArray(p) ? p[0] : p || '');

// GENERATE STRUCTURED CELEBRATION PLAN
router.post('/:id/generate-plan', async (req: Request, res: Response) => {
  try {
    const event = await dataService.getEventById(param(req.params.id));
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    console.log(`Starting AI plan generation for event "${event.name}" (${event.id})...`);
    const plan = await aiService.generatePlan(event);

    // Save to event
    await dataService.saveAIPlan(event.id, plan);

    // If event has no expenses yet, seed them from budgetAllocations
    if (!event.expenses || event.expenses.length === 0) {
      for (const alloc of plan.budgetAllocations) {
        await dataService.addExpense(event.id, {
          category: alloc.category,
          description: `${alloc.category.charAt(0).toUpperCase() + alloc.category.slice(1)}: ${alloc.explanation}`,
          estimatedAmount: alloc.allocatedAmount,
          actualAmount: 0,
          notes: 'Auto-populated from AI Budget Allocation',
        });
      }
    }

    // If event has no tasks yet, seed initial tasks from preparationTimeline with sensible staggered deadlines
    if (!event.tasks || event.tasks.length === 0) {
      const eventTime = new Date(event.date).getTime();
      const nowTime = Date.now();
      const totalDays = Math.max(1, Math.round((eventTime - nowTime) / (1000 * 60 * 60 * 24)));
      const totalMilestones = plan.preparationTimeline.length;

      for (let mIdx = 0; mIdx < totalMilestones; mIdx++) {
        const milestone = plan.preparationTimeline[mIdx];
        // Calculate a sensible sequential deadline before eventDate based on milestone progression
        const fraction = totalMilestones > 1 ? mIdx / (totalMilestones - 1) : 1;
        const daysFromNow = Math.round(fraction * totalDays);
        const taskDueDateObj = new Date(nowTime + daysFromNow * 24 * 60 * 60 * 1000);
        const taskDueDate = taskDueDateObj > new Date(eventTime)
          ? event.date
          : taskDueDateObj.toISOString().split('T')[0];

        for (const taskTitle of milestone.tasks) {
          await dataService.addTask(event.id, {
            title: taskTitle,
            description: `Milestone: ${milestone.milestone}`,
            dueDate: taskDueDate,
            priority: mIdx === 0 || mIdx === totalMilestones - 1 ? 'high' : 'medium',
            status: 'pending',
            category: milestone.milestone,
            notes: `Scheduled for ${milestone.dueTimeline} (${taskDueDate})`,
          });
        }
      }
    }

    // Fetch updated event
    const updated = await dataService.getEventById(event.id);
    res.json({
      success: true,
      message: 'AI plan generated and synchronized successfully',
      data: plan,
      event: updated,
    });
  } catch (error: any) {
    console.error('Error generating AI plan:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating the celebration plan. Please try again.',
      error: error.message,
    });
  }
});

// INTERACTIVE AI CHAT
router.post('/:id/ai-chat', async (req: Request, res: Response) => {
  try {
    const parsed = ChatMessageInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const event = await dataService.getEventById(param(req.params.id));
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Save user message to history
    await dataService.addChatMessage(event.id, {
      role: 'user',
      content: parsed.data.message,
    });

    const history = await dataService.getChatHistory(event.id);

    // Call AI service
    const { reply, suggestedAction } = await aiService.chatWithEvent(event, parsed.data.message, history);

    // Save assistant reply to history
    const savedReply = await dataService.addChatMessage(event.id, {
      role: 'assistant',
      content: reply,
      suggestedAction,
    });

    res.json({
      success: true,
      data: savedReply,
      suggestedAction,
    });
  } catch (error: any) {
    console.error('Error in AI chat assistant:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to process chat request at this moment.',
      error: error.message,
    });
  }
});

// GET CHAT HISTORY
router.get('/:id/chat-history', async (req: Request, res: Response) => {
  try {
    const history = await dataService.getChatHistory(param(req.params.id));
    res.json({ success: true, count: history.length, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve chat history', error: error.message });
  }
});

// GENERATE PERSONALIZED IDEAS WITH AI
router.post('/:id/ideas/generate', async (req: Request, res: Response) => {
  try {
    const event = await dataService.getEventById(param(req.params.id));
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const newIdeas = [
      {
        title: `Curated ${event.themePreference || 'Celebration'} Signature Welcome Bar`,
        description: `An artisan refreshment setup featuring seasonal mocktails themed around ${event.name}.`,
        category: 'Food & Beverage',
        estimatedCostRange: `${event.currency} 15,000 - 25,000`,
        whyItFits: `Complements the festive guest arrival experience for ${event.guestCount} attendees in ${event.location}.`,
        implementationSuggestions: [
          'Design custom menu cards matching theme typography',
          'Use eco-friendly bamboo straws and garnished glassware',
        ],
        isFavorite: false,
      },
      {
        title: 'Interactive Audio Guestbook & Polaroid Station',
        description: 'A vintage telephone recording booth where guests leave heartfelt voicemail wishes, paired with instant photo strips.',
        category: 'Guest Experience',
        estimatedCostRange: `${event.currency} 12,000 - 20,000`,
        whyItFits: 'Creates an emotional, lasting physical and digital heirloom from the celebration.',
        implementationSuggestions: [
          'Set up near the welcome lounge with soft ring lighting',
          'Have a designated attendee replace film cartridges',
        ],
        isFavorite: false,
      },
      {
        title: 'Illuminated Night-Sky Sparkler / Light Farewell',
        description: 'Distribute smokeless celebration sparklers or glowing fiber-optic wands for the grand celebration exit.',
        category: 'Activities & Entertainment',
        estimatedCostRange: `${event.currency} 6,000 - 10,000`,
        whyItFits: 'Gives the photographer a breathtaking closing cinematic visual without high fireworks expense.',
        implementationSuggestions: [
          'Coordinate timing 15 minutes before event close',
          'Provide safety sand buckets for disposal',
        ],
        isFavorite: false,
      },
    ];

    const createdList = [];
    for (const idea of newIdeas) {
      const created = await dataService.addIdea(event.id, idea);
      if (created) createdList.push(created);
    }

    res.json({ success: true, message: 'Generated ideas added to gallery', data: createdList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate ideas', error: error.message });
  }
});

export default router;
