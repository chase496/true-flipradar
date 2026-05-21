import { useState, useEffect, useRef } from 'react';
import { Search, Zap, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStreaming } from '../hooks/useStreaming';
import FlipScoreBadge from '../components/FlipScoreBadge';
import UpgradeModal from '../components/UpgradeModal';

const TREND_ICONS = {
  Rising: { icon: TrendingUp, color: 'text-green-500' },
  Stable: { icon: Minus, color: 'text-slate-400' },
  Declining: { icon: TrendingDown, color: 'text-red-400' },
};

const COMPETITION_COLORS = {
  Low: 'text-green-500',
  Medium: 'text-yellow-400',
  High: 'text-red-400',
};

/**
 * Parse the raw streamed text for complete PRODUCT_START...PRODUCT_END blocks
 * and return an array of product objects.
 */
function parseProducts(raw) {
  const blocks = [];
  const regex = /PRODUCT_START([\s\S]*?)PRODUCT_END/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const block = match[1];
    const get = (field) => {
      const m = block.match(new RegExp(`${field}:\\s*(.+)`));
      return m ? m[1].trim() : '';
    };
    blocks.push({
      id: `scan-${blocks.length}`,
      name: get('name'),
      score: get('score'),
      margin: get('margin'),
      competition: get('competition'),
      cost: get('cost'),
      sell: get('sell'),
      trend: get('trend'),
      analysis: get('analysis'),
      risk: get('risk'),
    });
  }
  return blocks;
}

const QUICK_SEARCHES = ['Pet Accessories', 'Home Gym', 'Kitchen Gadgets', 'Beauty Tools', 'Baby Products', 'Outdoor & Garden'];

export default function Scanner() {
  const [keyword, setKeyword] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { text, isStreaming, error, upgradeRequired, stream, abort, reset } = useStreaming();
  const inputRef = useRef(null);

  useEffect(() => {
    if (upgradeRequired) setShowUpgrade(true);
  }, [upgradeRequired]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const kw = keyword.trim();
    if (!kw || isStreaming) return;
    setSubmitted(kw);
    reset();
    stream('/api/scanner', { keyword: kw });
  };

  const handleQuick = (q) => {
    setKeyword(q);
    setSubmitted(q);
    reset();
    stream('/api/scanner', { keyword: q });
  };

  const products = parseProducts(text);
  const isPartiallyStreaming = isStreaming && products.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Search className="w-5 h-5 text-green-500" />
          Product Trend Scanner
        </h1>
        <p className="section-subtitle">Enter a niche or product category to find your next winner</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. fitness equipment, pet accessories, kitchen gadgets…"
            className="input-field pl-9"
            disabled={isStreaming}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => { setKeyword(''); reset(); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isStreaming ? (
          <button type="button" onClick={abort} className="btn-secondary flex items-center gap-2">
            <X className="w-4 h-4" />
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!keyword.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Zap className="w-4 h-4" />
            Scan
          </button>
        )}
      </form>

      {/* Quick searches */}
      {!submitted && (
        <div className="flex flex-wrap gap-2 mb-8">
          {QUICK_SEARCHES.map((q) => (
            <button
              key={q}
              onClick={() => handleQuick(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-green-500/30 text-slate-400 hover:text-green-500 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !upgradeRequired && (
        <div className="card p-4 border-red-400/20 bg-red-400/5 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Streaming skeleton */}
      {isPartiallyStreaming && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 h-56 animate-pulse">
              <div className="h-4 bg-navy-700 rounded w-2/3 mb-3" />
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3].map((j) => <div key={j} className="h-8 bg-navy-700 rounded" />)}
              </div>
              <div className="h-3 bg-navy-700 rounded mb-2" />
              <div className="h-3 bg-navy-700 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {products.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">
              {isStreaming ? `Scanning "${submitted}"` : `${products.length} products found for "${submitted}"`}
              {isStreaming && <span className="streaming-cursor ml-1" />}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p, idx) => {
              const trend = TREND_ICONS[p.trend] || TREND_ICONS.Stable;
              const TrendIcon = trend.icon;
              return (
                <div key={p.id} className="card p-5 animate-slide-up flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white leading-snug">{p.name}</h3>
                    </div>
                    <FlipScoreBadge score={p.score} />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <p className="stat-label text-[10px]">Margin</p>
                      <p className="font-mono font-semibold text-green-500 text-xs">{p.margin}</p>
                    </div>
                    <div>
                      <p className="stat-label text-[10px]">Competition</p>
                      <p className={`font-mono font-semibold text-xs ${COMPETITION_COLORS[p.competition] || 'text-slate-400'}`}>{p.competition}</p>
                    </div>
                    <div>
                      <p className="stat-label text-[10px]">Cost</p>
                      <p className="font-mono font-semibold text-slate-300 text-xs">{p.cost}</p>
                    </div>
                    <div>
                      <p className="stat-label text-[10px]">Sell</p>
                      <p className="font-mono font-semibold text-white text-xs">{p.sell}</p>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center gap-1.5">
                    <TrendIcon className={`w-3.5 h-3.5 ${trend.color}`} />
                    <span className={`text-xs font-medium ${trend.color}`}>{p.trend}</span>
                  </div>

                  {/* Analysis */}
                  <p className="text-slate-400 text-xs leading-relaxed">{p.analysis}</p>

                  {/* Risk */}
                  <div className="bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Key Risk</p>
                    <p className="text-xs text-slate-400">{p.risk}</p>
                  </div>
                </div>
              );
            })}

            {/* Streaming placeholder for next card */}
            {isStreaming && (
              <div className="card p-5 h-56 animate-pulse">
                <div className="h-4 bg-navy-700 rounded w-2/3 mb-3" />
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 4].map((j) => <div key={j} className="h-8 bg-navy-700 rounded" />)}
                </div>
                <div className="h-3 bg-navy-700 rounded mb-2" />
                <div className="h-3 bg-navy-700 rounded w-4/5" />
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {!submitted && !isStreaming && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-border flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Enter a niche to start scanning</p>
          <p className="text-slate-600 text-sm">You have 5 free scans per day</p>
        </div>
      )}
    </div>
  );
}
