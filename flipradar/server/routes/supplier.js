import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a dropshipping mentor who has built multiple 7-figure dropshipping businesses. You know supplier platforms inside and out — what to look for, what to avoid, and exactly how to negotiate margin out of each platform.

Your voice: Direct. Specific. Numbers-focused. No fluff. Tell people exactly what to do and why it makes them more money.`;

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
        content: `Give me the complete sourcing playbook for dropshipping "${product}". I need to know exactly where to source it and how to maximise margin on each platform.

Format your response exactly like this:

## AliExpress
**Best For:** [Who should use this and when]
**Expected Cost:** [$X-XX per unit]
**What to Look For:** [3 specific criteria — ratings threshold, shipping method, supplier age]
**Red Flags:** [Exact warning signs that kill margin or cause problems]
**Pro Tip:** [One specific tactic to get better pricing or quality]

## CJDropshipping
**Best For:** [Who should use this and when]
**Expected Cost:** [$X-XX per unit]
**What to Look For:** [3 specific criteria]
**Red Flags:** [Exact warning signs]
**Pro Tip:** [One specific money-saving or quality tactic]

## Alibaba (Private Label / Bulk)
**Best For:** [Who should use this and when]
**Minimum Order:** [Typical MOQ]
**Expected Cost:** [$X-XX per unit at MOQ]
**What to Look For:** [3 specific criteria for vetting suppliers]
**Pro Tip:** [One negotiation or vetting tactic]

## My Verdict
[2 sentences: which platform to start on and why, based purely on profit logic. Be direct — pick one winner.]`
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
    console.error('Supplier error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Analysis failed. Check your API key.' })}\n\n`);
    res.end();
  }
});

export default router;
