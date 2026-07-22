import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormSelect } from '../../../components/admin/common/Form/FormSelect';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { FormImageUpload } from '../../../components/admin/common/Form/FormImageUpload';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getNews, createNews, updateNews, generateSlug } from '../../../lib/admin/news';
import { uploadImage, deleteImage, getPublicImageUrl } from '../../../lib/storage';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

const CATEGORY_OPTIONS = [
  { value: 'Agricultura', label: 'Agricultura' },
  { value: 'Ganadería', label: 'Ganadería' },
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Eventos', label: 'Eventos' },
  { value: 'Capacitación', label: 'Capacitación' },
  { value: 'General', label: 'General' },
];

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featured: boolean;
  published_at: string;
  active: boolean;
  image_url: string | null;
}

interface FormErrors {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  author?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = 'El título es obligatorio';
  if (!data.slug.trim()) errors.slug = 'El slug es obligatorio';
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) errors.slug = 'Solo letras minúsculas, números y guiones';
  if (!data.excerpt.trim()) errors.excerpt = 'El extracto es obligatorio';
  if (!data.content.trim()) errors.content = 'El contenido es obligatorio';
  if (!data.category) errors.category = 'La categoría es obligatoria';
  if (!data.author.trim()) errors.author = 'El autor es obligatorio';
  return errors;
}

export function NewsForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const fileToUpload = useRef<File | null>(null);
  const slugEdited = useRef(false);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '', slug: '', excerpt: '', content: '',
    category: 'General', author: '', featured: false,
    published_at: '', active: true, image_url: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const news = await getNews(id);
        setFormData({
          title: news.title, slug: news.slug, excerpt: news.excerpt,
          content: news.content, category: news.category, author: news.author,
          featured: news.featured,
          published_at: news.published_at ? news.published_at.slice(0, 16) : '',
          active: news.active, image_url: news.image_url,
        });
        if (news.image_url) setExistingImage(getPublicImageUrl(news.image_url));
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/news');
      } finally { setLoading(false); }
    })();
  }, [id, navigate, notify]);

  const handleChange = useCallback((field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugEdited.current && !isEdit) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, [isEdit]);

  const handleSlugChange = useCallback((value: string) => {
    slugEdited.current = true;
    handleChange('slug', value);
  }, [handleChange]);

  if (loading) return <LoadingSpinner />;

  const handleImageUpload = async (file: File) => {
    fileToUpload.current = file;
    if (!isEdit) {
      notify({ type: 'info', message: 'La imagen se subirá después de crear la noticia' });
      return;
    }
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `news/${id}/image.${ext}`;
      if (formData.image_url) {
        await deleteImage(formData.image_url);
      }
      await uploadImage(file, path);
      handleChange('image_url', path);
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

    setSaving(true);
    try {
      const publishedAt = formData.published_at
        ? new Date(formData.published_at).toISOString()
        : null;

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        author: formData.author.trim(),
        featured: formData.featured,
        published_at: publishedAt,
        active: formData.active,
        image_url: formData.image_url,
      };

      if (isEdit) {
        await updateNews(id!, payload);
        notify({ type: 'success', message: 'Noticia actualizada' });
      } else {
        const created = await createNews(payload);
        if (fileToUpload.current) {
          const ext = fileToUpload.current.name.split('.').pop();
          const path = `news/${created.id}/image.${ext}`;
          try {
            await uploadImage(fileToUpload.current, path);
            await updateNews(created.id, { image_url: path });
          } catch {
            notify({ type: 'warning', message: 'Noticia creada, pero la imagen no pudo subirse. Puedes agregarla editando la noticia.' });
          }
        }
        notify({ type: 'success', message: 'Noticia creada' });
      }
      navigate('/admin/news');
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Noticia' : 'Nueva Noticia'} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormField label="Título" error={errors.title} required>
          <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </FormField>
        <FormField label="Slug" error={errors.slug} required>
          <input type="text" value={formData.slug} onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-xs" />
        </FormField>
        <FormTextarea label="Extracto" value={formData.excerpt} onChange={(v) => handleChange('excerpt', v)} error={errors.excerpt} required rows={3} />
        <FormField label="Contenido" error={errors.content} required>
          <textarea value={formData.content} onChange={(e) => handleChange('content', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" rows={10} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Categoría" value={formData.category} onChange={(v) => handleChange('category', v)} options={CATEGORY_OPTIONS} />
          <FormField label="Autor" error={errors.author} required>
            <input type="text" value={formData.author} onChange={(e) => handleChange('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
        </div>
        <FormImageUpload
          label="Imagen destacada"
          currentUrl={existingImage}
          onUpload={handleImageUpload}
          uploading={uploadingImage}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Publicado el">
            <input type="datetime-local" value={formData.published_at}
              onChange={(e) => handleChange('published_at', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <div className="flex items-end gap-4 pb-2">
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
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Noticia' : 'Crear Noticia')}
          </button>
          <button type="button" onClick={() => navigate('/admin/news')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
