import { X, Zap, Check } from 'lucide-react';

const FREE_FEATURES = [
  '5 product scans per day',
  'Winning Product Feed',
  'Profit Calculator',
  'Basic supplier tips',
];

const PRO_FEATURES = [
  'Unlimited product scans',
  'Winning Product Feed',
  'Profit Calculator',
  'Full supplier playbooks',
  'Competition Analyser',
  'Early trend alerts',
  'Export to CSV',
  'Priority AI responses',
];

export default function UpgradeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">You've hit your daily limit</h2>
            <p className="text-slate-400 text-sm">Upgrade to FlipRadar Pro for unlimited scans</p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Free */}
          <div className="bg-navy-800 rounded-xl p-4 border border-border">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Free</p>
            <p className="text-2xl font-bold text-white mb-4">$0</p>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                  <Check className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/30 glow-green">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">Pro</p>
            <div className="flex items-baseline gap-1 mb-4">
              <p className="text-2xl font-bold text-white">$29</p>
              <p className="text-slate-400 text-xs">/month</p>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-white">
                  <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <button className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Upgrade to Pro — $29/month
        </button>
        <p className="text-center text-slate-500 text-xs mt-3">
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  );
}
