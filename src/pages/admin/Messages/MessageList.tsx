import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useMessages } from '../../../hooks/admin/useConfig';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import { updateMessage } from '../../../lib/admin/config';
import type { Column } from '../../../types/admin';
import type { ContactMessage } from '../../../types/admin';

export function MessageList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete,
  } = useMessages();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm('Eliminar mensaje', '¿Estás seguro de eliminar este mensaje?', 'danger');
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Mensaje eliminado correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggleRead = async (id: string, read: boolean) => {
    try {
      await updateMessage(id, { read });
      reload();
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onView = (id: string) => navigate(`/admin/messages/${id}`);

  const onReply = async (id: string) => {
    const msg = data.find((m) => m.id === id);
    if (msg) {
      try {
        await navigator.clipboard.writeText(msg.email);
        notify({ type: 'success', message: `Correo "${msg.email}" copiado al portapapeles` });
      } catch {
        notify({ type: 'error', message: 'No se pudo copiar el correo. Cópialo manualmente.' });
      }
    }
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: 'read',
      label: 'Leído',
      render: (row) => (
        <button onClick={(e) => { e.stopPropagation(); onToggleRead(row.id, !row.read); }}
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
            row.read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
          {row.read ? 'Leído' : 'Nuevo'}
        </button>
      ),
    },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'asunto',
      label: 'Asunto',
      sortable: true,
      render: (row) => (
        <span className={`${row.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
          {row.asunto}
        </span>
      ),
    },
    { key: 'created_at', label: 'Recibido', sortable: true },
  ];

  return (
    <div>
      <PageHeader title="Mensajes" description={`${total} mensaje(s) recibidos`} />

      <DataTable columns={columns} data={data} loading={loading} error={error} onRetry={reload}
        emptyMessage="No hay mensajes recibidos" searchValue={search} onSearch={handleSearch}
        sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onEdit={onView} onDownload={onReply} downloadLabel="Responder" onDelete={onDelete} />

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
