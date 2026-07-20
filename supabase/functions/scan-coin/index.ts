// Supabase Edge Function: scan-coin
//
// Receives a base64 photo from the app, asks Claude (vision) to identify the
// coin and estimate its value, and returns a structured JSON result. The
// Anthropic API key lives only here, as a function secret — never in the app.
//
// Deploy:   supabase functions deploy scan-coin
// Secret:   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from 'npm:@anthropic-ai/sdk@0.112.3';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const SYSTEM = `You are a professional numismatist (coin expert). You are shown a single photo of a coin.

Identify the coin as precisely as you can and estimate its current market value.

Rules:
- Give a realistic value RANGE in USD for a typical example in average collectible condition, based on your knowledge of the coin market. If it is a common circulating coin worth only face value, say so with a low range.
- Value is inherently uncertain from a photo (grade, mint mark, and condition matter and are hard to judge). Reflect that uncertainty in the range and in "confidence".
- "rarity" must be one of: common, uncommon, rare, epic, legendary — judged by scarcity and desirability, not just price.
- "confidence" is 0-1: how sure you are of the identification.
- Keep "reasoning" to one or two sentences a collector would find useful (what it is and what drives the value).
- If the image is not a coin, is too blurry, or you cannot identify it, set "identified" to false and explain briefly in "reasoning"; still fill the other fields with your best guess or empty strings / zeros.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    identified: { type: 'boolean' },
    name: { type: 'string' },
    country: { type: 'string' },
    year: { type: 'string' },
    metal: { type: 'string' },
    rarity: {
      type: 'string',
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    },
    currency: { type: 'string' },
    value_low: { type: 'number' },
    value_high: { type: 'number' },
    confidence: { type: 'number' },
    reasoning: { type: 'string' },
  },
  required: [
    'identified',
    'name',
    'country',
    'year',
    'metal',
    'rarity',
    'currency',
    'value_low',
    'value_high',
    'confidence',
    'reasoning',
  ],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!Deno.env.get('ANTHROPIC_API_KEY')) {
    return json({ error: 'Server is missing ANTHROPIC_API_KEY.' }, 500);
  }

  let image: string | undefined;
  let mediaType = 'image/jpeg';
  try {
    const body = await req.json();
    image = body.image;
    if (body.mediaType) mediaType = body.mediaType;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  if (!image) return json({ error: 'No image provided.' }, 400);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: SYSTEM,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: image },
            },
            {
              type: 'text',
              text: 'Identify this coin and estimate its current market value.',
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const raw = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const result = JSON.parse(raw);
    return json(result, 200);
  } catch (err) {
    console.error('scan-coin error:', err);
    const msg = err instanceof Error ? err.message : 'Identification failed.';
    return json({ error: msg }, 500);
  }
});
