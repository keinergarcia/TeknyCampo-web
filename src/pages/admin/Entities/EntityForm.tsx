import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { FormImageUpload } from '../../../components/admin/common/Form/FormImageUpload';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getEntity, createEntity, updateEntity } from '../../../lib/admin/entities';
import { uploadImage, deleteImage, getPublicImageUrl } from '../../../lib/storage';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

const ICON_OPTIONS = [
  { value: 'Building2', label: 'Building2' },
  { value: 'Building', label: 'Building' },
  { value: 'Users', label: 'Users' },
  { value: 'GraduationCap', label: 'GraduationCap' },
  { value: 'Landmark', label: 'Landmark' },
  { value: 'ScrollText', label: 'ScrollText' },
  { value: 'Award', label: 'Award' },
  { value: 'Heart', label: 'Heart' },
];

interface FormData {
  name: string;
  full_name: string;
  description: string;
  icon_name: string;
  order_index: number;
  active: boolean;
  logo_url: string | null;
}

interface FormErrors {
  name?: string;
  full_name?: string;
  description?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = 'El nombre es obligatorio';
  if (!data.full_name.trim()) errors.full_name = 'El nombre completo es obligatorio';
  if (!data.description.trim()) errors.description = 'La descripción es obligatoria';
  return errors;
}

export function EntityForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const fileToUpload = useRef<File | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '', full_name: '', description: '', icon_name: 'Building2',
    order_index: 0, active: true, logo_url: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [existingLogo, setExistingLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const entity = await getEntity(id);
        setFormData({
          name: entity.name, full_name: entity.full_name, description: entity.description,
          icon_name: entity.icon_name, order_index: entity.order_index,
          active: entity.active, logo_url: entity.logo_url,
        });
        if (entity.logo_url) setExistingLogo(getPublicImageUrl(entity.logo_url));
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/entities');
      } finally { setLoading(false); }
    })();
  }, [id, navigate, notify]);

  if (loading) return <LoadingSpinner />;

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageUpload = async (file: File) => {
    fileToUpload.current = file;
    setUploadingImage(true);
    try {
      if (formData.logo_url) {
        await deleteImage(formData.logo_url);
      }
      const entityId = id ?? 'temp';
      const ext = file.name.split('.').pop();
      const path = `entities/${entityId}/logo.${ext}`;
      await uploadImage(file, path);
      handleChange('logo_url', path);
      notify({ type: 'success', message: 'Imagen subida correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(formData);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    if (fileToUpload.current && !id) {
      notify({ type: 'error', message: 'Crea primero la entidad y luego sube la imagen' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        full_name: formData.full_name.trim(),
        description: formData.description.trim(),
        icon_name: formData.icon_name,
        order_index: formData.order_index,
        active: formData.active,
        logo_url: formData.logo_url,
      };
      if (isEdit) {
        await updateEntity(id!, payload);
        notify({ type: 'success', message: 'Entidad actualizada' });
      } else {
        const created = await createEntity(payload);
        if (fileToUpload.current) {
          const ext = fileToUpload.current.name.split('.').pop();
          const path = `entities/${created.id}/logo.${ext}`;
          await uploadImage(fileToUpload.current, path);
          await updateEntity(created.id, { logo_url: path });
          notify({ type: 'success', message: 'Entidad creada con logo' });
        }
      }
      navigate('/admin/entities');
    } catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Entidad' : 'Nueva Entidad'} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormField label="Nombre" error={errors.name} required>
          <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormField label="Nombre completo" error={errors.full_name} required>
          <input type="text" value={formData.full_name} onChange={(e) => handleChange('full_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormTextarea label="Descripción" value={formData.description} onChange={(v) => handleChange('description', v)} error={errors.description} required rows={3} />
        <FormSelect label="Icono" value={formData.icon_name} onChange={(v) => handleChange('icon_name', v)} options={ICON_OPTIONS} />
        <FormField label="Índice de orden" required>
          <input type="number" value={formData.order_index} onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
            className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormImageUpload
          label="Logo"
          currentUrl={existingLogo}
          onUpload={handleImageUpload}
          uploading={uploadingImage}
        />
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
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Entidad' : 'Crear Entidad')}
          </button>
          <button type="button" onClick={() => navigate('/admin/entities')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
