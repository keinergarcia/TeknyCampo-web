import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { LoadingSpinner } from '../../../components/admin/common/LoadingSpinner';
import { getMessage, updateMessage, deleteMessage } from '../../../lib/admin/config';
import { getErrorMessage } from '../../../lib/errors';
import { useNotifications } from '../../../hooks/useNotifications';

export function MessageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    nombre: string; email: string; asunto: string; mensaje: string; read: boolean; created_at: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const msg = await getMessage(id);
        setMessage(msg);
        if (!msg.read) {
          await updateMessage(id, { read: true });
        }
      } catch (e) {
        notify({ type: 'error', message: getErrorMessage(e) });
        navigate('/admin/messages');
      } finally { setLoading(false); }
    })();
  }, [id, navigate, notify]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este mensaje permanentemente?')) return;
    setDeleting(true);
    try {
      await deleteMessage(id!);
      notify({ type: 'success', message: 'Mensaje eliminado' });
      navigate('/admin/messages');
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    } finally { setDeleting(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!message) return null;

  return (
    <div>
      <PageHeader
        title={message.asunto}
        description={`De: ${message.nombre} — ${new Date(message.created_at).toLocaleString('es-CO')}`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/messages')}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Volver
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        }
      />

      <div className="max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nombre</p>
            <p className="text-sm text-gray-900">{message.nombre}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <a href={`mailto:${message.email}`} className="text-sm text-green-700 hover:underline">{message.email}</a>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Mensaje</p>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.mensaje}</p>
        </div>
      </div>
    </div>
  );
}
