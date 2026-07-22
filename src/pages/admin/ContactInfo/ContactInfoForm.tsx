import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getContactInfo, createContactInfo, updateContactInfo } from '../../../lib/admin/config';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

const ICON_OPTIONS = [
  { value: 'Phone', label: 'Teléfono' },
  { value: 'Mail', label: 'Email' },
  { value: 'MapPin', label: 'Ubicación' },
  { value: 'Clock', label: 'Horario' },
  { value: 'Globe', label: 'Web' },
  { value: 'MessageSquare', label: 'Mensaje' },
];

interface FormData {
  label: string;
  value: string;
  detail: string;
  icon_name: string;
  order_index: number;
  active: boolean;
}

interface FormErrors {
  label?: string;
  value?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.label.trim()) errors.label = 'La etiqueta es obligatoria';
  if (!data.value.trim()) errors.value = 'El valor es obligatorio';
  return errors;
}

export function ContactInfoForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    label: '', value: '', detail: '', icon_name: 'Phone', order_index: 0, active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const item = await getContactInfo(id);
        setFormData({
          label: item.label, value: item.value, detail: item.detail || '',
          icon_name: item.icon_name, order_index: item.order_index, active: item.active,
        });
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/contact-info');
      } finally { setLoading(false); }
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
        label: formData.label.trim(), value: formData.value.trim(),
        detail: formData.detail.trim() || null, icon_name: formData.icon_name,
        order_index: formData.order_index, active: formData.active,
      };
      if (isEdit) { await updateContactInfo(id!, payload); notify({ type: 'success', message: 'Item actualizado correctamente' }); }
      else { await createContactInfo(payload); notify({ type: 'success', message: 'Item creado correctamente' }); }
      navigate('/admin/contact-info');
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Item de Contacto' : 'Nuevo Item de Contacto'} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Etiqueta" error={errors.label} required>
            <input type="text" value={formData.label} onChange={(e) => handleChange('label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormSelect label="Icono" value={formData.icon_name} onChange={(v) => handleChange('icon_name', v)} options={ICON_OPTIONS} />
        </div>
        <FormField label="Valor" error={errors.value} required>
          <input type="text" value={formData.value} onChange={(e) => handleChange('value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormField label="Detalle (opcional)">
          <input type="text" value={formData.detail} onChange={(e) => handleChange('detail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormField label="Índice de orden">
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
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Item' : 'Crear Item')}
          </button>
          <button type="button" onClick={() => navigate('/admin/contact-info')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
