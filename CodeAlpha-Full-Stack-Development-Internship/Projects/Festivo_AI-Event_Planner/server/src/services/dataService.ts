import fs from 'fs';
import path from 'path';
import mongoose, { Schema, Document } from 'mongoose';
import { IEvent, IExpense, ITask, IVendor, IIdea, IChatMessage, IAIPlan } from '../types/index.js';
import { initialSeedEvents } from './seedData.js';

let isMongo = false;
let mongoConnectionError: string | null = null;

// Local file storage path
const dataDir = path.resolve(process.cwd(), 'data');
const localFilePath = path.join(dataDir, 'events.json');

// In-memory cache for fast local reads/writes
let memoryEvents: IEvent[] = [];

// Initialize local store
function initLocalStore() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(localFilePath)) {
      const raw = fs.readFileSync(localFilePath, 'utf-8');
      memoryEvents = JSON.parse(raw);
    } else {
      memoryEvents = JSON.parse(JSON.stringify(initialSeedEvents));
      fs.writeFileSync(localFilePath, JSON.stringify(memoryEvents, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing local store fallback, using memory:', err);
    memoryEvents = JSON.parse(JSON.stringify(initialSeedEvents));
  }
}

function persistLocalStore() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(localFilePath, JSON.stringify(memoryEvents, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local store file:', err);
  }
}

// Mongoose Schema for MongoDB Atlas
type IEventDoc = mongoose.Document & {
  id: string;
  name: string;
  type: string;
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
  plan?: any;
  expenses: any[];
  tasks: any[];
  vendors: any[];
  ideas: any[];
  chatHistory: any[];
  createdAt?: string;
  updatedAt?: string;
};

const EventSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    guestCount: { type: Number, required: true },
    budget: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    themePreference: String,
    venuePreference: String,
    foodPreferences: String,
    dietaryRestrictions: String,
    culturalRequirements: String,
    additionalNotes: String,
    plan: Schema.Types.Mixed,
    expenses: [Schema.Types.Mixed],
    tasks: [Schema.Types.Mixed],
    vendors: [Schema.Types.Mixed],
    ideas: [Schema.Types.Mixed],
    chatHistory: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

let EventModel: mongoose.Model<IEventDoc> | null = null;

export async function initDatabase(): Promise<void> {
  initLocalStore();
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim().length > 0) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isMongo = true;
      EventModel = mongoose.model<IEventDoc>('Event', EventSchema);
      console.log('Successfully connected to MongoDB Atlas!');

      // Seed if collection is empty
      const count = await EventModel.countDocuments();
      if (count === 0) {
        console.log('Seeding initial events into MongoDB Atlas...');
        await EventModel.insertMany(initialSeedEvents);
      }
    } catch (err: any) {
      isMongo = false;
      mongoConnectionError = err.message || 'Connection failed';
      console.warn('MongoDB connection failed. Operating in local demo storage mode:', mongoConnectionError);
    }
  } else {
    isMongo = false;
    console.log('MONGODB_URI not provided. Running in high-performance local demo mode with file persistence.');
  }
}

export function getStorageStatus() {
  return {
    isMongo,
    mode: isMongo ? 'mongodb' : 'demo',
    error: mongoConnectionError,
    label: isMongo ? 'MongoDB Atlas (Connected)' : 'Demo Mode (Local Persistent Store)',
  };
}

export const dataService = {
  async getAllEvents(): Promise<IEvent[]> {
    if (isMongo && EventModel) {
      const docs = await EventModel.find().lean();
      return docs as unknown as IEvent[];
    }
    return memoryEvents;
  },

  async getEventById(id: string): Promise<IEvent | null> {
    if (isMongo && EventModel) {
      const doc = await EventModel.findOne({ id }).lean();
      return (doc as unknown as IEvent) || null;
    }
    return memoryEvents.find((e) => e.id === id) || null;
  },

  async createEvent(eventData: Omit<IEvent, 'id' | 'createdAt' | 'updatedAt' | 'expenses' | 'tasks' | 'vendors' | 'ideas' | 'chatHistory'>): Promise<IEvent> {
    const newEvent: IEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      expenses: [],
      tasks: [],
      vendors: [],
      ideas: [],
      chatHistory: [
        {
          id: `chat_init_${Date.now()}`,
          eventId: '',
          role: 'system',
          content: `Festivo AI Assistant ready for ${eventData.name}. Ask any questions, request ideas, or ask to adapt your plan!`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newEvent.chatHistory[0].eventId = newEvent.id;

    if (isMongo && EventModel) {
      await EventModel.create(newEvent);
    } else {
      memoryEvents.unshift(newEvent);
      persistLocalStore();
    }
    return newEvent;
  },

  async updateEvent(id: string, updates: Partial<IEvent>): Promise<IEvent | null> {
    const updatedAt = new Date().toISOString();
    if (isMongo && EventModel) {
      const updated = await EventModel.findOneAndUpdate(
        { id },
        { ...updates, updatedAt },
        { new: true }
      ).lean();
      return (updated as unknown as IEvent) || null;
    }
    const idx = memoryEvents.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    memoryEvents[idx] = {
      ...memoryEvents[idx],
      ...updates,
      updatedAt,
    };
    persistLocalStore();
    return memoryEvents[idx];
  },

  async deleteEvent(id: string): Promise<boolean> {
    if (isMongo && EventModel) {
      const res = await EventModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const initialLen = memoryEvents.length;
    memoryEvents = memoryEvents.filter((e) => e.id !== id);
    persistLocalStore();
    return memoryEvents.length < initialLen;
  },

  // EXPENSES
  async getExpenses(eventId: string): Promise<IExpense[]> {
    const evt = await this.getEventById(eventId);
    return evt ? evt.expenses || [] : [];
  },

  async addExpense(eventId: string, expense: Omit<IExpense, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>): Promise<IExpense | null> {
    const now = new Date().toISOString();
    const newExpense: IExpense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      createdAt: now,
      updatedAt: now,
    };

    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $push: { expenses: newExpense }, updatedAt: now },
        { new: true }
      );
      return res ? newExpense : null;
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    evt.expenses = evt.expenses || [];
    evt.expenses.push(newExpense);
    evt.updatedAt = now;
    persistLocalStore();
    return newExpense;
  },

  async updateExpense(eventId: string, expenseId: string, updates: Partial<IExpense>): Promise<IExpense | null> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const evt = await EventModel.findOne({ id: eventId });
      if (!evt) return null;
      const expIdx = evt.expenses.findIndex((e: any) => e.id === expenseId);
      if (expIdx === -1) return null;
      evt.expenses[expIdx] = { ...evt.expenses[expIdx], ...updates, updatedAt: now };
      evt.markModified('expenses');
      evt.updatedAt = now as any;
      await evt.save();
      return evt.expenses[expIdx];
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    const expIdx = (evt.expenses || []).findIndex((e) => e.id === expenseId);
    if (expIdx === -1) return null;
    evt.expenses[expIdx] = { ...evt.expenses[expIdx], ...updates, updatedAt: now };
    evt.updatedAt = now;
    persistLocalStore();
    return evt.expenses[expIdx];
  },

  async deleteExpense(eventId: string, expenseId: string): Promise<boolean> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $pull: { expenses: { id: expenseId } }, updatedAt: now }
      );
      return !!res;
    }
    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt || !evt.expenses) return false;
    const initLen = evt.expenses.length;
    evt.expenses = evt.expenses.filter((e) => e.id !== expenseId);
    evt.updatedAt = now;
    persistLocalStore();
    return evt.expenses.length < initLen;
  },

  // TASKS
  async getTasks(eventId: string): Promise<ITask[]> {
    const evt = await this.getEventById(eventId);
    return evt ? evt.tasks || [] : [];
  },

  async addTask(eventId: string, task: Omit<ITask, 'id' | 'eventId'>): Promise<ITask | null> {
    const newTask: ITask = {
      ...task,
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
    };
    const now = new Date().toISOString();

    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $push: { tasks: newTask }, updatedAt: now },
        { new: true }
      );
      return res ? newTask : null;
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    evt.tasks = evt.tasks || [];
    evt.tasks.push(newTask);
    evt.updatedAt = now;
    persistLocalStore();
    return newTask;
  },

  async updateTask(eventId: string, taskId: string, updates: Partial<ITask>): Promise<ITask | null> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const evt = await EventModel.findOne({ id: eventId });
      if (!evt) return null;
      const idx = evt.tasks.findIndex((t: any) => t.id === taskId);
      if (idx === -1) return null;
      evt.tasks[idx] = { ...evt.tasks[idx], ...updates };
      evt.markModified('tasks');
      evt.updatedAt = now as any;
      await evt.save();
      return evt.tasks[idx];
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    const idx = (evt.tasks || []).findIndex((t) => t.id === taskId);
    if (idx === -1) return null;
    evt.tasks[idx] = { ...evt.tasks[idx], ...updates };
    evt.updatedAt = now;
    persistLocalStore();
    return evt.tasks[idx];
  },

  async deleteTask(eventId: string, taskId: string): Promise<boolean> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $pull: { tasks: { id: taskId } }, updatedAt: now }
      );
      return !!res;
    }
    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt || !evt.tasks) return false;
    const initLen = evt.tasks.length;
    evt.tasks = evt.tasks.filter((t) => t.id !== taskId);
    evt.updatedAt = now;
    persistLocalStore();
    return evt.tasks.length < initLen;
  },

  // VENDORS
  async getVendors(eventId: string): Promise<IVendor[]> {
    const evt = await this.getEventById(eventId);
    return evt ? evt.vendors || [] : [];
  },

  async addVendor(eventId: string, vendor: Omit<IVendor, 'id' | 'eventId'>): Promise<IVendor | null> {
    const newVendor: IVendor = {
      ...vendor,
      id: `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
    };
    const now = new Date().toISOString();

    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $push: { vendors: newVendor }, updatedAt: now },
        { new: true }
      );
      return res ? newVendor : null;
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    evt.vendors = evt.vendors || [];
    evt.vendors.push(newVendor);
    evt.updatedAt = now;
    persistLocalStore();
    return newVendor;
  },

  async updateVendor(eventId: string, vendorId: string, updates: Partial<IVendor>): Promise<IVendor | null> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const evt = await EventModel.findOne({ id: eventId });
      if (!evt) return null;
      const idx = evt.vendors.findIndex((v: any) => v.id === vendorId);
      if (idx === -1) return null;
      evt.vendors[idx] = { ...evt.vendors[idx], ...updates };
      evt.markModified('vendors');
      evt.updatedAt = now as any;
      await evt.save();
      return evt.vendors[idx];
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    const idx = (evt.vendors || []).findIndex((v) => v.id === vendorId);
    if (idx === -1) return null;
    evt.vendors[idx] = { ...evt.vendors[idx], ...updates };
    evt.updatedAt = now;
    persistLocalStore();
    return evt.vendors[idx];
  },

  async deleteVendor(eventId: string, vendorId: string): Promise<boolean> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $pull: { vendors: { id: vendorId } }, updatedAt: now }
      );
      return !!res;
    }
    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt || !evt.vendors) return false;
    const initLen = evt.vendors.length;
    evt.vendors = evt.vendors.filter((v) => v.id !== vendorId);
    evt.updatedAt = now;
    persistLocalStore();
    return evt.vendors.length < initLen;
  },

  // IDEAS
  async getIdeas(eventId: string): Promise<IIdea[]> {
    const evt = await this.getEventById(eventId);
    return evt ? evt.ideas || [] : [];
  },

  async addIdea(eventId: string, idea: Omit<IIdea, 'id' | 'eventId'>): Promise<IIdea | null> {
    const newIdea: IIdea = {
      ...idea,
      id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
    };
    const now = new Date().toISOString();

    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $push: { ideas: newIdea }, updatedAt: now },
        { new: true }
      );
      return res ? newIdea : null;
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    evt.ideas = evt.ideas || [];
    evt.ideas.push(newIdea);
    evt.updatedAt = now;
    persistLocalStore();
    return newIdea;
  },

  async toggleFavoriteIdea(eventId: string, ideaId: string): Promise<IIdea | null> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const evt = await EventModel.findOne({ id: eventId });
      if (!evt) return null;
      const idx = evt.ideas.findIndex((i: any) => i.id === ideaId);
      if (idx === -1) return null;
      evt.ideas[idx].isFavorite = !evt.ideas[idx].isFavorite;
      evt.markModified('ideas');
      evt.updatedAt = now as any;
      await evt.save();
      return evt.ideas[idx];
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    const idx = (evt.ideas || []).findIndex((i) => i.id === ideaId);
    if (idx === -1) return null;
    evt.ideas[idx].isFavorite = !evt.ideas[idx].isFavorite;
    evt.updatedAt = now;
    persistLocalStore();
    return evt.ideas[idx];
  },

  async deleteIdea(eventId: string, ideaId: string): Promise<boolean> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { $pull: { ideas: { id: ideaId } }, updatedAt: now }
      );
      return !!res;
    }
    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt || !evt.ideas) return false;
    const initLen = evt.ideas.length;
    evt.ideas = evt.ideas.filter((i) => i.id !== ideaId);
    evt.updatedAt = now;
    persistLocalStore();
    return evt.ideas.length < initLen;
  },

  // CHAT HISTORY
  async getChatHistory(eventId: string): Promise<IChatMessage[]> {
    const evt = await this.getEventById(eventId);
    return evt ? evt.chatHistory || [] : [];
  },

  async addChatMessage(eventId: string, message: Omit<IChatMessage, 'id' | 'eventId' | 'timestamp'>): Promise<IChatMessage | null> {
    const newMsg: IChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      timestamp: new Date().toISOString(),
    };
    const now = new Date().toISOString();

    if (isMongo && EventModel) {
      await EventModel.findOneAndUpdate(
        { id: eventId },
        { $push: { chatHistory: newMsg }, updatedAt: now }
      );
      return newMsg;
    }

    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return null;
    evt.chatHistory = evt.chatHistory || [];
    evt.chatHistory.push(newMsg);
    evt.updatedAt = now;
    persistLocalStore();
    return newMsg;
  },

  // AI PLAN
  async saveAIPlan(eventId: string, plan: IAIPlan): Promise<boolean> {
    const now = new Date().toISOString();
    if (isMongo && EventModel) {
      const res = await EventModel.findOneAndUpdate(
        { id: eventId },
        { plan, updatedAt: now }
      );
      return !!res;
    }
    const evt = memoryEvents.find((e) => e.id === eventId);
    if (!evt) return false;
    evt.plan = plan;
    evt.updatedAt = now;
    persistLocalStore();
    return true;
  },
};
