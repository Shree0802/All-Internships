import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart as PieIcon,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Filter,
  Check,
  X,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../lib/api';
import { IEvent, IExpense, ExpenseCategory } from '../types';
import { formatCurrency, triggerCelebrationConfetti } from '../lib/utils';
import { EventSubNav } from '../components/EventSubNav';
import { ExportModal } from '../components/ExportModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const BudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  // Modal State for Add / Edit Expense
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<{
    category: ExpenseCategory;
    description: string;
    estimatedAmount: number;
    actualAmount: number;
    notes: string;
  }>({
    category: 'venue',
    description: '',
    estimatedAmount: 0,
    actualAmount: 0,
    notes: '',
  });

  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBudget(id);
    }
  }, [id]);

  const loadBudget = async (eventId: string) => {
    try {
      setLoading(true);
      const evt = await api.getEvent(eventId);
      setEvent(evt);
      setExpenses(evt.expenses || []);
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingExpenseId(null);
    setExpenseForm({
      category: 'venue',
      description: '',
      estimatedAmount: 25000,
      actualAmount: 0,
      notes: '',
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenEdit = (exp: IExpense) => {
    setEditingExpenseId(exp.id);
    setExpenseForm({
      category: exp.category,
      description: exp.description,
      estimatedAmount: exp.estimatedAmount,
      actualAmount: exp.actualAmount,
      notes: exp.notes || '',
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (expenseForm.estimatedAmount < 0 || expenseForm.actualAmount < 0) {
      alert('Amounts must be non-negative.');
      return;
    }

    try {
      if (editingExpenseId) {
        await api.updateExpense(event.id, editingExpenseId, expenseForm);
      } else {
        await api.addExpense(event.id, expenseForm);
      }
      setIsExpenseModalOpen(false);
      loadBudget(event.id);
      triggerCelebrationConfetti();
    } catch (err) {
      console.error('Failed to save expense:', err);
    }
  };

  const handleDeleteExpense = async () => {
    if (!event || !deleteExpenseId) return;
    try {
      await api.deleteExpense(event.id, deleteExpenseId);
      setDeleteExpenseId(null);
      loadBudget(event.id);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  if (loading || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-3 border-festivo-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-festivo-plum-950">Loading Financial Ledger</h3>
        <p className="text-xs text-festivo-plum-600 mt-1">Calculating budget variances and category allocations...</p>
      </div>
    );
  }

  const totalBudget = event.budget || 0;
  const totalEstimated = expenses.reduce((sum, e) => sum + (e.estimatedAmount || 0), 0);
  const totalActual = expenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const remainingBudget = totalBudget - totalActual;
  const utilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const totalVariance = totalActual - totalEstimated;
  const isOverBudget = remainingBudget < 0;

  // Category breakdown for charts
  const categoryGroups: { [key: string]: { estimated: number; actual: number } } = {};
  expenses.forEach((e) => {
    if (!categoryGroups[e.category]) {
      categoryGroups[e.category] = { estimated: 0, actual: 0 };
    }
    categoryGroups[e.category].estimated += e.estimatedAmount || 0;
    categoryGroups[e.category].actual += e.actualAmount || 0;
  });

  const chartData = Object.keys(categoryGroups).map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
    estimated: categoryGroups[cat].estimated,
    actual: categoryGroups[cat].actual,
  }));

  const pieColors = ['#BA6595', '#F25835', '#DFCA71', '#3D172E', '#DF3C18', '#693352', '#A78C2C', '#230A19', '#962913'];

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  return (
    <div className="animate-in fade-in duration-200">
      <EventSubNav event={event} onOpenExport={() => setShowExportModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Overview & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-festivo-plum-100 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-festivo-coral-500">
              Interactive Financial Control
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1">
              Celebration Budget & Expense Studio
            </h1>
            <p className="text-xs sm:text-sm text-festivo-plum-600 mt-0.5">
              Compare estimated vs actual spending, analyze category allocations, and track variance in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              to={`/events/${event.id}/ai-planner`}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-festivo-plum-900 border border-festivo-plum-200 shadow-xs hover:bg-festivo-cream transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-festivo-coral-500" />
              <span>AI Cost Saving Tips</span>
            </Link>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft hover:shadow-glow transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Warning banner if spending exceeds budget */}
        {isOverBudget && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center space-x-3.5 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Budget Overrun Alert: </span>
              Your total actual expenses exceed the planned budget by{' '}
              <strong className="text-red-700 tabular-nums">{formatCurrency(Math.abs(remainingBudget), event.currency)}</strong>.
              Consider reviewing discretionary line items or applying AI savings suggestions.
            </div>
          </div>
        )}

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="festivo-card p-5 bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Planned Envelope
            </span>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 mt-1 tabular-nums">
              {formatCurrency(totalBudget, event.currency)}
            </div>
            <span className="text-[11px] text-festivo-plum-500 font-medium">Initial configured target</span>
          </div>

          <div className="festivo-card p-5 bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Actual Spending
            </span>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 mt-1 tabular-nums">
              {formatCurrency(totalActual, event.currency)}
            </div>
            <span className="text-[11px] text-festivo-plum-600">
              Estimated: <strong className="tabular-nums text-festivo-plum-800">{formatCurrency(totalEstimated, event.currency)}</strong>
            </span>
          </div>

          <div className="festivo-card p-5 bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Remaining Buffer
            </span>
            <div className={`font-serif text-2xl font-bold mt-1 tabular-nums ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
              {formatCurrency(remainingBudget, event.currency)}
            </div>
            <span className="text-[11px] text-festivo-plum-600 font-medium">
              {isOverBudget ? 'Deficit warning' : 'Available celebration buffer'}
            </span>
          </div>

          <div className="festivo-card p-5 bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Budget Utilization
            </span>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 mt-1 tabular-nums">
              {Math.round(utilization)}%
            </div>
            <div className="text-[11px] text-festivo-plum-600 flex items-center space-x-1">
              <span>Variance:</span>
              <strong className={`tabular-nums ${totalVariance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {totalVariance > 0 ? `+${formatCurrency(totalVariance, event.currency)}` : formatCurrency(totalVariance, event.currency)}
              </strong>
            </div>
          </div>
        </div>

        {/* Visual Charts: Recharts Category Comparison & Pie Allocation */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Estimated vs Actual */}
            <div className="festivo-card p-6 bg-white space-y-4 shadow-card">
              <div className="flex items-center justify-between pb-2 border-b border-festivo-plum-100">
                <h3 className="font-serif text-base font-bold text-festivo-plum-950">
                  Estimated vs. Actual by Category
                </h3>
                <span className="text-[10px] uppercase font-bold text-festivo-plum-400">Recharts Analytic</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#693352' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#693352' }} />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), event.currency)}
                      contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E9E1D2', fontSize: '11px', boxShadow: '0 8px 24px -4px rgba(35,10,25,0.08)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="estimated" name="Estimated" fill="#BA6595" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Actual" fill="#F25835" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Category Allocations */}
            <div className="festivo-card p-6 bg-white space-y-4 shadow-card">
              <div className="flex items-center justify-between pb-2 border-b border-festivo-plum-100">
                <h3 className="font-serif text-base font-bold text-festivo-plum-950">
                  Category Distribution
                </h3>
                <span className="text-[10px] uppercase font-bold text-festivo-plum-400">Share of Total</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="estimated"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), event.currency)}
                      contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E9E1D2', fontSize: '11px', boxShadow: '0 8px 24px -4px rgba(35,10,25,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Table & Management */}
        <div className="festivo-card p-6 bg-white space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-festivo-plum-100 gap-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-festivo-coral-500" />
              <h3 className="font-serif text-lg font-bold text-festivo-plum-950">
                All Recorded Expenses ({filteredExpenses.length})
              </h3>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-festivo-plum-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-festivo-plum-200 text-xs font-semibold text-festivo-plum-900 bg-festivo-cream/60 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="venue">Venue</option>
                <option value="catering">Catering</option>
                <option value="decoration">Decoration</option>
                <option value="photography">Photography</option>
                <option value="entertainment">Entertainment</option>
                <option value="invitations">Invitations</option>
                <option value="transportation">Transportation</option>
                <option value="outfits_styling">Outfits & Styling</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-xs text-festivo-plum-500">
              No expenses recorded in this category yet. Click "Record Expense" to track your first cost.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-festivo-plum-200/80 text-festivo-plum-600 font-bold bg-festivo-cream/60">
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Description</th>
                    <th className="py-3 px-3.5 text-right">Estimated Cost</th>
                    <th className="py-3 px-3.5 text-right">Actual Cost</th>
                    <th className="py-3 px-3.5 text-right">Variance</th>
                    <th className="py-3 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-festivo-plum-100">
                  {filteredExpenses.map((exp) => {
                    const variance = exp.actualAmount - exp.estimatedAmount;
                    return (
                      <tr key={exp.id} className="hover:bg-festivo-cream/40 transition-colors">
                        <td className="py-3 px-3.5 capitalize font-bold text-festivo-plum-950">
                          {exp.category.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-3.5 text-festivo-plum-800">
                          <div className="font-medium">{exp.description}</div>
                          {exp.notes && (
                            <div className="text-[10px] text-festivo-plum-500 mt-0.5">{exp.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right text-festivo-plum-700 tabular-nums">
                          {formatCurrency(exp.estimatedAmount, event.currency)}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-festivo-plum-950 tabular-nums">
                          {exp.actualAmount > 0 ? (
                            formatCurrency(exp.actualAmount, event.currency)
                          ) : (
                            <span className="text-festivo-plum-400 italic font-normal">Pending</span>
                          )}
                        </td>
                        <td className={`py-3 px-3.5 text-right font-bold tabular-nums ${
                          variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-700' : 'text-festivo-plum-400'
                        }`}>
                          {variance > 0 ? `+${formatCurrency(variance, event.currency)}` : formatCurrency(variance, event.currency)}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(exp)}
                              className="p-1.5 rounded-lg text-festivo-plum-600 hover:text-festivo-plum-950 hover:bg-festivo-cream transition-colors"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteExpenseId(exp.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-festivo-plum-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-floating border border-festivo-plum-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-festivo-plum-100">
              <h3 className="font-serif text-xl font-bold text-festivo-plum-950">
                {editingExpenseId ? 'Edit Expense Item' : 'Add New Expense Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-xl text-festivo-plum-400 hover:text-festivo-plum-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-festivo-plum-800 mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                >
                  <option value="venue">Venue</option>
                  <option value="catering">Catering</option>
                  <option value="decoration">Decoration</option>
                  <option value="photography">Photography</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="invitations">Invitations</option>
                  <option value="transportation">Transportation</option>
                  <option value="outfits_styling">Outfits & Styling</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-800 mb-1">Description <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage floral arches & lighting canopy"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-festivo-plum-800 mb-1">Estimated Cost ({event.currency})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={expenseForm.estimatedAmount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, estimatedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-800 mb-1">Actual Paid / Spent ({event.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={expenseForm.actualAmount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, actualAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-800 mb-1">Notes / Invoice Ref</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50% advance cleared on booking; balance due on checkout"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 bg-festivo-ivory/50 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
                >
                  {editingExpenseId ? 'Save Updates' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteExpenseId}
        title="Delete Expense Item"
        message="Are you sure you want to remove this expense item? This will update your total spent and remaining budget calculations immediately."
        confirmLabel="Yes, Delete Expense"
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteExpenseId(null)}
      />

      <ExportModal
        isOpen={showExportModal}
        event={event}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};
