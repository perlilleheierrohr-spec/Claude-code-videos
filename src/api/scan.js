import { supabase } from '../lib/supabase';

/**
 * Send a base64 photo to the `scan-coin` Supabase Edge Function, which calls
 * Claude vision server-side and returns a structured identification.
 *
 * Resolves to:
 *   { identified, name, country, year, metal, rarity, currency,
 *     value_low, value_high, confidence, reasoning }
 */
export async function scanCoin(base64Image, mediaType = 'image/jpeg') {
  const { data, error } = await supabase.functions.invoke('scan-coin', {
    body: { image: base64Image, mediaType },
  });

  if (error) {
    // Edge Functions surface non-2xx as a FunctionsHttpError; try to read the body.
    let detail = error.message;
    try {
      const body = await error.context?.json?.();
      if (body?.error) detail = body.error;
    } catch (_) {
      /* ignore */
    }
    throw new Error(detail || 'Scan failed');
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
