import { IEvent, IExpense, ITask, IVendor, IIdea, IChatMessage, IAIPlan, IHealthStatus } from '../types';

const rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data.message || (data.errors ? JSON.stringify(data.errors) : errMsg);
    } catch {
      // If response was not JSON
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // HEALTH & STATUS
  async getHealth(): Promise<IHealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<IHealthStatus>(res);
  },

  // EVENTS
  async getEvents(): Promise<IEvent[]> {
    const res = await fetch(`${API_BASE}/events`);
    const data = await handleResponse<{ success: boolean; data: IEvent[] }>(res);
    return data.data;
  },

  async getEvent(id: string): Promise<IEvent> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    const data = await handleResponse<{ success: boolean; data: IEvent }>(res);
    return data.data;
  },

  async createEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const data = await handleResponse<{ success: boolean; data: IEvent }>(res);
    return data.data;
  },

  async updateEvent(id: string, updates: Partial<IEvent>): Promise<IEvent> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ success: boolean; data: IEvent }>(res);
    return data.data;
  },

  async deleteEvent(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    const data = await handleResponse<{ success: boolean }>(res);
    return data.success;
  },

  // AI OPERATIONS
  async generatePlan(eventId: string): Promise<{ plan: IAIPlan; event: IEvent }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleResponse<{ success: boolean; data: IAIPlan; event: IEvent }>(res);
    return { plan: data.data, event: data.event };
  },

  async sendChatMessage(eventId: string, message: string): Promise<IChatMessage> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await handleResponse<{ success: boolean; data: IChatMessage }>(res);
    return data.data;
  },

  async getChatHistory(eventId: string): Promise<IChatMessage[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/chat-history`);
    const data = await handleResponse<{ success: boolean; data: IChatMessage[] }>(res);
    return data.data;
  },

  async generateAIIdeas(eventId: string): Promise<IIdea[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleResponse<{ success: boolean; data: IIdea[] }>(res);
    return data.data;
  },

  // EXPENSES
  async getExpenses(eventId: string): Promise<IExpense[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses`);
    const data = await handleResponse<{ success: boolean; data: IExpense[] }>(res);
    return data.data;
  },

  async addExpense(eventId: string, expense: Partial<IExpense>): Promise<IExpense> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const data = await handleResponse<{ success: boolean; data: IExpense }>(res);
    return data.data;
  },

  async updateExpense(eventId: string, expenseId: string, updates: Partial<IExpense>): Promise<IExpense> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses/${expenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ success: boolean; data: IExpense }>(res);
    return data.data;
  },

  async deleteExpense(eventId: string, expenseId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    const data = await handleResponse<{ success: boolean }>(res);
    return data.success;
  },

  // TASKS
  async getTasks(eventId: string): Promise<ITask[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`);
    const data = await handleResponse<{ success: boolean; data: ITask[] }>(res);
    return data.data;
  },

  async addTask(eventId: string, task: Partial<ITask>): Promise<ITask> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const data = await handleResponse<{ success: boolean; data: ITask }>(res);
    return data.data;
  },

  async updateTask(eventId: string, taskId: string, updates: Partial<ITask>): Promise<ITask> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ success: boolean; data: ITask }>(res);
    return data.data;
  },

  async deleteTask(eventId: string, taskId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    const data = await handleResponse<{ success: boolean }>(res);
    return data.success;
  },

  // VENDORS
  async getVendors(eventId: string): Promise<IVendor[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`);
    const data = await handleResponse<{ success: boolean; data: IVendor[] }>(res);
    return data.data;
  },

  async addVendor(eventId: string, vendor: Partial<IVendor>): Promise<IVendor> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    const data = await handleResponse<{ success: boolean; data: IVendor }>(res);
    return data.data;
  },

  async updateVendor(eventId: string, vendorId: string, updates: Partial<IVendor>): Promise<IVendor> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors/${vendorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ success: boolean; data: IVendor }>(res);
    return data.data;
  },

  async deleteVendor(eventId: string, vendorId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors/${vendorId}`, {
      method: 'DELETE',
    });
    const data = await handleResponse<{ success: boolean }>(res);
    return data.success;
  },

  // IDEAS
  async getIdeas(eventId: string): Promise<IIdea[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas`);
    const data = await handleResponse<{ success: boolean; data: IIdea[] }>(res);
    return data.data;
  },

  async addIdea(eventId: string, idea: Partial<IIdea>): Promise<IIdea> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idea),
    });
    const data = await handleResponse<{ success: boolean; data: IIdea }>(res);
    return data.data;
  },

  async toggleFavoriteIdea(eventId: string, ideaId: string): Promise<IIdea> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas/${ideaId}/toggle-favorite`, {
      method: 'PATCH',
    });
    const data = await handleResponse<{ success: boolean; data: IIdea }>(res);
    return data.data;
  },

  async deleteIdea(eventId: string, ideaId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas/${ideaId}`, {
      method: 'DELETE',
    });
    const data = await handleResponse<{ success: boolean }>(res);
    return data.success;
  },
};
