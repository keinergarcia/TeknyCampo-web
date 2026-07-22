import { AppError, handleSupabaseError } from '../errors';
import type { SiteConfig, ContactInfo, SocialLink, ContactMessage, ListParams, ListResult } from '../../types/admin';
import { supabase } from '../supabase';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado. Verifique el archivo .env', 'CONFIG_ERROR');
  return supabase;
}

// ── SiteConfig ──────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('site_config').select('*').eq('id', 1).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('site_config').update(data).eq('id', 1).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

// ── ContactInfo ─────────────────────────────────────────────────

export async function listContactInfo(params: ListParams): Promise<ListResult<ContactInfo>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('contact_info').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`label.ilike.%${search}%,value.ilike.%${search}%`);
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

export async function getContactInfo(id: string): Promise<ContactInfo> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('contact_info').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function createContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('contact_info').insert(data).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function updateContactInfo(id: string, data: Partial<ContactInfo>): Promise<ContactInfo> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('contact_info').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteContactInfo(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('contact_info').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}

export async function toggleContactInfo(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('contact_info').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}

// ── SocialLinks ─────────────────────────────────────────────────

export async function createSocialLink(data: { platform: string; url: string }): Promise<SocialLink> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('social_links').insert([{ platform: data.platform, url: data.url, active: false }]).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function listSocialLinks(): Promise<SocialLink[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('social_links').select('*').order('platform', { ascending: true });
  if (error) throw handleSupabaseError(error);
  return data ?? [];
}

export async function updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('social_links').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function toggleSocialLink(id: string, active: boolean): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('social_links').update({ active }).eq('id', id);
  if (error) throw handleSupabaseError(error);
}

// ── Messages ────────────────────────────────────────────────────

export async function listMessages(params: ListParams): Promise<ListResult<ContactMessage>> {
  const sb = requireSupabase();
  const { page, pageSize, search, sortColumn, sortDirection } = params;
  let query = sb.from('contact_messages').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,asunto.ilike.%${search}%`);
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

export async function getMessage(id: string): Promise<ContactMessage> {
  const sb = requireSupabase();
  const { data, error } = await sb.from('contact_messages').select('*').eq('id', id).single();
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function updateMessage(id: string, data: Partial<ContactMessage>): Promise<ContactMessage> {
  const sb = requireSupabase();
  const { data: result, error } = await sb.from('contact_messages').update(data).eq('id', id).select().single();
  if (error) throw handleSupabaseError(error);
  return result;
}

export async function deleteMessage(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('contact_messages').delete().eq('id', id);
  if (error) throw handleSupabaseError(error);
}
