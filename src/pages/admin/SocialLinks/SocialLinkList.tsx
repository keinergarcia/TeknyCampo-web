import { useState } from 'react';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { useSocialLinks } from '../../../hooks/admin/useConfig';
import { useNotifications } from '../../../hooks/useNotifications';
import { getErrorMessage } from '../../../lib/errors';
const PLATFORM_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'web', label: 'Sitio Web' },
];

const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  linkedin: 'bg-sky-100 text-sky-700',
  twitter: 'bg-gray-100 text-gray-700',
  youtube: 'bg-red-100 text-red-700',
  tiktok: 'bg-black text-white',
  whatsapp: 'bg-green-100 text-green-700',
  web: 'bg-purple-100 text-purple-700',
};

export function SocialLinkList() {
  const { notify } = useNotifications();
  const { links, loading, error, reload, handleToggle, handleUpdate, handleCreate } = useSocialLinks();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const existingPlatforms = new Set(links.map((l) => l.platform));

  const onStartEdit = (id: string, url: string) => {
    setEditingId(id);
    setEditUrl(url);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditUrl('');
  };

  const onSaveEdit = async (id: string) => {
    try {
      await handleUpdate(id, { url: editUrl });
      notify({ type: 'success', message: 'URL actualizada correctamente' });
      setEditingId(null);
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await handleToggle(id, active);
      notify({ type: 'success', message: active ? 'Red social activada' : 'Red social desactivada' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onAdd = async () => {
    const platformValue = newPlatform === '__custom__' ? customPlatform.trim() : newPlatform.trim();
    if (!platformValue || !newUrl.trim()) {
      notify({ type: 'error', message: 'Completa la plataforma y la URL' });
      return;
    }
    setCreating(true);
    try {
      await handleCreate({ platform: platformValue, url: newUrl.trim() });
      notify({ type: 'success', message: 'Red social agregada correctamente' });
      setNewPlatform('');
      setCustomPlatform('');
      setNewUrl('');
      setShowForm(false);
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={reload} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">Reintentar</button>
    </div>
  );

  const availablePlatforms = PLATFORM_OPTIONS.filter((opt) => !existingPlatforms.has(opt.value));

  return (
    <div>
      <PageHeader title="Redes Sociales" description="Administra las redes sociales del sitio" />

      <div className="mb-6">
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">
            + Agregar red social
          </button>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-lg space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Nueva red social</h3>
            <div className="flex gap-3">
              <select value={newPlatform} onChange={(e) => { setNewPlatform(e.target.value); if (e.target.value !== '__custom__') setCustomPlatform(''); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Seleccionar plataforma</option>
                {availablePlatforms.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                <option value="__custom__">Otra...</option>
              </select>
              {newPlatform === '__custom__' && (
                <input type="text" value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)}
                  placeholder="Nombre de la plataforma"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40 focus:outline-none focus:ring-2 focus:ring-green-500" />
              )}
            </div>
            <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div className="flex gap-2">
              <button onClick={onAdd} disabled={creating}
                className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 disabled:opacity-50">
                {creating ? 'Agregando...' : 'Agregar'}
              </button>
              <button onClick={() => { setShowForm(false); setNewPlatform(''); setNewUrl(''); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 max-w-2xl">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${PLATFORM_COLORS[link.platform] || 'bg-gray-100 text-gray-700'}`}>
                {PLATFORM_OPTIONS.find((o) => o.value === link.platform)?.label || link.platform}
              </span>
              <div>
                {editingId === link.id ? (
                  <div className="flex items-center gap-2">
                    <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="https://..." />
                    <button onClick={() => onSaveEdit(link.id)} className="px-2 py-1 text-xs bg-green-700 text-white rounded hover:bg-green-800">Guardar</button>
                    <button onClick={onCancelEdit} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{PLATFORM_OPTIONS.find((o) => o.value === link.platform)?.label || link.platform}</p>
                    <p className="text-xs text-gray-500">{link.url === '#' ? 'No configurada' : link.url}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editingId !== link.id && (
                <button onClick={() => onStartEdit(link.id, link.url)}
                  className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 border border-gray-300 rounded">
                  Editar
                </button>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={link.active} onChange={(e) => onToggle(link.id, e.target.checked)}
                  className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
