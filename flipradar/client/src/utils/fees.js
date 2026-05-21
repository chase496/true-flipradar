export const PLATFORMS = {
  ebay: {
    name: 'eBay',
    color: 'text-yellow-400',
    feePercent: 0.129,
    fixedFee: 0.30,
    description: '12.9% + $0.30',
  },
  amazon: {
    name: 'Amazon',
    color: 'text-orange-400',
    feePercent: 0.15,
    fixedFee: 3.99,
    description: '15% + $3.99 FBA',
  },
  shopify: {
    name: 'Shopify',
    color: 'text-purple-400',
    feePercent: 0.029,
    fixedFee: 0.30,
    description: '2.9% + $0.30',
  },
};

/**
 * Calculate profit breakdown for a given platform.
 * @param {object} params
 * @param {number} params.costPrice - What you pay for the product
 * @param {number} params.shippingCost - Your shipping cost
 * @param {number} params.sellPrice - Your listed sell price
 * @param {string} params.platform - 'ebay' | 'amazon' | 'shopify'
 * @returns {object} Detailed profit breakdown
 */
export function calculateProfit({ costPrice, shippingCost, sellPrice, platform }) {
  const p = PLATFORMS[platform];
  if (!p) return null;

  const platformFee = sellPrice * p.feePercent + p.fixedFee;
  const totalCost = costPrice + shippingCost;
  const profit = sellPrice - totalCost - platformFee;
  const margin = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return {
    sellPrice,
    totalCost,
    costPrice,
    shippingCost,
    platformFee,
    profit,
    margin,
    roi,
    platform: p,
    breakEven: totalCost + platformFee,
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
