import { AppError, handleSupabaseError } from '../errors';
import type { Entity, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function listEntities(params: ListParams): Promise<ListResult<Entity>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('entities').select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
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

export async function getEntity(id: string): Promise<Entity> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('entities').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createEntity(data: Partial<Entity>): Promise<Entity> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('entities').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateEntity(id: string, data: Partial<Entity>): Promise<Entity> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('entities').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteEntity(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('entities').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleEntity(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('entities').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
