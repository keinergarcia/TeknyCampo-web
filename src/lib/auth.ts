import { supabase } from './supabase';
import { AppError, handleSupabaseError } from './errors';

function requireSupabase() {
  if (!supabase) throw new AppError('Supabase no está configurado. Verifique el archivo .env', 'CONFIG_ERROR');
  return supabase;
}

export async function loginAdmin(email: string, password: string) {
  const sb = requireSupabase();

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw handleSupabaseError(error);

  const { data: isAdmin, error: rpcError } = await sb.rpc('is_admin');
  if (rpcError) throw handleSupabaseError(rpcError);

  if (!isAdmin) {
    await sb.auth.signOut();
    throw new AppError(
      'Acceso denegado. No tienes permisos de administrador.',
      'FORBIDDEN'
    );
  }

  return data;
}

export async function logoutAdmin() {
  const sb = requireSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw handleSupabaseError(error);
}

export async function checkIsAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function resetPassword(email: string) {
  const sb = requireSupabase();

  const basePath = import.meta.env.VITE_BASE_PATH || '';
  const redirectTo = `${window.location.origin}${basePath}/admin/update-password`;

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw handleSupabaseError(error);
}

export async function updateAdminPassword(newPassword: string) {
  const sb = requireSupabase();

  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw handleSupabaseError(error);
}
