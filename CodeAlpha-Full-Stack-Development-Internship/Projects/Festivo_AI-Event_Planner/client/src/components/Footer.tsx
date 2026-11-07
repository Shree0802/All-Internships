import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-festivo-plum-950 text-white pt-12 pb-8 border-t border-festivo-plum-900 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-festivo-plum-850">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-festivo-coral-500 to-festivo-plum-700 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Festivo AI
              </span>
            </div>
            <p className="text-sm font-medium text-festivo-coral-300">
              Every Celebration, Beautifully Planned.
            </p>
            <p className="text-xs text-festivo-plum-300 leading-relaxed max-w-md">
              A generative AI-powered planning assistant designed to organize weddings, milestone birthdays, anniversaries, and community celebrations with dynamic budgets, timelines, vendor pipelines, and personalized recommendations.
            </p>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-festivo-plum-900 text-festivo-coral-200 border border-festivo-plum-800">
                Built for the Prompt Wars Competition
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-bold text-festivo-sand mb-3">Planning Features</h4>
            <ul className="space-y-2 text-xs text-festivo-plum-300">
              <li><Link to="/events/new" className="hover:text-festivo-coral-400 transition-colors">AI Event Creator</Link></li>
              <li><Link to="/dashboard" className="hover:text-festivo-coral-400 transition-colors">Event Dashboard</Link></li>
              <li><Link to="/events/evt_wedding_royal/ai-planner" className="hover:text-festivo-coral-400 transition-colors">AI 13-Point Engine</Link></li>
              <li><Link to="/events/evt_wedding_royal/budget" className="hover:text-festivo-coral-400 transition-colors">Smart Budget Tracker</Link></li>
              <li><Link to="/events/evt_wedding_royal/timeline" className="hover:text-festivo-coral-400 transition-colors">Timeline & Tasks</Link></li>
            </ul>
          </div>

          {/* Technology & Architecture */}
          <div>
            <h4 className="font-serif text-sm font-bold text-festivo-sand mb-3">Technology Stack</h4>
            <ul className="space-y-2 text-xs text-festivo-plum-300">
              <li>React 18 & TypeScript (Vite)</li>
              <li>Tailwind CSS & Lucide Icons</li>
              <li>Node.js, Express & Zod</li>
              <li>Google Gemini 2.5 Generative AI</li>
              <li>MongoDB Atlas / Local Persistence</li>
              <li>Recharts Data Visualizations</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-festivo-plum-400 gap-2">
          <div>
            &copy; {new Date().getFullYear()} Festivo AI. All rights reserved. Open source under MIT License.
          </div>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-festivo-coral-500 fill-festivo-coral-500 inline" />
            <span>for seamless celebration management.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
