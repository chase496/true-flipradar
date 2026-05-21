import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Zap, X } from 'lucide-react';
import { useStreaming } from '../hooks/useStreaming';

/** Very light markdown → HTML for streaming output */
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

export default function SupplierFinder() {
  const [searchParams] = useSearchParams();
  const prefill = searchParams.get('product') || '';
  const [product, setProduct] = useState(prefill);
  const { text, isStreaming, error, stream, abort, reset } = useStreaming();

  useEffect(() => {
    if (prefill) {
      setProduct(prefill);
      stream('/api/supplier', { product: prefill });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!product.trim() || isStreaming) return;
    reset();
    stream('/api/supplier', { product: product.trim() });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Package className="w-5 h-5 text-green-500" />
          Supplier Finder
        </h1>
        <p className="section-subtitle">
          Get a platform-by-platform sourcing playbook — AliExpress, CJDropshipping, and Alibaba
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="e.g. Magnetic Phone Grip, Posture Corrector, LED Strip Lights…"
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
            Find
          </button>
        )}
      </form>

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
              Building your sourcing playbook…
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
            <Package className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Enter a product to find the best supplier</p>
          <p className="text-slate-600 text-sm">We'll compare AliExpress, CJDropshipping, and Alibaba for you</p>
        </div>
      )}
    </div>
  );
}
