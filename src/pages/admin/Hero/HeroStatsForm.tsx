import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getHeroStat, createHeroStat, updateHeroStat } from '../../../lib/admin/hero-stats';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

interface FormData {
  value: string;
  label: string;
  order_index: number;
  active: boolean;
}

interface FormErrors {
  value?: string;
  label?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.value.trim()) errors.value = 'El valor es obligatorio';
  if (!data.label.trim()) errors.label = 'La etiqueta es obligatoria';
  return errors;
}

export function HeroStatsForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    value: '',
    label: '',
    order_index: 0,
    active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const stat = await getHeroStat(id);
        setFormData({
          value: stat.value,
          label: stat.label,
          order_index: stat.order_index,
          active: stat.active,
        });
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/hero');
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
        value: formData.value.trim(),
        label: formData.label.trim(),
        order_index: formData.order_index,
        active: formData.active,
      };

      if (isEdit) {
        await updateHeroStat(id!, payload);
        notify({ type: 'success', message: 'Estadística actualizada correctamente' });
      } else {
        await createHeroStat(payload);
        notify({ type: 'success', message: 'Estadística creada correctamente' });
      }
      navigate('/admin/hero');
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
        title={isEdit ? 'Editar Estadística' : 'Nueva Estadística'}
        description={isEdit ? `Editando: ${formData.label}` : undefined}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormField label="Valor" error={errors.value} required>
          <input
            type="text"
            value={formData.value}
            onChange={(e) => handleChange('value', e.target.value)}
            className="w-full max-w-[160px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: 10+"
          />
        </FormField>

        <FormField label="Etiqueta" error={errors.label} required>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: Años de experiencia"
          />
        </FormField>

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
            <span className="text-sm text-gray-700">Activo</span>
          </label>
        </FormField>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Estadística' : 'Crear Estadística')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/hero')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
