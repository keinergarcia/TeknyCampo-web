import { AppError, handleSupabaseError } from '../errors';
import type { Job, JobApplication, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado. Verifique el archivo .env', 'CONFIG_ERROR');
  return supabase;
}

export async function listJobs(params: ListParams): Promise<ListResult<Job>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('jobs').select('*', { count: 'exact' });

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

export async function getJob(id: string): Promise<Job> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('jobs').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('jobs').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateJob(id: string, data: Partial<Job>): Promise<Job> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('jobs').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteJob(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('jobs').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleJob(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('jobs').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function listApplications(params: ListParams): Promise<ListResult<JobApplication>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('job_applications').select('*, jobs(title)', { count: 'exact' });

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%,cedula.ilike.%${search}%,cargo.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  if (sortColumn) {
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) throw handleSupabaseError(error);
  return { data: data ?? [], total: count ?? 0 };
}

export async function getApplication(id: string): Promise<JobApplication> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('job_applications').select('*, jobs(title)').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function updateApplication(id: string, data: Partial<JobApplication>): Promise<JobApplication> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('job_applications').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteApplication(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('job_applications').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}
