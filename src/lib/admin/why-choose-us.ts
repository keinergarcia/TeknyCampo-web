import { AppError, handleSupabaseError } from '../errors';
import type { WhyChooseUs, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function listWhyChooseUs(params: ListParams): Promise<ListResult<WhyChooseUs>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('why_choose_us').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
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

export async function getWhyChooseUs(id: string): Promise<WhyChooseUs> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('why_choose_us').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createWhyChooseUs(data: Partial<WhyChooseUs>): Promise<WhyChooseUs> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('why_choose_us').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateWhyChooseUs(id: string, data: Partial<WhyChooseUs>): Promise<WhyChooseUs> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('why_choose_us').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteWhyChooseUs(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('why_choose_us').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleWhyChooseUs(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('why_choose_us').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
