import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { ErrorState } from '../../../components/admin/common/ErrorState';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { useAboutSections } from '../../../hooks/admin/useAboutSections';
import { useNotifications } from '../../../hooks/useNotifications';
import { getErrorMessage } from '../../../lib/errors';
import { uploadImage, getPublicImageUrl } from '../../../lib/storage';
import type { AboutSection } from '../../../types/admin';

const SECTION_KEY_LABELS: Record<string, string> = {
  historia: 'Historia',
  mision: 'Misión',
  vision: 'Visión',
  objetivos: 'Objetivo General',
  valores: 'Valores Corporativos',
};

export function AboutSectionList() {
  const { notify } = useNotifications();
  const { sections, loading, error, saving, reload, handleUpdate, handleToggle } = useAboutSections();

  const [editing, setEditing] = useState<Record<string, Partial<AboutSection>>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (sections.length > 0 && !initialized.current) {
      const initial: Record<string, Partial<AboutSection>> = {};
      sections.forEach((s) => {
        initial[s.id] = { title: s.title, content: s.content, order_index: s.order_index, image_url: s.image_url };
      });
      setEditing(initial);
      initialized.current = true;
    }
  }, [sections]);

  const handleFieldChange = (id: string, field: string, value: string | number) => {
    setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleImageUpload = async (section: AboutSection, file: File) => {
    setUploading((prev) => ({ ...prev, [section.id]: true }));
    try {
      const ext = file.name.split('.').pop();
      const path = `about/${section.section_key}.${ext}`;
      await uploadImage(file, path);
      setEditing((prev) => ({ ...prev, [section.id]: { ...prev[section.id], image_url: path } }));
      notify({ type: 'success', message: 'Imagen subida correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally {
      setUploading((prev) => ({ ...prev, [section.id]: false }));
    }
  };

  const saveSection = async (section: AboutSection) => {
    const changes = editing[section.id];
    if (!changes) return;

    const payload: Partial<AboutSection> = {};
    if (changes.title !== section.title) payload.title = (changes.title as string).trim();
    if (changes.content !== section.content) payload.content = (changes.content as string).trim();
    if (changes.order_index !== section.order_index) payload.order_index = changes.order_index;
    if (changes.image_url !== section.image_url) payload.image_url = changes.image_url;

    if (Object.keys(payload).length === 0) {
      notify({ type: 'info', message: 'No hay cambios para guardar' });
      return;
    }

    try {
      await handleUpdate(section.id, payload);
      notify({ type: 'success', message: `"${SECTION_KEY_LABELS[section.section_key] || section.section_key}" actualizada correctamente` });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const toggleSection = async (section: AboutSection) => {
    try {
      await handleToggle(section.id, !section.active);
      notify({ type: 'success', message: section.active ? 'Sección desactivada' : 'Sección activada' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Secciones — Nosotros"
        description={`${sections.length} sección(es) configuradas`}
      />

      <div className="space-y-6">
        {sections.map((section) => {
          const changes = editing[section.id];
          const hasChanges = changes && (
            changes.title !== section.title ||
            changes.content !== section.content ||
            changes.order_index !== section.order_index ||
            changes.image_url !== section.image_url
          );

          return (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {SECTION_KEY_LABELS[section.section_key] || section.section_key}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{section.section_key}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.active}
                    onChange={() => toggleSection(section)}
                    className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Activo</span>
                </label>
              </div>

              <div className="space-y-4">
                <FormField label="Título">
                  <input
                    type="text"
                    value={changes?.title ?? section.title}
                    onChange={(e) => handleFieldChange(section.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </FormField>

                <FormTextarea
                  label="Contenido"
                  value={changes?.content ?? section.content}
                  onChange={(v) => handleFieldChange(section.id, 'content', v)}
                  rows={6}
                />

                <FormField label="Imagen">
                  <div className="space-y-3">
                    {(changes?.image_url || section.image_url) && (
                      <img
                        src={getPublicImageUrl(changes?.image_url || section.image_url!)}
                        alt=""
                        className="w-full max-w-sm h-auto max-h-[300px] object-contain bg-gray-50 p-2 rounded-lg border border-gray-200"
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        {uploading[section.id] ? 'Subiendo...' : (section.image_url ? 'Cambiar imagen' : 'Subir imagen')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading[section.id]}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(section, file);
                          }}
                        />
                      </label>
                      {(changes?.image_url || section.image_url) && (
                        <button
                          type="button"
                          onClick={() => setEditing((prev) => ({ ...prev, [section.id]: { ...prev[section.id], image_url: null } }))}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar imagen
                        </button>
                      )}
                    </div>
                  </div>
                </FormField>

                <div className="flex items-center gap-4">
                  <FormField label="Índice de orden">
                    <input
                      type="number"
                      value={changes?.order_index ?? section.order_index}
                      onChange={(e) => handleFieldChange(section.id, 'order_index', parseInt(e.target.value) || 0)}
                      className="w-full max-w-[100px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </FormField>
                  <span className="text-xs text-gray-400 self-end pb-2">section_key fijo: <strong>{section.section_key}</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => saveSection(section)}
                  disabled={!hasChanges || saving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasChanges
                      ? 'bg-green-700 text-white hover:bg-green-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
