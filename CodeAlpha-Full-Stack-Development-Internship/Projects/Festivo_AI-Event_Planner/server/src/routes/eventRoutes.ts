import { Router, Request, Response } from 'express';
import { dataService } from '../services/dataService.js';
import {
  CreateEventSchema,
  UpdateEventSchema,
  ExpenseSchema,
  TaskSchema,
  VendorSchema,
  IdeaSchema,
} from '../schemas/index.js';

const router = Router();
const param = (p: string | string[] | undefined): string => (Array.isArray(p) ? p[0] : p || '');

// GET all events
router.get('/', async (_req: Request, res: Response) => {
  try {
    const events = await dataService.getAllEvents();
    res.json({ success: true, count: events.length, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve events', error: error.message });
  }
});

// GET single event by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await dataService.getEventById(param(req.params.id));
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
  }
});

// CREATE new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = CreateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }

    const created = await dataService.createEvent(parsed.data);
    res.status(201).json({ success: true, message: 'Event created successfully', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
});

// UPDATE event
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = UpdateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }

    const updated = await dataService.updateEvent(param(req.params.id), parsed.data);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
});

// DELETE event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await dataService.deleteEvent(param(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Event not found or already deleted' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
});

// EXPENSES SUB-RESOURCE
router.get('/:id/expenses', async (req: Request, res: Response) => {
  try {
    const expenses = await dataService.getExpenses(param(req.params.id));
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get expenses', error: error.message });
  }
});

router.post('/:id/expenses', async (req: Request, res: Response) => {
  try {
    const parsed = ExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }
    const expense = await dataService.addExpense(param(req.params.id), parsed.data);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(201).json({ success: true, data: expense });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add expense', error: error.message });
  }
});

router.patch('/:id/expenses/:expenseId', async (req: Request, res: Response) => {
  try {
    const parsed = ExpenseSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }
    const updated = await dataService.updateExpense(param(req.params.id), param(req.params.expenseId), parsed.data);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Expense or event not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update expense', error: error.message });
  }
});

router.delete('/:id/expenses/:expenseId', async (req: Request, res: Response) => {
  try {
    const success = await dataService.deleteExpense(param(req.params.id), param(req.params.expenseId));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete expense', error: error.message });
  }
});

// TASKS SUB-RESOURCE
router.get('/:id/tasks', async (req: Request, res: Response) => {
  try {
    const tasks = await dataService.getTasks(param(req.params.id));
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get tasks', error: error.message });
  }
});

router.post('/:id/tasks', async (req: Request, res: Response) => {
  try {
    const parsed = TaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }
    const task = await dataService.addTask(param(req.params.id), parsed.data);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add task', error: error.message });
  }
});

router.patch('/:id/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const parsed = TaskSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }
    const updated = await dataService.updateTask(param(req.params.id), param(req.params.taskId), parsed.data);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task or event not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
});

router.delete('/:id/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const success = await dataService.deleteTask(param(req.params.id), param(req.params.taskId));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
  }
});

// VENDORS SUB-RESOURCE
router.get('/:id/vendors', async (req: Request, res: Response) => {
  try {
    const vendors = await dataService.getVendors(param(req.params.id));
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get vendors', error: error.message });
  }
});

router.post('/:id/vendors', async (req: Request, res: Response) => {
  try {
    const parsed = VendorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }
    const vendor = await dataService.addVendor(param(req.params.id), parsed.data);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(201).json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add vendor', error: error.message });
  }
});

router.patch('/:id/vendors/:vendorId', async (req: Request, res: Response) => {
  try {
    const parsed = VendorSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }
    const updated = await dataService.updateVendor(param(req.params.id), param(req.params.vendorId), parsed.data);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Vendor or event not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update vendor', error: error.message });
  }
});

router.delete('/:id/vendors/:vendorId', async (req: Request, res: Response) => {
  try {
    const success = await dataService.deleteVendor(param(req.params.id), param(req.params.vendorId));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete vendor', error: error.message });
  }
});

// IDEAS SUB-RESOURCE
router.get('/:id/ideas', async (req: Request, res: Response) => {
  try {
    const ideas = await dataService.getIdeas(param(req.params.id));
    res.json({ success: true, count: ideas.length, data: ideas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get ideas', error: error.message });
  }
});

router.post('/:id/ideas', async (req: Request, res: Response) => {
  try {
    const parsed = IdeaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.issues });
    }
    const idea = await dataService.addIdea(param(req.params.id), parsed.data);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(201).json({ success: true, data: idea });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add idea', error: error.message });
  }
});

router.patch('/:id/ideas/:ideaId/toggle-favorite', async (req: Request, res: Response) => {
  try {
    const updated = await dataService.toggleFavoriteIdea(param(req.params.id), param(req.params.ideaId));
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle favorite', error: error.message });
  }
});

router.delete('/:id/ideas/:ideaId', async (req: Request, res: Response) => {
  try {
    const success = await dataService.deleteIdea(param(req.params.id), param(req.params.ideaId));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }
    res.json({ success: true, message: 'Idea removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete idea', error: error.message });
  }
});

export default router;
