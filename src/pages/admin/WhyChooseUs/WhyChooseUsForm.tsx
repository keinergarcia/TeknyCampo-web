import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getWhyChooseUs, createWhyChooseUs, updateWhyChooseUs } from '../../../lib/admin/why-choose-us';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

const ICON_OPTIONS = [
  { value: 'Users', label: 'Usuarios' },
  { value: 'Award', label: 'Premio' },
  { value: 'TrendingUp', label: 'Crecimiento' },
  { value: 'Heart', label: 'Corazón' },
  { value: 'Wheat', label: 'Trigo' },
  { value: 'Sprout', label: 'Brote' },
  { value: 'Beef', label: 'Ganado' },
  { value: 'GraduationCap', label: 'Capacitación' },
  { value: 'Leaf', label: 'Hoja' },
  { value: 'Trees', label: 'Árboles' },
  { value: 'Droplets', label: 'Gotas' },
  { value: 'Sun', label: 'Sol' },
  { value: 'Shield', label: 'Escudo' },
  { value: 'Star', label: 'Estrella' },
  { value: 'Zap', label: 'Rayo' },
];

interface FormData {
  icon_name: string;
  title: string;
  description: string;
  order_index: number;
  active: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  icon_name?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = 'El título es obligatorio';
  if (!data.description.trim()) errors.description = 'La descripción es obligatoria';
  if (!data.icon_name) errors.icon_name = 'Selecciona un icono';
  return errors;
}

export function WhyChooseUsForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    icon_name: 'Award',
    title: '',
    description: '',
    order_index: 0,
    active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const item = await getWhyChooseUs(id);
        setFormData({
          icon_name: item.icon_name,
          title: item.title,
          description: item.description,
          order_index: item.order_index,
          active: item.active,
        });
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/why-choose-us');
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
        icon_name: formData.icon_name,
        title: formData.title.trim(),
        description: formData.description.trim(),
        order_index: formData.order_index,
        active: formData.active,
      };

      if (isEdit) {
        await updateWhyChooseUs(id!, payload);
        notify({ type: 'success', message: 'Elemento actualizado correctamente' });
      } else {
        await createWhyChooseUs(payload);
        notify({ type: 'success', message: 'Elemento creado correctamente' });
      }
      navigate('/admin/why-choose-us');
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
        title={isEdit ? 'Editar Elemento' : 'Nuevo Elemento'}
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

        <FormTextarea
          label="Descripción"
          value={formData.description}
          onChange={(v) => handleChange('description', v)}
          error={errors.description}
          required
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Icono"
            value={formData.icon_name}
            onChange={(v) => handleChange('icon_name', v)}
            options={ICON_OPTIONS}
            error={errors.icon_name}
          />
          <FormField label="Índice de orden" required>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
              className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </FormField>
        </div>

        <FormField label="Estado">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Activo</span>
          </label>
        </FormField>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Elemento' : 'Crear Elemento')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/why-choose-us')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
