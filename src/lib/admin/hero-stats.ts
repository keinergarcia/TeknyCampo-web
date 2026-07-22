import { AppError, handleSupabaseError } from '../errors';
import type { HeroStat, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function listHeroStats(params: ListParams): Promise<ListResult<HeroStat>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('hero_stats').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`value.ilike.%${search}%,label.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  if (sortColumn) {
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
  } else {
    query = query.order('order_index', { ascending: true });
  }

  const { data, error, count } = await query;
  if (error) throw handleSupabaseError(error);
  return { data: data ?? [], total: count ?? 0 };
}

export async function getHeroStat(id: string): Promise<HeroStat> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('hero_stats').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createHeroStat(data: Partial<HeroStat>): Promise<HeroStat> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('hero_stats').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateHeroStat(id: string, data: Partial<HeroStat>): Promise<HeroStat> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('hero_stats').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteHeroStat(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('hero_stats').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleHeroStat(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('hero_stats').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
