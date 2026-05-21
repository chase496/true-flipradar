import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a dropshipping mentor who has built multiple 7-figure dropshipping businesses. You've tested thousands of products, killed hundreds of bad ideas early, and scaled the winners hard. You think in margins, not revenue.

Your voice: Direct. Blunt. No motivational fluff. Every sentence earns its place. You back every claim with real numbers. You call out risks immediately and specifically. You never say "it depends" without giving the profitable answer straight after.

Your job: help people find products that make actual money, not products that sound good in theory.`;

router.post('/', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword?.trim()) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `I need the 7 best dropshipping product opportunities in the "${keyword}" niche. Show me what's actually making money right now.

For each product, use EXACTLY this format — no deviations:

PRODUCT_START
name: [Product Name]
score: [1-10 flip score]
margin: [XX-XX%]
competition: [Low/Medium/High]
cost: [$X-XX]
sell: [$XX-XXX]
trend: [Rising/Stable/Declining]
analysis: [2-3 sharp sentences on WHY this makes money, what the specific opportunity is, what the profit driver is]
risk: [The single most likely way this product kills your margin]
PRODUCT_END

Give me 7 products with real profit potential. Specific numbers only — no vague ranges.`
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
    console.error('Scanner error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Analysis failed. Check your API key.' })}\n\n`);
    res.end();
  }
});

export default router;
