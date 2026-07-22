import { AppError, handleSupabaseError } from '../errors';
import type { Service, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado. Verifique el archivo .env', 'CONFIG_ERROR');
  return supabase;
}

export async function listServices(params: ListParams): Promise<ListResult<Service>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb
    .from('services')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  if (sortColumn) {
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
  } else {
    query = query.order('order_index', { ascending: true });
  }

  const { data, error, count } = await query;
  if (error) throw handleSupabaseError(error);
  return { data: data ?? [], total: count ?? 0 };
}

export async function getService(id: string): Promise<Service> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('services').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createService(data: Partial<Service>): Promise<Service> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('services').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateService(id: string, data: Partial<Service>): Promise<Service> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('services').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteService(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('services').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleService(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('services').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
