import { AppError, handleSupabaseError } from '../errors';
import type { ExperienceItem, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function listExperienceItems(params: ListParams): Promise<ListResult<ExperienceItem>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('experience_items').select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('text', `%${search}%`);
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

export async function getExperienceItem(id: string): Promise<ExperienceItem> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('experience_items').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createExperienceItem(data: Partial<ExperienceItem>): Promise<ExperienceItem> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('experience_items').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateExperienceItem(id: string, data: Partial<ExperienceItem>): Promise<ExperienceItem> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('experience_items').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteExperienceItem(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('experience_items').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleExperienceItem(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('experience_items').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
