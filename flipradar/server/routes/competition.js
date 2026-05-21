import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a dropshipping mentor who has built multiple 7-figure dropshipping businesses. You have a sharp eye for market saturation — you can read competition signals others miss, and you're brutally honest about whether a market is worth entering.

Your voice: Blunt. Data-driven. You call saturated markets what they are. But you also find the gaps others overlook. No false hope, no doom and gloom — just the profitable truth.`;

router.post('/', async (req, res) => {
  const { product } = req.body;

  if (!product?.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Do a full competition and market saturation analysis for "${product}" in the dropshipping market. Be brutally honest.

Format your response exactly like this:

## Market Saturation: ${product}

**Saturation Score:** [X/10 — where 10 = completely dead, 1 = wide open]
**Market Stage:** [Emerging / Growing / Mature / Saturated / Declining]
**Opportunity Window:** [How long before this market closes to new entrants?]

## Competition Reality
**Seller Density:** [How many active sellers are competing in this space]
**Price War Risk:** [Is this a race to the bottom or are margins stable?]
**Platform Breakdown:** [Where competition is heaviest: eBay / Amazon / Shopify stores]
**Barrier to Entry:** [Low / Medium / High — and why]

## The Gaps That Still Exist
[3 specific untapped angles, audiences, or positioning opportunities in this market]

## Profit Verdict
**Enter or Avoid?** [Direct YES or NO with your reasoning in 2 sentences]

## If You Enter — Win Like This
[3 specific differentiation tactics that protect margin and carve out a position]`
      }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Competition error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Analysis failed. Check your API key.' })}\n\n`);
    res.end();
  }
});

export default router;
