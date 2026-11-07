import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  Sparkles,
  Star,
  Plus,
  Trash2,
  Filter,
  Check,
  ArrowRight,
  TrendingUp,
  X,
  Tag,
  DollarSign,
  Heart,
} from 'lucide-react';
import { api } from '../lib/api';
import { IEvent, IIdea } from '../types';
import { triggerCelebrationConfetti } from '../lib/utils';
import { EventSubNav } from '../components/EventSubNav';
import { ExportModal } from '../components/ExportModal';

export const IdeasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [ideas, setIdeas] = useState<IIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // New Custom Idea Modal
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [ideaForm, setIdeaForm] = useState({
    title: '',
    description: '',
    category: 'Guest Experience',
    estimatedCostRange: '',
    whyItFits: '',
    implementationSuggestions: '',
  });

  useEffect(() => {
    if (id) {
      loadIdeas(id);
    }
  }, [id]);

  const loadIdeas = async (eventId: string) => {
    try {
      setLoading(true);
      const evt = await api.getEvent(eventId);
      setEvent(evt);
      setIdeas(evt.ideas || []);
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (idea: IIdea) => {
    if (!event) return;
    try {
      setIdeas((prev) =>
        prev.map((i) => (i.id === idea.id ? { ...i, isFavorite: !i.isFavorite } : i))
      );
      await api.toggleFavoriteIdea(event.id, idea.id);
      if (!idea.isFavorite) {
        triggerCelebrationConfetti();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      loadIdeas(event.id);
    }
  };

  const handleGenerateAIIdeas = async () => {
    if (!event) return;
    try {
      setIsGenerating(true);
      await api.generateAIIdeas(event.id);
      loadIdeas(event.id);
      triggerCelebrationConfetti();
    } catch (err) {
      console.error('Failed to generate AI ideas:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCustomIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !ideaForm.title.trim()) return;

    try {
      const suggestionsArray = ideaForm.implementationSuggestions
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await api.addIdea(event.id, {
        title: ideaForm.title,
        description: ideaForm.description,
        category: ideaForm.category,
        estimatedCostRange: ideaForm.estimatedCostRange,
        whyItFits: ideaForm.whyItFits,
        implementationSuggestions: suggestionsArray,
        isFavorite: true,
      });

      setIsIdeaModalOpen(false);
      setIdeaForm({
        title: '',
        description: '',
        category: 'Guest Experience',
        estimatedCostRange: '',
        whyItFits: '',
        implementationSuggestions: '',
      });
      loadIdeas(event.id);
      triggerCelebrationConfetti();
    } catch (err) {
      console.error('Failed to save idea:', err);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!event) return;
    try {
      await api.deleteIdea(event.id, ideaId);
      loadIdeas(event.id);
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  const handleAskAIToAdapt = (idea: IIdea) => {
    if (!event) return;
    navigate(`/events/${event.id}/ai-planner?prompt=${encodeURIComponent(`How can we adapt the "${idea.title}" idea specifically within our budget constraints?`)}`);
  };

  if (loading || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-festivo-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-lg text-festivo-plum-950 font-medium">Curating celebration concepts...</p>
        <p className="text-xs text-festivo-plum-500 mt-1">Retrieving bespoke inspiration, keepsakes, and guest experience ideas</p>
      </div>
    );
  }

  const filteredIdeas = ideas.filter((item) => {
    if (showFavoritesOnly && !item.isFavorite) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(ideas.map((i) => i.category))).filter(Boolean);

  return (
    <div className="min-h-screen bg-festivo-ivory/30 pb-20">
      <EventSubNav event={event} onOpenExport={() => setShowExportModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & AI Generate Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-coral">
                Inspiration & Signature Moments
              </span>
              <span className="text-[11px] font-medium text-festivo-plum-500">
                • {event.name}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1.5 tracking-tight">
              Personalized Celebration Ideas
            </h1>
            <p className="text-xs sm:text-sm text-festivo-plum-600 mt-1 max-w-2xl leading-relaxed">
              Elevated experiential concepts, interactive entertainment, unique culinary stations, and branded keepsakes tailored to {event.name}.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            <button
              onClick={() => setIsIdeaModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-festivo-plum-950 border border-festivo-plum-200 hover:bg-festivo-cream transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-festivo-coral-500" />
              <span>Add Custom Idea</span>
            </button>

            <button
              onClick={handleGenerateAIIdeas}
              disabled={isGenerating}
              className="bg-festivo-coral-500 hover:bg-festivo-coral-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate AI Concepts'}</span>
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-festivo-plum-100 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                showFavoritesOnly
                  ? 'bg-festivo-coral-500 text-white shadow-xs'
                  : 'bg-festivo-ivory text-festivo-plum-800 hover:bg-festivo-cream border border-festivo-plum-200/60'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white text-white' : 'fill-festivo-gold-500 text-festivo-gold-500'}`} />
              <span>Starred Concepts</span>
            </button>

            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-festivo-plum-950 text-white shadow-xs'
                  : 'bg-festivo-ivory text-festivo-plum-800 hover:bg-festivo-cream border border-festivo-plum-200/60'
              }`}
            >
              All Categories ({ideas.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-festivo-plum-950 text-white shadow-xs'
                    : 'bg-festivo-ivory text-festivo-plum-800 hover:bg-festivo-cream border border-festivo-plum-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-festivo-plum-500 font-medium px-2">
            Showing {filteredIdeas.length} curated concepts
          </span>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.length === 0 ? (
            <div className="col-span-full festivo-card p-14 bg-white text-center space-y-3">
              <Lightbulb className="w-10 h-10 text-festivo-coral-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-festivo-plum-950">No Ideas in This Category</h3>
              <p className="text-xs text-festivo-plum-600 max-w-md mx-auto">
                No ideas match your active filter. Use Gemini to generate bespoke celebration moments tailored to {event.name}.
              </p>
              <button
                onClick={handleGenerateAIIdeas}
                className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs inline-flex items-center space-x-2 mt-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Concepts Now</span>
              </button>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className={`festivo-card p-6 bg-white flex flex-col justify-between space-y-4 hover:shadow-card hover:-translate-y-1 transition-all group ${
                  idea.isFavorite ? 'border-festivo-gold-300/80 ring-1 ring-festivo-gold-300/50 bg-gradient-to-b from-white to-festivo-gold-50/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-festivo-plum-100/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-festivo-plum-50 text-festivo-plum-900 border border-festivo-plum-200/60">
                      {idea.category}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(idea)}
                      className="p-1.5 rounded-full hover:bg-festivo-cream transition-colors cursor-pointer"
                      title={idea.isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          idea.isFavorite
                            ? 'text-festivo-gold-500 fill-festivo-gold-500'
                            : 'text-festivo-plum-300 hover:text-festivo-gold-500'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mt-2.5 group-hover:text-festivo-coral-600 transition-colors">
                    {idea.title}
                  </h3>

                  <p className="text-xs text-festivo-plum-700 leading-relaxed mt-2">
                    {idea.description}
                  </p>

                  {idea.estimatedCostRange && (
                    <div className="mt-3 text-xs text-festivo-coral-600 font-semibold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Est. Range: {idea.estimatedCostRange}</span>
                    </div>
                  )}

                  {idea.whyItFits && (
                    <div className="mt-3.5 p-3 rounded-xl bg-festivo-ivory/60 border border-festivo-plum-100/80 text-[11px] text-festivo-plum-800 leading-relaxed">
                      <span className="font-bold text-festivo-plum-950 block text-[10px] uppercase tracking-wider mb-0.5">
                        Why It Fits This Event:
                      </span>
                      {idea.whyItFits}
                    </div>
                  )}

                  {idea.implementationSuggestions && idea.implementationSuggestions.length > 0 && (
                    <div className="mt-3.5 text-[11px] space-y-1.5">
                      <span className="font-bold text-festivo-plum-950 block text-[10px] uppercase tracking-wider">
                        Implementation Tips:
                      </span>
                      <ul className="space-y-1 text-festivo-plum-700">
                        {idea.implementationSuggestions.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-festivo-coral-500 mt-1.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3.5 border-t border-festivo-plum-100/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleAskAIToAdapt(idea)}
                    className="text-festivo-coral-600 hover:text-festivo-coral-700 font-semibold flex items-center space-x-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>Adapt to Budget in Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="p-1.5 rounded-lg text-festivo-plum-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove Idea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Custom Idea Modal */}
      {isIdeaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-festivo-plum-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-floating border border-festivo-plum-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-festivo-plum-100">
              <div>
                <span className="badge-coral text-[10px]">Creative Studio</span>
                <h3 className="font-serif text-xl font-bold text-festivo-plum-950 mt-1">
                  Add Custom Celebration Idea
                </h3>
              </div>
              <button
                onClick={() => setIsIdeaModalOpen(false)}
                className="p-2 rounded-xl text-festivo-plum-400 hover:text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomIdea} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-festivo-plum-900 mb-1">
                  Idea Title <span className="text-festivo-coral-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floating Lantern Lighting & Wishes Ceremony"
                  value={ideaForm.title}
                  onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Category</label>
                  <select
                    value={ideaForm.category}
                    onChange={(e) => setIdeaForm({ ...ideaForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  >
                    <option value="Guest Experience">Guest Experience</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Decorations">Decorations</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Photography">Photography</option>
                    <option value="Favors">Favors & Keepsakes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Est. Cost Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹15,000 - ₹20,000"
                    value={ideaForm.estimatedCostRange}
                    onChange={(e) => setIdeaForm({ ...ideaForm, estimatedCostRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-900 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain the experience, aesthetic, or guest impact..."
                  value={ideaForm.description}
                  onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-900 mb-1">Why It Fits This Event</label>
                <input
                  type="text"
                  placeholder="e.g. Creates a magical visual and emotionally engages all generations"
                  value={ideaForm.whyItFits}
                  onChange={(e) => setIdeaForm({ ...ideaForm, whyItFits: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-900 mb-1">Implementation Tips (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="Pre-pack sparkler wands with custom matches&#10;Coordinate with sound engineer for musical crescendo"
                  value={ideaForm.implementationSuggestions}
                  onChange={(e) => setIdeaForm({ ...ideaForm, implementationSuggestions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-festivo-plum-100">
                <button
                  type="button"
                  onClick={() => setIsIdeaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs hover:shadow-sm transition-all"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExportModal
        isOpen={showExportModal}
        event={event}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};
