import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FlipScoreBadge from './FlipScoreBadge';

const TREND_ICONS = {
  Rising: { icon: TrendingUp, color: 'text-green-500' },
  Stable: { icon: Minus, color: 'text-slate-400' },
  Declining: { icon: TrendingDown, color: 'text-red-400' },
};

const COMPETITION_COLORS = {
  Low: 'text-green-500 bg-green-500/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  High: 'text-red-400 bg-red-400/10',
};

export default function ProductCard({ product, onAnalyse }) {
  const navigate = useNavigate();
  const trend = TREND_ICONS[product.trendDirection] || TREND_ICONS.Stable;
  const TrendIcon = trend.icon;

  const handleSupplier = () => {
    navigate(`/supplier?product=${encodeURIComponent(product.name)}`);
  };

  const handleCompetition = () => {
    navigate(`/competition?product=${encodeURIComponent(product.name)}`);
  };

  return (
    <div className="card p-5 hover:border-green-500/30 transition-all duration-200 animate-slide-up flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-snug">{product.name}</h3>
          <span className="text-xs text-slate-500 mt-0.5 block">{product.niche}</span>
        </div>
        <FlipScoreBadge score={product.flipScore} size="md" />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="stat-label">Margin</p>
          <p className="stat-value text-green-500 text-sm">{product.estimatedMargin}</p>
        </div>
        <div>
          <p className="stat-label">Competition</p>
          <p className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block font-mono ${COMPETITION_COLORS[product.competitionLevel] || 'text-slate-400'}`}>
            {product.competitionLevel}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="stat-label">Trend</p>
          <TrendIcon className={`w-4 h-4 mt-1.5 ${trend.color}`} />
        </div>
      </div>

      {/* Price band */}
      <div className="flex items-center gap-2 bg-navy-800 rounded-lg px-3 py-2">
        <div className="flex-1 text-center">
          <p className="stat-label text-[10px]">Cost</p>
          <p className="font-mono font-semibold text-slate-300 text-sm">{product.avgCostPrice}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-navy-600 flex-shrink-0" />
        <div className="flex-1 text-center">
          <p className="stat-label text-[10px]">Sell</p>
          <p className="font-mono font-semibold text-white text-sm">{product.avgSellPrice}</p>
        </div>
      </div>

      {/* Pitch */}
      <p className="text-slate-400 text-xs leading-relaxed border-l-2 border-green-500/40 pl-3 italic">
        {product.pitch}
      </p>

      {/* Supplier tip */}
      {product.supplierTip && (
        <div className="bg-navy-800/60 rounded-lg px-3 py-2">
          <p className="text-[10px] font-medium text-green-500 uppercase tracking-wider mb-1">Supplier Tip</p>
          <p className="text-xs text-slate-400">{product.supplierTip}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSupplier}
          className="flex-1 text-xs font-medium py-2 rounded-lg border border-border hover:border-green-500/40 hover:text-green-500 text-slate-400 transition-all"
        >
          Find Supplier
        </button>
        <button
          onClick={handleCompetition}
          className="flex-1 text-xs font-medium py-2 rounded-lg border border-border hover:border-green-500/40 hover:text-green-500 text-slate-400 transition-all"
        >
          Check Competition
        </button>
      </div>
    </div>
  );
}
