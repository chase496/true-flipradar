import { NavLink } from 'react-router-dom';
import { Radar, LayoutDashboard, Search, Package, Calculator, BarChart2, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getClientId } from '../utils/clientId';

const NAV_LINKS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scanner', icon: Search, label: 'Scanner' },
  { to: '/supplier', icon: Package, label: 'Supplier' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/competition', icon: BarChart2, label: 'Competition' },
];

export default function Navbar({ onUpgradeClick }) {
  const [usage, setUsage] = useState({ used: 0, limit: 5, remaining: 5 });

  useEffect(() => {
    const clientId = getClientId();
    fetch('/api/usage', {
      headers: { 'x-client-id': clientId },
    })
      .then((r) => r.json())
      .then((data) => setUsage(data))
      .catch(() => {});
  }, []);

  const usedPercent = Math.min(100, (usage.used / usage.limit) * 100);
  const exhausted = usage.remaining === 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-navy-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Radar className="w-4 h-4 text-green-500" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            Flip<span className="text-gradient">Radar</span>
          </span>
        </NavLink>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'text-green-500 bg-green-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usage pill + upgrade */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-navy-800 border border-border rounded-lg px-3 py-1.5">
            <div className="relative w-16 h-1.5 bg-navy-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                  exhausted ? 'bg-red-400' : 'bg-green-500'
                }`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <span className={`font-mono text-xs font-semibold ${exhausted ? 'text-red-400' : 'text-slate-300'}`}>
              {usage.used}/{usage.limit}
            </span>
          </div>

          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/60 text-green-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          >
            <Zap className="w-3 h-3" />
            Pro
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex md:hidden items-center gap-0.5 px-3 pb-2 overflow-x-auto">
        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'text-green-500 bg-green-500/10'
                  : 'text-slate-500 hover:text-white'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
