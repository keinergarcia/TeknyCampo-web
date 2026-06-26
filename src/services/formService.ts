export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

export interface AffiliationDocument {
  nombre: string;
  archivo: File | null;
}

export interface AffiliationFormData {
  nombre: string;
  email: string;
  telefono: string;
  documentos: AffiliationDocument[];
}

const STORAGE_KEY = 'coopromu_submissions';

function saveToLocalStorage(type: string, data: unknown) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    stored.push({ type, data, timestamp: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage may be full or unavailable
  }
}

function openMailto(subject: string, body: string): Promise<void> {
  const mailto = `mailto:COOPROMU2022@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return Promise.resolve();
}

export async function submitContactForm(data: ContactFormData): Promise<void> {
  saveToLocalStorage('contact', data);

  const body = [
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.telefono}`,
    `Asunto: ${data.asunto}`,
    ``,
    `Mensaje:`,
    data.mensaje,
  ].join('\n');

  await openMailto(`Contacto COOPROMU: ${data.asunto}`, body);
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function submitAffiliationForm(data: AffiliationFormData): Promise<void> {
  saveToLocalStorage('affiliation', {
    ...data,
    documentos: data.documentos.map((d) => ({
      nombre: d.nombre,
      archivo: d.archivo ? `${d.archivo.name} (${(d.archivo.size / 1024).toFixed(1)} KB)` : 'No adjunto',
    })),
  });

  const docsList = data.documentos
    .map((d) => `  - ${d.nombre}: ${d.archivo ? d.archivo.name : 'No adjunto'}`)
    .join('\n');

  const body = [
    `Solicitud de afiliación - COOPROMU`,
    ``,
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.telefono}`,
    ``,
    `Documentos:`,
    docsList,
    ``,
    `---`,
    `IMPORTANTE: El protocolo mailto no soporta archivos adjuntos.`,
    `Por favor envíe los PDFs como respuesta a este correo o a COOPROMU2022@gmail.com`,
    `Indique en el asunto: "Documentos afiliación - ${data.nombre}"`,
  ].join('\n');

  await openMailto('Solicitud de afiliación COOPROMU', body);
  await new Promise((resolve) => setTimeout(resolve, 500));
}
