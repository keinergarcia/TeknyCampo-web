import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { FormImageUpload } from '../../../components/admin/common/Form/FormImageUpload';
import { FormFileUpload } from '../../../components/admin/common/Form/FormFileUpload';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getTraining, createTraining, updateTraining } from '../../../lib/admin/trainings';
import { uploadImage, deleteImage, uploadDocument, deleteDocument, getPublicImageUrl } from '../../../lib/storage';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

const MODALITY_OPTIONS = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hibrida', label: 'Híbrida' },
];

interface CurriculumItemForm {
  title: string;
  duration: string;
  topics: string[];
}

interface FormData {
  title: string;
  description: string;
  content: string;
  instructor: string;
  modality: string;
  duration: string;
  schedule: string;
  location: string;
  start_date: string;
  end_date: string;
  price: string;
  max_participants: string;
  curriculum: CurriculumItemForm[];
  requirements: string[];
  certificate: boolean;
  featured: boolean;
  order_index: number;
  active: boolean;
  image_url: string | null;
  brochure_url: string | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  end_date?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = 'El título es obligatorio';
  if (!data.description.trim()) errors.description = 'La descripción es obligatoria';
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    errors.end_date = 'La fecha de fin debe ser posterior o igual a la de inicio';
  }
  return errors;
}

export function TrainingForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const imageFile = useRef<File | null>(null);
  const brochureFile = useRef<File | null>(null);
  // Tracking refs for safe storage rollback
  const pendingDeleteImages = useRef<string[]>([]);
  const pendingDeleteBrochures = useRef<string[]>([]);
  const uploadedNewImagePaths = useRef<string[]>([]);
  const uploadedNewBrochurePaths = useRef<string[]>([]);
  const originalImageUrl = useRef<string | null>(null);
  const originalBrochureUrl = useRef<string | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [reqInput, setReqInput] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '', description: '', content: '', instructor: '',
    modality: 'presencial', duration: '', schedule: '', location: '',
    start_date: '', end_date: '', price: '', max_participants: '',
    curriculum: [], requirements: [], certificate: false,
    featured: false, order_index: 0, active: true,
    image_url: null, brochure_url: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const t = await getTraining(id);
        setFormData({
          title: t.title, description: t.description, content: t.content ?? '',
          instructor: t.instructor ?? '', modality: t.modality,
          duration: t.duration ?? '', schedule: t.schedule ?? '', location: t.location ?? '',
          start_date: t.start_date ?? '', end_date: t.end_date ?? '',
          price: t.price !== null ? String(t.price) : '',
          max_participants: t.max_participants !== null ? String(t.max_participants) : '',
          curriculum: (t.curriculum ?? []).map((m) => ({ title: m.title, duration: m.duration, topics: m.topics })),
          requirements: t.requirements ?? [],
          certificate: t.certificate, featured: t.featured,
          order_index: t.order_index, active: t.active,
          image_url: t.image_url, brochure_url: t.brochure_url,
        });
        if (t.image_url) setExistingImage(getPublicImageUrl(t.image_url));
        originalImageUrl.current = t.image_url;
        originalBrochureUrl.current = t.brochure_url;
        pendingDeleteImages.current = [];
        pendingDeleteBrochures.current = [];
        uploadedNewImagePaths.current = [];
        uploadedNewBrochurePaths.current = [];
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/trainings');
      } finally { setLoading(false); }
    })();
  }, [id, navigate, notify]);

  const handleChange = useCallback((field: keyof FormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, end_date: undefined }));
  }, []);

  const handleAddRequirement = useCallback(() => {
    const v = reqInput.trim();
    if (!v) return;
    setFormData((prev) => ({ ...prev, requirements: [...prev.requirements, v] }));
    setReqInput('');
  }, [reqInput]);

  const handleRemoveRequirement = useCallback((idx: number) => {
    setFormData((prev) => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== idx) }));
  }, []);

  const handleAddModule = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      curriculum: [...prev.curriculum, { title: '', duration: '', topics: [] }],
    }));
  }, []);

  const handleRemoveModule = useCallback((idx: number) => {
    setFormData((prev) => ({ ...prev, curriculum: prev.curriculum.filter((_, i) => i !== idx) }));
  }, []);

  const handleModuleChange = useCallback((idx: number, field: keyof CurriculumItemForm, value: string) => {
    setFormData((prev) => {
      const curriculum = [...prev.curriculum];
      curriculum[idx] = { ...curriculum[idx], [field]: value };
      return { ...prev, curriculum };
    });
  }, []);

  const handleAddTopic = useCallback((modIdx: number) => {
    setFormData((prev) => {
      const curriculum = [...prev.curriculum];
      curriculum[modIdx] = { ...curriculum[modIdx], topics: [...curriculum[modIdx].topics, ''] };
      return { ...prev, curriculum };
    });
  }, []);

  const handleTopicChange = useCallback((modIdx: number, topicIdx: number, value: string) => {
    setFormData((prev) => {
      const curriculum = [...prev.curriculum];
      const topics = [...curriculum[modIdx].topics];
      topics[topicIdx] = value;
      curriculum[modIdx] = { ...curriculum[modIdx], topics };
      return { ...prev, curriculum };
    });
  }, []);

  const handleRemoveTopic = useCallback((modIdx: number, topicIdx: number) => {
    setFormData((prev) => {
      const curriculum = [...prev.curriculum];
      curriculum[modIdx] = { ...curriculum[modIdx], topics: curriculum[modIdx].topics.filter((_, i) => i !== topicIdx) };
      return { ...prev, curriculum };
    });
  }, []);

  const handleImageUpload = async (file: File) => {
    imageFile.current = file;
    if (!isEdit) { notify({ type: 'info', message: 'La imagen se subirá después de crear la capacitación' }); return; }
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `trainings/${id}/image.${ext}`;
      await uploadImage(file, path);
      if (formData.image_url) {
        pendingDeleteImages.current.push(formData.image_url);
      }
      uploadedNewImagePaths.current.push(path);
      setFormData((prev) => ({ ...prev, image_url: path }));
      notify({ type: 'success', message: 'Imagen subida correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally { setUploadingImage(false); }
  };

  const handleBrochureUpload = async (file: File) => {
    brochureFile.current = file;
    if (!isEdit) { notify({ type: 'info', message: 'El brochure se subirá después de crear la capacitación' }); return; }
    setUploadingBrochure(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `documents/trainings/${id}/brochure.${ext}`;
      await uploadDocument(file, path);
      if (formData.brochure_url) {
        pendingDeleteBrochures.current.push(formData.brochure_url);
      }
      uploadedNewBrochurePaths.current.push(path);
      setFormData((prev) => ({ ...prev, brochure_url: path }));
      notify({ type: 'success', message: 'Brochure subido correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally { setUploadingBrochure(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(formData);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim() || null,
        instructor: formData.instructor.trim() || null,
        modality: formData.modality,
        duration: formData.duration.trim() || null,
        schedule: formData.schedule.trim() || null,
        location: formData.location.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        price: formData.price ? parseFloat(formData.price) : null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants, 10) : null,
        curriculum: formData.curriculum.length > 0 ? formData.curriculum : null,
        requirements: formData.requirements.length > 0 ? formData.requirements : null,
        certificate: formData.certificate,
        featured: formData.featured,
        order_index: formData.order_index,
        active: formData.active,
      };

      if (isEdit) {
        await updateTraining(id!, payload);
        for (const p of pendingDeleteImages.current) {
          try { await deleteImage(p); } catch { /* ignore cleanup error */ }
        }
        for (const p of pendingDeleteBrochures.current) {
          try { await deleteDocument(p); } catch { /* ignore cleanup error */ }
        }
        pendingDeleteImages.current = [];
        pendingDeleteBrochures.current = [];
        uploadedNewImagePaths.current = [];
        uploadedNewBrochurePaths.current = [];
        notify({ type: 'success', message: 'Capacitación actualizada' });
        navigate('/admin/trainings');
      } else {
        const created = await createTraining(payload);
        let imageOk = true;
        let brochureOk = true;

        if (imageFile.current) {
          const ext = imageFile.current.name.split('.').pop();
          const imgPath = `trainings/${created.id}/image.${ext}`;
          try {
            await uploadImage(imageFile.current, imgPath);
            await updateTraining(created.id, { image_url: imgPath });
          } catch {
            try { await deleteImage(imgPath); } catch { /* cleanup orphan */ }
            imageOk = false;
            notify({ type: 'warning', message: 'Capacitación creada, pero la imagen no pudo subirse' });
          }
        }

        if (brochureFile.current) {
          const ext = brochureFile.current.name.split('.').pop();
          const docPath = `documents/trainings/${created.id}/brochure.${ext}`;
          try {
            await uploadDocument(brochureFile.current, docPath);
            await updateTraining(created.id, { brochure_url: docPath });
          } catch {
            try { await deleteDocument(docPath); } catch { /* cleanup orphan */ }
            brochureOk = false;
            notify({ type: 'warning', message: 'Capacitación creada, pero el brochure no pudo subirse' });
          }
        }

        if (imageOk && brochureOk) {
          notify({ type: 'success', message: 'Capacitación creada' });
        }
        navigate('/admin/trainings');
      }
    } catch (e) {
      for (const p of uploadedNewImagePaths.current) {
        try { await deleteImage(p); } catch { /* rollback cleanup */ }
      }
      for (const p of uploadedNewBrochurePaths.current) {
        try { await deleteDocument(p); } catch { /* rollback cleanup */ }
      }
      uploadedNewImagePaths.current = [];
      uploadedNewBrochurePaths.current = [];
      pendingDeleteImages.current = [];
      pendingDeleteBrochures.current = [];
      if (isEdit) {
        setFormData((prev) => ({
          ...prev,
          image_url: originalImageUrl.current,
          brochure_url: originalBrochureUrl.current,
        }));
      }
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Capacitación' : 'Nueva Capacitación'} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormField label="Título" error={errors.title} required>
          <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormTextarea label="Descripción" value={formData.description} onChange={(v) => handleChange('description', v)} error={errors.description} required rows={2} />
        <FormTextarea label="Contenido (extendido)" value={formData.content} onChange={(v) => handleChange('content', v)} rows={6} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Instructor">
            <input type="text" value={formData.instructor} onChange={(e) => handleChange('instructor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormSelect label="Modalidad" value={formData.modality} onChange={(v) => handleChange('modality', v)} options={MODALITY_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Duración">
            <input type="text" value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} placeholder="Ej: 4 semanas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormField label="Horario">
            <input type="text" value={formData.schedule} onChange={(e) => handleChange('schedule', e.target.value)} placeholder="Ej: Sábados 8am-12pm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
        </div>
        <FormField label="Ubicación">
          <input type="text" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Ej: Ocaña, Norte de Santander"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fecha de inicio">
            <input type="date" value={formData.start_date} onChange={(e) => handleChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormField label="Fecha de fin" error={errors.end_date}>
            <input type="date" value={formData.end_date} onChange={(e) => handleChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Precio (dejar vacío = gratuito)">
            <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => handleChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormField label="Máx. participantes (vacío = sin límite)">
            <input type="number" min="1" value={formData.max_participants} onChange={(e) => handleChange('max_participants', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
        </div>
        <FormImageUpload label="Imagen" currentUrl={existingImage} onUpload={handleImageUpload} uploading={uploadingImage} />
        <FormFileUpload
          label="Brochure (PDF)"
          currentName={formData.brochure_url ? formData.brochure_url.split('/').pop() : null}
          onUpload={handleBrochureUpload}
          uploading={uploadingBrochure}
          accept=".pdf,.doc,.docx"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Índice de orden" required>
            <input type="number" value={formData.order_index} onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
              className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <div className="flex items-end gap-4 pb-2">
            <FormField label="Certificado">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.certificate} onChange={(e) => handleChange('certificate', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500" />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
            </FormField>
            <FormField label="Destacada">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={(e) => handleChange('featured', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500" />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
            </FormField>
            <FormField label="Estado">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500" />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </FormField>
          </div>
        </div>

        {/* Requirements */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Requisitos</h3>
          <div className="flex items-center gap-2">
            <input type="text" value={reqInput} onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequirement(); } }}
              placeholder="Escribe un requisito y presiona Agregar"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <button type="button" onClick={handleAddRequirement}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Agregar</button>
          </div>
          {formData.requirements.length > 0 && (
            <ul className="space-y-1">
              {formData.requirements.map((req, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded text-sm">
                  <span>{req}</span>
                  <button type="button" onClick={() => handleRemoveRequirement(i)} aria-label={`Eliminar requisito ${i + 1}`} className="text-red-500 hover:text-red-700 text-xs ml-2">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Curriculum */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Módulos del Currículo</h3>
            <button type="button" onClick={handleAddModule}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">+ Agregar módulo</button>
          </div>
          {formData.curriculum.map((mod, mi) => (
            <div key={mi} className="border border-gray-100 rounded p-3 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Módulo {mi + 1}</span>
                <button type="button" onClick={() => handleRemoveModule(mi)} className="text-red-500 hover:text-red-700 text-xs">✕ Eliminar</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Título">
                  <input type="text" value={mod.title} onChange={(e) => handleModuleChange(mi, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </FormField>
                <FormField label="Duración">
                  <input type="text" value={mod.duration} onChange={(e) => handleModuleChange(mi, 'duration', e.target.value)} placeholder="Ej: 2 horas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </FormField>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Temas</span>
                  <button type="button" onClick={() => handleAddTopic(mi)} className="text-xs text-green-700 hover:text-green-800">+ Tema</button>
                </div>
                {mod.topics.map((topic, ti) => (
                  <div key={ti} className="flex items-center gap-2">
                    <input type="text" value={topic} onChange={(e) => handleTopicChange(mi, ti, e.target.value)}
                      placeholder={`Tema ${ti + 1}`}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    <button type="button" onClick={() => handleRemoveTopic(mi, ti)} aria-label={`Eliminar tema ${ti + 1}`} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Capacitación' : 'Crear Capacitación')}
          </button>
          <button type="button" onClick={() => navigate('/admin/trainings')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
