import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart2, Zap, X } from 'lucide-react';
import { useStreaming } from '../hooks/useStreaming';

function renderMarkdown(text) {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])(.+)$/gm, '<p>$1</p>');
}

const EXAMPLES = ['Posture Corrector', 'Bamboo Toothbrush', 'Ring Light', 'Beard Grooming Kit', 'Resistance Bands'];

export default function CompetitionAnalyser() {
  const [searchParams] = useSearchParams();
  const prefill = searchParams.get('product') || '';
  const [product, setProduct] = useState(prefill);
  const { text, isStreaming, error, stream, abort, reset } = useStreaming();

  useEffect(() => {
    if (prefill) {
      setProduct(prefill);
      stream('/api/competition', { product: prefill });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!product.trim() || isStreaming) return;
    reset();
    stream('/api/competition', { product: product.trim() });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-green-500" />
          Competition Analyser
        </h1>
        <p className="section-subtitle">
          Brutal, honest market saturation analysis — know whether to enter or avoid before you spend a dollar
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="e.g. Posture Corrector Belt, MagSafe Phone Grip, Slow Feeder Dog Bowl…"
          className="input-field flex-1"
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button type="button" onClick={abort} className="btn-secondary flex items-center gap-2">
            <X className="w-4 h-4" />
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!product.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Zap className="w-4 h-4" />
            Analyse
          </button>
        )}
      </form>

      {/* Example chips */}
      {!text && !isStreaming && (
        <div className="flex flex-wrap gap-2 mb-8">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setProduct(ex); reset(); stream('/api/competition', { product: ex }); }}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-green-500/30 text-slate-400 hover:text-green-500 transition-all"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-400/20 bg-red-400/5 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Streaming output */}
      {(text || isStreaming) && (
        <div className="card p-6">
          {isStreaming && !text && (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Running market saturation analysis…
            </div>
          )}

          {text && (
            <div
              className={`stream-content ${isStreaming ? 'streaming-cursor' : ''}`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {!text && !isStreaming && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-border flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Enter a product to analyse the competition</p>
          <p className="text-slate-600 text-sm">
            You'll get a saturation score, market stage, gaps that still exist, and a clear enter/avoid verdict
          </p>
        </div>
      )}
    </div>
  );
}
