import { useState } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PLATFORMS, calculateProfit, formatCurrency, formatPercent } from '../utils/fees';

const DEFAULT_INPUTS = {
  costPrice: '',
  shippingCost: '',
  sellPrice: '',
  platform: 'ebay',
};

function NumberInput({ label, prefix = '$', value, onChange, placeholder }) {
  return (
    <div>
      <label className="stat-label block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">{prefix}</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '0.00'}
          className="input-field pl-7 font-mono"
        />
      </div>
    </div>
  );
}

function StatBox({ label, value, valueClass = 'text-white', size = 'md' }) {
  return (
    <div className="bg-navy-800 rounded-xl p-4 border border-border">
      <p className="stat-label mb-2">{label}</p>
      <p className={`font-mono font-bold ${size === 'lg' ? 'text-3xl' : 'text-xl'} ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function ProfitCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  const set = (field) => (val) => setInputs((prev) => ({ ...prev, [field]: val }));

  const costPrice = parseFloat(inputs.costPrice) || 0;
  const shippingCost = parseFloat(inputs.shippingCost) || 0;
  const sellPrice = parseFloat(inputs.sellPrice) || 0;

  const hasInputs = costPrice > 0 && sellPrice > 0;
  const result = hasInputs
    ? calculateProfit({ costPrice, shippingCost, sellPrice, platform: inputs.platform })
    : null;

  const marginHealth = result
    ? result.margin >= 30
      ? { color: 'text-green-500', icon: CheckCircle, label: 'Healthy margin' }
      : result.margin >= 10
      ? { color: 'text-yellow-400', icon: AlertTriangle, label: 'Tight margin' }
      : { color: 'text-red-400', icon: AlertTriangle, label: 'Danger zone' }
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-500" />
          Profit Calculator
        </h1>
        <p className="section-subtitle">
          Real platform fees — know your true margin before you list
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Your Numbers</h2>

          <NumberInput label="Product Cost" value={inputs.costPrice} onChange={set('costPrice')} placeholder="4.00" />
          <NumberInput label="Shipping Cost" value={inputs.shippingCost} onChange={set('shippingCost')} placeholder="1.50" />
          <NumberInput label="Sell Price" value={inputs.sellPrice} onChange={set('sellPrice')} placeholder="24.99" />

          {/* Platform selector */}
          <div>
            <label className="stat-label block mb-2">Selling Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PLATFORMS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => set('platform')(key)}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                    inputs.platform === key
                      ? 'border-green-500/50 bg-green-500/10 text-white'
                      : 'border-border text-slate-400 hover:border-border hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <span className={p.color}>{p.name}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{p.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              {/* Margin health */}
              {marginHealth && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
                  result.margin >= 30
                    ? 'bg-green-500/5 border-green-500/20'
                    : result.margin >= 10
                    ? 'bg-yellow-400/5 border-yellow-400/20'
                    : 'bg-red-400/5 border-red-400/20'
                }`}>
                  <marginHealth.icon className={`w-4 h-4 ${marginHealth.color} flex-shrink-0`} />
                  <p className={`text-sm font-medium ${marginHealth.color}`}>{marginHealth.label}</p>
                </div>
              )}

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Net Profit"
                  value={formatCurrency(result.profit)}
                  valueClass={result.profit >= 0 ? 'text-green-500' : 'text-red-400'}
                  size="lg"
                />
                <StatBox
                  label="Profit Margin"
                  value={`${result.margin.toFixed(1)}%`}
                  valueClass={result.margin >= 30 ? 'text-green-500' : result.margin >= 10 ? 'text-yellow-400' : 'text-red-400'}
                  size="lg"
                />
              </div>

              {/* Breakdown */}
              <div className="card p-5 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-white">Breakdown</h3>

                <div className="space-y-2">
                  {[
                    { label: 'Sell Price', value: formatCurrency(result.sellPrice), valueClass: 'text-white' },
                    { label: 'Product Cost', value: `- ${formatCurrency(result.costPrice)}`, valueClass: 'text-red-400' },
                    { label: 'Shipping Cost', value: `- ${formatCurrency(result.shippingCost)}`, valueClass: 'text-red-400' },
                    { label: `Platform Fee (${result.platform.name})`, value: `- ${formatCurrency(result.platformFee)}`, valueClass: 'text-red-400' },
                  ].map(({ label, value, valueClass }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className={`font-mono font-medium ${valueClass}`}>{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between items-center">
                    <span className="font-semibold text-white text-sm">Net Profit</span>
                    <span className={`font-mono font-bold ${result.profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {formatCurrency(result.profit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="ROI"
                  value={`${result.roi.toFixed(0)}%`}
                  valueClass={result.roi >= 30 ? 'text-green-500' : 'text-slate-300'}
                />
                <StatBox
                  label="Break-even Sell Price"
                  value={formatCurrency(result.breakEven)}
                  valueClass="text-slate-300"
                />
              </div>

              {/* Tip */}
              {result.margin < 30 && result.margin > 0 && (
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                    <p className="text-xs font-semibold text-yellow-400">Margin improvement tip</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    To hit 30% margin, you need to either raise the sell price to{' '}
                    <span className="text-white font-mono font-medium">
                      {formatCurrency((result.totalCost + result.platformFee) / 0.7)}
                    </span>{' '}
                    or reduce total costs below{' '}
                    <span className="text-white font-mono font-medium">
                      {formatCurrency(result.sellPrice * 0.7 - result.platformFee)}
                    </span>.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="card p-10 text-center h-full flex flex-col items-center justify-center">
              <Calculator className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium">Enter your cost and sell price</p>
              <p className="text-slate-600 text-sm mt-1">Results appear instantly as you type</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
