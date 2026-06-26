import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function submitContact(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}) {
  if (!supabase) {
    console.warn('Supabase no configurado. Datos del formulario:', data);
    return { error: null };
  }
  const { error } = await supabase.from('contactos').insert([data]);
  return { error };
}

export async function submitApplication(data: {
  nombre: string;
  email: string;
  telefono: string;
  cargo: string;
  mensaje: string;
  archivo?: File | null;
}) {
  if (!supabase) {
    console.warn('Supabase no configurado. Datos de postulación:', {
      ...data,
      archivo: data.archivo ? data.archivo.name : null,
    });
    return { error: null };
  }

  let archivoUrl: string | null = null;

  if (data.archivo) {
    const fileName = `${Date.now()}_${data.archivo.name}`;
    const { error: uploadError } = await supabase.storage
      .from('postulaciones')
      .upload(fileName, data.archivo);

    if (uploadError) {
      return { error: uploadError };
    }

    const { data: urlData } = supabase.storage
      .from('postulaciones')
      .getPublicUrl(fileName);

    archivoUrl = urlData?.publicUrl || null;
  }

  const { error } = await supabase.from('postulaciones').insert([{
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    cargo: data.cargo,
    mensaje: data.mensaje,
    archivo_url: archivoUrl,
  }]);

  return { error };
}
