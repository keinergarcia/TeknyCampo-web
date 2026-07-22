import { AppError, handleSupabaseError } from '../errors';
import type { News, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function listNews(params: ListParams): Promise<ListResult<News>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('news').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  if (sortColumn) {
    query = query.order(sortColumn, {
      ascending: sortDirection === 'asc',
      nullsFirst: sortDirection === 'asc' ? undefined : false,
    });
  } else {
    query = query.order('published_at', { ascending: false, nullsFirst: false });
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) throw handleSupabaseError(error);
  return { data: data ?? [], total: count ?? 0 };
}

export async function getNews(id: string): Promise<News> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('news').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createNews(data: Partial<News>): Promise<News> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('news').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateNews(id: string, data: Partial<News>): Promise<News> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('news').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteNews(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('news').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleNews(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('news').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
