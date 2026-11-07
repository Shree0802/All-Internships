import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import { IEvent, ITask, TaskPriority, TaskStatus } from '../types';
import { formatDate, getDaysUntil, triggerCelebrationConfetti } from '../lib/utils';
import { EventSubNav } from '../components/EventSubNav';
import { ExportModal } from '../components/ExportModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const TimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  // Modal State for Add / Edit Task
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    category: string;
    notes: string;
  }>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    category: 'General',
    notes: '',
  });

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTasks(id);
    }
  }, [id]);

  const loadTasks = async (eventId: string) => {
    try {
      setLoading(true);
      const evt = await api.getEvent(eventId);
      setEvent(evt);
      setTasks(evt.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (task: ITask) => {
    if (!event) return;
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      await api.updateTask(event.id, task.id, { status: newStatus });
      if (newStatus === 'completed') {
        triggerCelebrationConfetti();
      }
    } catch (err) {
      console.error('Failed to toggle task status:', err);
      loadTasks(event.id);
    }
  };

  const handleOpenAdd = () => {
    setEditingTaskId(null);
    setTaskForm({
      title: '',
      description: '',
      dueDate: event?.date || '',
      priority: 'medium',
      status: 'pending',
      category: 'Planning',
      notes: '',
    });
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task: ITask) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority,
      status: task.status,
      category: task.category || 'General',
      notes: task.notes || '',
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !taskForm.title.trim()) return;

    try {
      if (editingTaskId) {
        await api.updateTask(event.id, editingTaskId, taskForm);
      } else {
        await api.addTask(event.id, taskForm);
      }
      setIsTaskModalOpen(false);
      loadTasks(event.id);
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!event || !deleteTaskId) return;
    try {
      await api.deleteTask(event.id, deleteTaskId);
      setDeleteTaskId(null);
      loadTasks(event.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (loading || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-3 border-festivo-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-festivo-plum-950">Loading Timeline Studio</h3>
        <p className="text-xs text-festivo-plum-600 mt-1">Ordering milestones chronologically...</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
  });

  const filteredTasks = sortedTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="animate-in fade-in duration-200">
      <EventSubNav event={event} onOpenExport={() => setShowExportModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-festivo-plum-100 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-festivo-coral-500">
              Execution Roadmap
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1">
              Timeline & Task Management
            </h1>
            <p className="text-xs sm:text-sm text-festivo-plum-600 mt-0.5">
              Chronological milestones, priority filters, overdue alerts, and minute-by-minute execution.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft hover:shadow-glow transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone Task</span>
          </button>
        </div>

        {/* Progress Bar & KPI Strip */}
        <div className="festivo-card p-6 bg-white space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-festivo-plum-400 tracking-wider">
                Readiness Gauge
              </span>
              <div className="font-serif text-2xl font-bold text-festivo-plum-950 mt-0.5 tabular-nums">
                {progressPercent}% Completed ({completedCount} of {tasks.length} resolved)
              </div>
            </div>

            <div className="flex items-center space-x-2.5 text-xs">
              {overdueCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold flex items-center space-x-1.5 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{overdueCount} Overdue</span>
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {tasks.length - completedCount} Action Items Left
              </span>
            </div>
          </div>

          <div className="w-full bg-festivo-cream h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filters Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-festivo-plum-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-festivo-plum-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>
            {['all', 'pending', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-festivo-plum-900 text-white shadow-xs'
                    : 'bg-festivo-cream text-festivo-plum-800 hover:bg-festivo-sand/60'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-festivo-plum-400 uppercase font-bold text-[10px]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-festivo-plum-200 text-xs font-semibold text-festivo-plum-900 bg-festivo-cream/60 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Chronological Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="festivo-card p-12 bg-white text-center text-xs text-festivo-plum-500 shadow-card">
              No tasks match your selected filter criteria.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue =
                task.status !== 'completed' &&
                task.dueDate &&
                new Date(task.dueDate).setHours(0, 0, 0, 0) < today.getTime();

              return (
                <div
                  key={task.id}
                  className={`festivo-card p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-card ${
                    task.status === 'completed' ? 'opacity-65 bg-festivo-ivory/50' : 'hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Completion Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      className="mt-0.5 text-festivo-plum-400 hover:text-festivo-coral-500 transition-colors shrink-0"
                      title={task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-festivo-plum-300 hover:text-festivo-coral-500" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'high'
                            ? 'bg-festivo-coral-100 text-festivo-coral-800'
                            : 'bg-festivo-cream text-festivo-plum-700'
                        }`}>
                          {task.priority}
                        </span>

                        {task.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-festivo-plum-50 text-festivo-plum-700 font-semibold">
                            {task.category}
                          </span>
                        )}

                        {isOverdue && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-600 text-white font-bold animate-pulse">
                            Overdue
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-bold ${
                        task.status === 'completed' ? 'line-through text-festivo-plum-400' : 'text-festivo-plum-950'
                      }`}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-festivo-plum-600 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {task.notes && (
                        <p className="text-[11px] text-festivo-coral-700 mt-1 italic">
                          Note: {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Due Date & Action Icons */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-festivo-plum-100/70">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-festivo-plum-400 uppercase font-bold tracking-wider">Target Date</div>
                      <div className="text-xs font-bold text-festivo-plum-900 tabular-nums">
                        {formatDate(task.dueDate)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 rounded-lg text-festivo-plum-600 hover:text-festivo-plum-950 hover:bg-festivo-cream transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTaskId(task.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Add / Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-festivo-plum-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-floating border border-festivo-plum-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-festivo-plum-100">
              <h3 className="font-serif text-xl font-bold text-festivo-plum-950">
                {editingTaskId ? 'Edit Milestone Task' : 'Add Milestone Task'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 rounded-xl text-festivo-plum-400 hover:text-festivo-plum-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-festivo-plum-800 mb-1">Task Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule food tasting session with chef"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-festivo-plum-800 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-800 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-festivo-plum-800 mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-800 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Catering, Decor, AV"
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or deliverables..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
                >
                  {editingTaskId ? 'Save Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTaskId}
        title="Delete Milestone Task"
        message="Are you sure you want to remove this milestone task? This will update your completion percentage."
        confirmLabel="Yes, Delete Task"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTaskId(null)}
      />

      <ExportModal
        isOpen={showExportModal}
        event={event}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};
