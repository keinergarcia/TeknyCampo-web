import { supabase } from './supabase';
import { AppError, handleSupabaseError } from './errors';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado.', 'CONFIG_ERROR');
  return supabase;
}

export async function uploadImage(file: File, path: string) {
  const sb = requireSupabase();
  const { error } = await sb.storage.from('images').upload(path, file, {
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw handleSupabaseError(error);
}

export async function uploadDocument(file: File, path: string) {
  const sb = requireSupabase();
  const { error } = await sb.storage.from('documents').upload(path, file, {
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw handleSupabaseError(error);
}

export function getPublicImageUrl(path: string): string {
  if (!supabase) return '';
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedDocumentUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const sb = requireSupabase();
  const { data, error } = await sb.storage.from('documents').createSignedUrl(path, expiresIn);
  if (error) throw handleSupabaseError(error);
  return data.signedUrl;
}

export async function deleteImage(path: string) {
  const sb = requireSupabase();
  const { error } = await sb.storage.from('images').remove([path]);
  if (error) throw handleSupabaseError(error);
}

export async function deleteDocument(path: string) {
  const sb = requireSupabase();
  const { error } = await sb.storage.from('documents').remove([path]);
  if (error) throw handleSupabaseError(error);
}

export async function listImages(folder?: string) {
  const sb = requireSupabase();
  const { data, error } = await sb.storage.from('images').list(folder || '');
  if (error) throw handleSupabaseError(error);
  return data;
}

export async function listDocuments(folder?: string) {
  const sb = requireSupabase();
  const { data, error } = await sb.storage.from('documents').list(folder || '');
  if (error) throw handleSupabaseError(error);
  return data;
}
