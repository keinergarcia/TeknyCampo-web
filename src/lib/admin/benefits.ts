import { AppError, handleSupabaseError } from '../errors';
import type { Benefit, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function listBenefits(params: ListParams): Promise<ListResult<Benefit>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('benefits').select('*', { count: 'exact' });

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

export async function getBenefit(id: string): Promise<Benefit> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('benefits').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createBenefit(data: Partial<Benefit>): Promise<Benefit> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('benefits').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateBenefit(id: string, data: Partial<Benefit>): Promise<Benefit> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('benefits').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteBenefit(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('benefits').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleBenefit(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('benefits').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
