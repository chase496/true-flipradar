import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let feedCache = null;
let feedGeneratedAt = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const FALLBACK_FEED = [
  { id: "fw1", name: "Posture Corrector Belt", niche: "Health & Wellness", flipScore: 8, estimatedMargin: "48-58%", competitionLevel: "Medium", trendDirection: "Rising", avgCostPrice: "$4-7", avgSellPrice: "$19-28", pitch: "Remote work boom created millions of new back-pain sufferers — demand is structural, not cyclical", supplierTip: "Search CJDropshipping for 'posture corrector FDA' to find certifiable variants for premium pricing" },
  { id: "fw2", name: "Red Light Therapy Wand", niche: "Health & Wellness", flipScore: 9, estimatedMargin: "55-65%", competitionLevel: "Low", trendDirection: "Rising", avgCostPrice: "$12-18", avgSellPrice: "$45-79", pitch: "TikTok's wellness community is driving massive organic reach — influencer seeding costs $0 if you target micro-creators", supplierTip: "Alibaba MOQ of 50 units unlocks white-label with your logo for $14/unit" },
  { id: "fw3", name: "Collagen Gua Sha Stone Set", niche: "Health & Wellness", flipScore: 7, estimatedMargin: "60-70%", competitionLevel: "Medium", trendDirection: "Stable", avgCostPrice: "$2-4", avgSellPrice: "$12-22", pitch: "High-margin gift item that bundles well — 3-piece kits sell for 3x the sum of parts", supplierTip: "AliExpress sellers with 1000+ reviews and 4.7+ rating in jade/rose quartz niche" },
  { id: "hk1", name: "Magnetic Cable Organiser", niche: "Home & Kitchen", flipScore: 7, estimatedMargin: "50-60%", competitionLevel: "Low", trendDirection: "Rising", avgCostPrice: "$3-6", avgSellPrice: "$14-22", pitch: "Desk setup culture is massive on YouTube and TikTok — this product photographs beautifully for organic content", supplierTip: "Look for silicone variants on CJDropshipping — they have 3x fewer returns than plastic" },
  { id: "hk2", name: "Self-Watering Plant Pot Set", niche: "Home & Kitchen", flipScore: 8, estimatedMargin: "45-55%", competitionLevel: "Medium", trendDirection: "Stable", avgCostPrice: "$5-9", avgSellPrice: "$22-38", pitch: "Plant parent demographic is highly engaged and repeat-buys — one customer = 3-4 lifetime orders", supplierTip: "Source ceramic variants from Alibaba at 100 MOQ to differentiate from plastic competitors on Amazon" },
  { id: "hk3", name: "Digital Kitchen Scale (0.1g precision)", niche: "Home & Kitchen", flipScore: 6, estimatedMargin: "35-45%", competitionLevel: "High", trendDirection: "Stable", avgCostPrice: "$6-10", avgSellPrice: "$18-26", pitch: "High-precision scales found new audience in home baking and supplement measuring post-COVID", supplierTip: "Bundle with a recipe card PDF for premium positioning and avoid the commodity race" },
  { id: "ta1", name: "MagSafe Ring Phone Grip", niche: "Tech Accessories", flipScore: 9, estimatedMargin: "60-72%", competitionLevel: "Low", trendDirection: "Rising", avgCostPrice: "$2-4", avgSellPrice: "$12-20", pitch: "Every iPhone 12+ user is a potential customer — magnetic accessories are exploding and this has massive upsell potential", supplierTip: "CJDropshipping stocks MagSafe-compatible variants — verify compatibility list before ordering samples" },
  { id: "ta2", name: "65W GaN Charger (3-port)", niche: "Tech Accessories", flipScore: 8, estimatedMargin: "40-50%", competitionLevel: "Medium", trendDirection: "Rising", avgCostPrice: "$8-14", avgSellPrice: "$28-42", pitch: "GaN is replacing standard chargers fast — early market with room for new brands before Amazon private labels dominate", supplierTip: "Alibaba suppliers with UL certification are non-negotiable — avoid uncertified units, liability risk is real" },
  { id: "ta3", name: "Cable Management Box", niche: "Tech Accessories", flipScore: 7, estimatedMargin: "52-62%", competitionLevel: "Low", trendDirection: "Rising", avgCostPrice: "$5-9", avgSellPrice: "$22-35", pitch: "WFH setup obsession drives this — people are actively searching for desk cable solutions after every tech unboxing video", supplierTip: "Wood-grain variants command 40% price premium over plastic — source from AliExpress bamboo suppliers" },
  { id: "pp1", name: "Slow Feeder Dog Bowl", niche: "Pet Products", flipScore: 8, estimatedMargin: "55-65%", competitionLevel: "Low", trendDirection: "Rising", avgCostPrice: "$3-6", avgSellPrice: "$15-24", pitch: "Vet-recommended product with zero marketing needed — dog owners buy on vet advice and Amazon reviews alone", supplierTip: "Look for BPA-free certified silicone variants on CJDropshipping — safety certification justifies premium pricing" },
  { id: "pp2", name: "Interactive Cat Feather Wand", niche: "Pet Products", flipScore: 7, estimatedMargin: "65-75%", competitionLevel: "Low", trendDirection: "Stable", avgCostPrice: "$1-3", avgSellPrice: "$8-16", pitch: "Insane margin on a product with zero seasonality — cat owners buy multiple replacements per year", supplierTip: "Bundle 3 wand heads for a kit that justifies $15+ pricing vs $8 for single units on competitors" },
  { id: "pp3", name: "GPS Pet Tracker Clip", niche: "Pet Products", flipScore: 9, estimatedMargin: "45-58%", competitionLevel: "Medium", trendDirection: "Rising", avgCostPrice: "$9-15", avgSellPrice: "$29-48", pitch: "Fear of losing a pet is a powerful buying trigger — GPS tracker adds urgency and justifies premium pricing emotionally", supplierTip: "Partner with a monthly subscription SIM plan to generate recurring revenue beyond the hardware sale" }
];

async function generateFeed() {
  console.log('Generating fresh product feed...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: `You are an experienced dropshipping mentor who has built multiple 7-figure dropshipping businesses. You have sharp instincts for what's actually trending and profitable right now — not theoretical, not generic.`,
    messages: [{
      role: 'user',
      content: `Generate today's 12 best dropshipping product opportunities. Organise into 4 niches: Health & Wellness, Home & Kitchen, Tech Accessories, Pet Products — 3 products each.

Return ONLY a valid JSON array. No markdown, no explanation, just the array:

[
  {
    "id": "unique-short-id",
    "name": "Specific Product Name",
    "niche": "Health & Wellness",
    "flipScore": 8,
    "estimatedMargin": "45-55%",
    "competitionLevel": "Low",
    "trendDirection": "Rising",
    "avgCostPrice": "$5-9",
    "avgSellPrice": "$22-35",
    "pitch": "One compelling sentence on exactly why this makes money right now — specific and direct",
    "supplierTip": "One specific actionable sourcing insight that protects margin"
  }
]

Make these real opportunities with genuine profit potential. Specific numbers, not vague ranges.`
    }]
  });

  try {
    const text = response.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('Feed JSON parse failed, using fallback:', e.message);
    return FALLBACK_FEED;
  }
}

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    const stale = !feedCache || !feedGeneratedAt || (now - feedGeneratedAt) > CACHE_DURATION;

    if (stale) {
      feedCache = await generateFeed();
      feedGeneratedAt = now;
    }

    res.json({
      products: feedCache,
      generatedAt: feedGeneratedAt,
      nextRefresh: feedGeneratedAt + CACHE_DURATION,
      fromCache: !stale
    });
  } catch (error) {
    console.error('Feed error, returning fallback:', error.message);
    res.json({
      products: FALLBACK_FEED,
      generatedAt: Date.now(),
      nextRefresh: Date.now() + CACHE_DURATION,
      fromCache: false,
      fallback: true
    });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    feedCache = await generateFeed();
    feedGeneratedAt = Date.now();

    res.json({
      products: feedCache,
      generatedAt: feedGeneratedAt,
      nextRefresh: feedGeneratedAt + CACHE_DURATION
    });
  } catch (error) {
    console.error('Feed refresh error:', error);
    res.status(500).json({ error: 'Feed refresh failed' });
  }
});

export default router;
