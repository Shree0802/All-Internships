import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewEventPage } from './pages/NewEventPage';
import { EventOverviewPage } from './pages/EventOverviewPage';
import { AIPlannerPage } from './pages/AIPlannerPage';
import { BudgetPage } from './pages/BudgetPage';
import { TimelinePage } from './pages/TimelinePage';
import { VendorsPage } from './pages/VendorsPage';
import { IdeasPage } from './pages/IdeasPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-festivo-ivory flex flex-col selection:bg-festivo-coral-100 selection:text-festivo-plum-900">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events/new" element={<NewEventPage />} />
            <Route path="/events/:id" element={<EventOverviewPage />} />
            <Route path="/events/:id/ai-planner" element={<AIPlannerPage />} />
            <Route path="/events/:id/budget" element={<BudgetPage />} />
            <Route path="/events/:id/timeline" element={<TimelinePage />} />
            <Route path="/events/:id/vendors" element={<VendorsPage />} />
            <Route path="/events/:id/ideas" element={<IdeasPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
