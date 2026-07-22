import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getService, createService, updateService } from '../../../lib/admin/services';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

const ICON_OPTIONS = [
  { value: 'Wheat', label: 'Trigo' },
  { value: 'Sprout', label: 'Brote' },
  { value: 'Beef', label: 'Ganado' },
  { value: 'GraduationCap', label: 'Capacitación' },
  { value: 'Leaf', label: 'Hoja' },
  { value: 'Trees', label: 'Árboles' },
  { value: 'Droplets', label: 'Gotas' },
  { value: 'Sun', label: 'Sol' },
];

const COLOR_OPTIONS = [
  { value: 'amber', label: 'Ámbar' },
  { value: 'green', label: 'Verde' },
  { value: 'orange', label: 'Naranja' },
  { value: 'blue', label: 'Azul' },
];

interface FormData {
  title: string;
  description: string;
  icon_name: string;
  color_scheme: string;
  order_index: number;
  active: boolean;
  features: string[];
  store_url: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  icon_name?: string;
  color_scheme?: string;
  features?: string;
  store_url?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = 'El título es obligatorio';
  if (!data.description.trim()) errors.description = 'La descripción es obligatoria';
  if (!data.icon_name) errors.icon_name = 'Selecciona un icono';
  if (!data.color_scheme) errors.color_scheme = 'Selecciona un esquema de color';
  if (data.features.length === 0 || data.features.every((f) => !f.trim())) {
    errors.features = 'Agrega al menos una característica';
  }
  return errors;
}

export function ServiceForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    icon_name: 'Wheat',
    color_scheme: 'amber',
    order_index: 0,
    active: true,
    features: [''],
    store_url: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const service = await getService(id);
        setFormData({
          title: service.title,
          description: service.description,
          icon_name: service.icon_name,
          color_scheme: service.color_scheme,
          order_index: service.order_index,
          active: service.active,
          features: service.features.length > 0 ? service.features : [''],
          store_url: service.store_url || '',
        });
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/services');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, notify]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
    setErrors((prev) => ({ ...prev, features: undefined }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
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
        description: formData.description.trim(),
        icon_name: formData.icon_name,
        color_scheme: formData.color_scheme,
        order_index: formData.order_index,
        active: formData.active,
        features: formData.features.filter((f) => f.trim()),
        store_url: formData.store_url.trim() || null,
      };

      if (isEdit) {
        await updateService(id!, payload);
        notify({ type: 'success', message: 'Servicio actualizado correctamente' });
      } else {
        await createService(payload);
        notify({ type: 'success', message: 'Servicio creado correctamente' });
      }
      navigate('/admin/services');
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
        title={isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
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
          rows={4}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Icono"
            value={formData.icon_name}
            onChange={(v) => handleChange('icon_name', v)}
            options={ICON_OPTIONS}
            error={errors.icon_name}
          />
          <FormSelect
            label="Esquema de color"
            value={formData.color_scheme}
            onChange={(v) => handleChange('color_scheme', v)}
            options={COLOR_OPTIONS}
            error={errors.color_scheme}
          />
        </div>

        <FormField label="Índice de orden" required>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
            className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </FormField>

        <FormField label="Enlace a tienda">
          <input
            type="url"
            value={formData.store_url}
            onChange={(e) => handleChange('store_url', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </FormField>

        <FormField label="Características" error={errors.features} required>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder={`Característica ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    aria-label={`Eliminar característica ${index + 1}`}
                    className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-sm text-green-700 hover:text-green-800"
            >
              + Agregar característica
            </button>
          </div>
        </FormField>

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
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Servicio' : 'Crear Servicio')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
