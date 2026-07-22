import { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { FormField } from '../../../components/admin/common/Form/FormField';
import { FormTextarea } from '../../../components/admin/common/Form/FormTextarea';
import { useSiteConfig } from '../../../hooks/admin/useConfig';
import { useNotifications } from '../../../hooks/useNotifications';
import { getErrorMessage } from '../../../lib/errors';

export function SiteConfigPage() {
  const { notify } = useNotifications();
  const { config, loading, saving, error, save, load } = useSiteConfig();

  const [formData, setFormData] = useState({
    site_name: '',
    tagline: '',
    description: '',
    canonical_url: '',
    email: '',
    phone: '',
    address: '',
    rate_limit_contact_seconds: 60,
    rate_limit_application_seconds: 60,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        site_name: config.site_name,
        tagline: config.tagline,
        description: config.description || '',
        canonical_url: config.canonical_url || '',
        email: config.email,
        phone: config.phone,
        address: config.address,
        rate_limit_contact_seconds: config.rate_limit_contact_seconds,
        rate_limit_application_seconds: config.rate_limit_application_seconds,
      });
    }
  }, [config]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save(formData);
      notify({ type: 'success', message: 'Configuración guardada correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">
        Reintentar
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Configuración General" description="Administra la información global del sitio" />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Información General</h3>
          <FormField label="Nombre del sitio">
            <input type="text" value={formData.site_name} onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormField label="Tagline">
            <input type="text" value={formData.tagline} onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormTextarea label="Descripción (Meta)" value={formData.description} onChange={(v) => handleChange('description', v)} rows={3} />
          <FormField label="URL Canónica">
            <input type="url" value={formData.canonical_url} onChange={(e) => handleChange('canonical_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Información de Contacto</h3>
          <FormField label="Email">
            <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormField label="Teléfono">
            <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
          <FormField label="Dirección">
            <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </FormField>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Protección Anti-Spam</h3>
          <p className="text-sm text-gray-500">Tiempo en segundos que un usuario debe esperar antes de enviar otro mensaje o postulación desde la misma dirección de correo.</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Rate limit — Contacto (segundos)">
              <input type="number" min={10} value={formData.rate_limit_contact_seconds} onChange={(e) => handleChange('rate_limit_contact_seconds', parseInt(e.target.value) || 60)}
                className="w-full max-w-[160px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </FormField>
            <FormField label="Rate limit — Postulaciones (segundos)">
              <input type="number" min={10} value={formData.rate_limit_application_seconds} onChange={(e) => handleChange('rate_limit_application_seconds', parseInt(e.target.value) || 60)}
                className="w-full max-w-[160px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </FormField>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}
