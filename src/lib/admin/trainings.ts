import { AppError, handleSupabaseError } from '../errors';
import type { Training, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function listTrainings(params: ListParams): Promise<ListResult<Training>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('trainings').select('*', { count: 'exact' });

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

export async function getTraining(id: string): Promise<Training> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('trainings').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createTraining(data: Partial<Training>): Promise<Training> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('trainings').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateTraining(id: string, data: Partial<Training>): Promise<Training> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('trainings').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteTraining(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('trainings').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleTraining(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('trainings').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
