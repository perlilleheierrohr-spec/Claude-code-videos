import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

const BUCKET = 'coin-photos';

/** Fetch the signed-in user's coins, newest first. */
export async function fetchCoins() {
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Persist a scanned coin: upload its photo to Storage (best-effort), then
 * insert the row. `value` is stored as the midpoint of the estimate range so
 * dashboards can sum a single number.
 */
export async function createCoin(scan, base64Photo) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  let photo_url = null;
  if (base64Photo && userId) {
    const path = `${userId}/${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, decode(base64Photo), { contentType: 'image/jpeg', upsert: false });
    if (!upErr) {
      photo_url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  const low = Number(scan.value_low) || 0;
  const high = Number(scan.value_high) || 0;
  const value = Math.round((low + high) / 2);

  const row = {
    user_id: userId,
    name: scan.name,
    country: scan.country,
    year: scan.year != null ? String(scan.year) : null,
    metal: scan.metal,
    rarity: scan.rarity || 'common',
    value,
    value_low: low,
    value_high: high,
    currency: scan.currency || 'USD',
    confidence: scan.confidence ?? null,
    reasoning: scan.reasoning ?? null,
    photo_url,
  };

  const { data, error } = await supabase.from('coins').insert(row).select().single();
  if (error) throw error;
  return data;
}

/** Delete one coin (RLS ensures the caller can only delete their own). */
export async function deleteCoin(id) {
  const { error } = await supabase.from('coins').delete().eq('id', id);
  if (error) throw error;
}
