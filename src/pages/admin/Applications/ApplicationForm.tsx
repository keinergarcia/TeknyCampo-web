import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getApplication, updateApplication } from '../../../lib/admin/jobs';
import { getSignedDocumentUrl } from '../../../lib/storage';
import { getErrorMessage } from '../../../lib/errors';
import type { JobApplication } from '../../../types/admin';
import { useNotifications } from '../../../hooks/useNotifications';

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'revisado', label: 'Revisado' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'contratado', label: 'Contratado' },
];

interface FormData {
  status: string;
  notes: string;
}

export function ApplicationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<{
    nombre: string;
    email: string;
    telefono: string;
    cedula: string | null;
    cargo: string;
    mensaje: string | null;
    cv_url: string | null;
    job_title?: string;
    status: string;
    notes: string;
    created_at: string;
  } | null>(null);
  const [formData, setFormData] = useState<FormData>({ status: 'pendiente', notes: '' });
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const app = await getApplication(id);
        setApplication({
          nombre: app.nombre,
          email: app.email,
          telefono: app.telefono,
          cedula: app.cedula,
          cargo: app.cargo,
          mensaje: app.mensaje,
          cv_url: app.cv_url,
          job_title: (app as JobApplication & { jobs?: { title: string } }).jobs?.title,
          status: app.status,
          notes: app.notes || '',
          created_at: app.created_at,
        });
        setFormData({ status: app.status, notes: app.notes || '' });
        setCvUrl(app.cv_url);
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/applications');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, notify]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateApplication(id!, { status: formData.status, notes: formData.notes.trim() || null });
      notify({ type: 'success', message: 'Postulación actualizada correctamente' });
      navigate('/admin/applications');
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleViewCv = async () => {
    if (!cvUrl) return;
    try {
      const signedUrl = await getSignedDocumentUrl(cvUrl);
      if (signedUrl) window.open(signedUrl, '_blank');
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!application) return null;

  return (
    <div>
      <PageHeader
        title={`Postulación: ${application.nombre}`}
        description={`Recibida el ${new Date(application.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <FormField label="Nombre">
            <p className="text-sm text-gray-900">{application.nombre}</p>
          </FormField>
          <FormField label="Email">
            <a href={`mailto:${application.email}`} className="text-sm text-green-700 hover:underline">{application.email}</a>
          </FormField>
          <FormField label="Teléfono">
            <a href={`tel:${application.telefono}`} className="text-sm text-green-700 hover:underline">{application.telefono}</a>
          </FormField>
          <FormField label="Cédula">
            <p className="text-sm text-gray-900">{application.cedula || 'No registrada'}</p>
          </FormField>
          <FormField label="Cargo">
            <p className="text-sm text-gray-900">{application.cargo}</p>
          </FormField>
          <FormField label="Vacante asociada">
            <p className="text-sm text-gray-900">{application.job_title || 'Postulación espontánea'}</p>
          </FormField>
        </div>

        {application.mensaje && (
          <FormField label="Mensaje del candidato">
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{application.mensaje}</p>
          </FormField>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <FormField label="Hoja de Vida (CV)">
            <div className="flex items-center gap-3">
              {cvUrl ? (
                <button type="button" onClick={handleViewCv} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Ver CV
                </button>
              ) : (
                <span className="text-sm text-gray-500">Sin CV adjunto</span>
              )}
            </div>
          </FormField>
        </div>

        <FormSelect
          label="Estado"
          value={formData.status}
          onChange={(v) => handleChange('status', v)}
          options={STATUS_OPTIONS}
        />

        <FormTextarea
          label="Notas internas (solo visible para administradores)"
          value={formData.notes}
          onChange={(v) => handleChange('notes', v)}
          rows={4}
        />

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/applications')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
