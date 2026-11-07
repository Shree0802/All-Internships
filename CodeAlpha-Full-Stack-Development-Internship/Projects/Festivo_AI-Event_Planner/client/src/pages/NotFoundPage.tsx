import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="festivo-card max-w-md w-full p-8 text-center bg-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-festivo-coral-50 text-festivo-coral-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-festivo-coral-500">
          Page Not Found
        </span>
        <h1 className="font-serif text-3xl font-bold text-festivo-plum-950">
          Celebration Lost in Space
        </h1>
        <p className="text-xs text-festivo-plum-600 leading-relaxed">
          The page or celebration dossier you are seeking does not exist or has been relocated.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-festivo-cream hover:bg-festivo-sand/60 text-festivo-plum-900 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
