import { AppError, handleSupabaseError } from '../errors';
import type { AboutSection } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function listAboutSections(): Promise<AboutSection[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('about_sections').select('*').order('order_index', { ascending: true });
  if (error) throw handleSupabaseError(error);
  return data ?? [];
}

export async function updateAboutSection(id: string, data: Partial<AboutSection>): Promise<AboutSection> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('about_sections').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function toggleAboutSection(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('about_sections').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}
