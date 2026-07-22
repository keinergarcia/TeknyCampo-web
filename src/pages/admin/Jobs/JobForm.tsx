import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getJob, createJob, updateJob } from '../../../lib/admin/jobs';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

const TYPE_OPTIONS = [
  { value: 'Tiempo completo', label: 'Tiempo completo' },
  { value: 'Medio tiempo', label: 'Medio tiempo' },
  { value: 'Por proyecto', label: 'Por proyecto' },
  { value: 'Prácticas', label: 'Prácticas' },
];

interface FormData {
  title: string;
  type: string;
  location: string;
  description: string;
  order_index: number;
  active: boolean;
}

interface FormErrors {
  title?: string;
  type?: string;
  location?: string;
  description?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = 'El título es obligatorio';
  if (!data.type) errors.type = 'Selecciona un tipo';
  if (!data.location.trim()) errors.location = 'La ubicación es obligatoria';
  if (!data.description.trim()) errors.description = 'La descripción es obligatoria';
  return errors;
}

export function JobForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: 'Tiempo completo',
    location: '',
    description: '',
    order_index: 0,
    active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const job = await getJob(id);
        setFormData({
          title: job.title,
          type: job.type,
          location: job.location,
          description: job.description,
          order_index: job.order_index,
          active: job.active,
        });
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/jobs');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, notify]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(formData);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        location: formData.location.trim(),
        description: formData.description.trim(),
        order_index: formData.order_index,
        active: formData.active,
      };

      if (isEdit) {
        await updateJob(id!, payload);
        notify({ type: 'success', message: 'Vacante actualizada correctamente' });
      } else {
        await createJob(payload);
        notify({ type: 'success', message: 'Vacante creada correctamente' });
      }
      navigate('/admin/jobs');
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Vacante' : 'Nueva Vacante'}
        description={isEdit ? `Editando: ${formData.title}` : undefined}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormField label="Título" error={errors.title} required>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Tipo"
            value={formData.type}
            onChange={(v) => handleChange('type', v)}
            options={TYPE_OPTIONS}
            error={errors.type}
          />
          <FormField label="Ubicación" error={errors.location} required>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </FormField>
        </div>

        <FormTextarea
          label="Descripción"
          value={formData.description}
          onChange={(v) => handleChange('description', v)}
          error={errors.description}
          required
          rows={6}
        />

        <FormField label="Índice de orden" required>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
            className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </FormField>

        <FormField label="Estado">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Vacante abierta</span>
          </label>
        </FormField>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Vacante' : 'Crear Vacante')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/jobs')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
