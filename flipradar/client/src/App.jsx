import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import UpgradeModal from './components/UpgradeModal';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import SupplierFinder from './pages/SupplierFinder';
import ProfitCalculator from './pages/ProfitCalculator';
import CompetitionAnalyser from './pages/CompetitionAnalyser';

export default function App() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <BrowserRouter>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <Navbar onUpgradeClick={() => setShowUpgrade(true)} />

      {/* offset for fixed navbar: 56px desktop, ~88px mobile (two rows) */}
      <main className="pt-14 md:pt-14 min-h-screen bg-navy-900 bg-grid-pattern bg-grid-pattern">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/supplier" element={<SupplierFinder />} />
          <Route path="/calculator" element={<ProfitCalculator />} />
          <Route path="/competition" element={<CompetitionAnalyser />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
