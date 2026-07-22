import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getExperienceItem, createExperienceItem, updateExperienceItem } from '../../../lib/admin/experiencia';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

interface FormData { text: string; order_index: number; active: boolean; }
interface FormErrors { text?: string; }

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.text.trim()) errors.text = 'El texto es obligatorio';
  return errors;
}

export function ExperienceForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({ text: '', order_index: 0, active: true });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const item = await getExperienceItem(id);
        setFormData({ text: item.text, order_index: item.order_index, active: item.active });
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/experience');
      } finally { setLoading(false); }
    })();
  }, [id, navigate, notify]);

  if (loading) return <LoadingSpinner />;

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
      const payload = { text: formData.text.trim(), order_index: formData.order_index, active: formData.active };
      if (isEdit) { await updateExperienceItem(id!, payload); notify({ type: 'success', message: 'Elemento actualizado' }); }
      else { await createExperienceItem(payload); notify({ type: 'success', message: 'Elemento creado' }); }
      navigate('/admin/experience');
    } catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Elemento de Experiencia' : 'Nuevo Elemento de Experiencia'} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormTextarea label="Texto" value={formData.text} onChange={(v) => handleChange('text', v)} error={errors.text} required rows={3} />
        <FormField label="Índice de orden" required>
          <input type="number" value={formData.order_index} onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
            className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormField label="Estado">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500" />
            <span className="text-sm text-gray-700">Activo</span>
          </label>
        </FormField>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </button>
          <button type="button" onClick={() => navigate('/admin/experience')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
