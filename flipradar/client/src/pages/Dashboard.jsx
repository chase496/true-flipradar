import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const NICHES = ['All', 'Health & Wellness', 'Home & Kitchen', 'Tech Accessories', 'Pet Products'];

export default function Dashboard() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeNiche, setActiveNiche] = useState('All');

  const fetchFeed = async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? '/api/feed/refresh' : '/api/feed';
      const method = forceRefresh ? 'POST' : 'GET';
      const res = await fetch(url, { method });
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      setFeed(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchFeed().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeed(true);
    setRefreshing(false);
  };

  const filteredProducts = feed?.products?.filter(
    (p) => activeNiche === 'All' || p.niche === activeNiche
  ) ?? [];

  const nextRefreshStr = feed?.nextRefresh
    ? new Date(feed.nextRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-green-500" />
            <h1 className="section-title">Today's Winning Products</h1>
          </div>
          <p className="section-subtitle">
            AI-curated daily feed — refreshes every 24 hours
            {nextRefreshStr && ` · Next refresh at ${nextRefreshStr}`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Regenerating…' : 'Refresh Feed'}
        </button>
      </div>

      {/* Niche tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {NICHES.map((niche) => (
          <button
            key={niche}
            onClick={() => setActiveNiche(niche)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeNiche === niche
                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                : 'text-slate-400 hover:text-white border border-transparent hover:border-border'
            }`}
          >
            {niche}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-72 animate-pulse">
              <div className="h-4 bg-navy-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-navy-700 rounded w-1/2 mb-6" />
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 bg-navy-700 rounded" />
                ))}
              </div>
              <div className="h-12 bg-navy-700 rounded mb-4" />
              <div className="h-3 bg-navy-700 rounded w-full mb-2" />
              <div className="h-3 bg-navy-700 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="card p-6 text-center">
          <p className="text-red-400 mb-2">Failed to load feed</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <button onClick={() => fetchFeed()} className="btn-secondary mt-4 mx-auto">
            Retry
          </button>
        </div>
      )}

      {/* Products grid */}
      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-slate-400">No products found for this niche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Cache notice */}
          {feed?.fromCache && (
            <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Feed served from cache · generated {new Date(feed.generatedAt).toLocaleString()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
