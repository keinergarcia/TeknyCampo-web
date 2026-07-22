import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useContactInfo } from '../../../hooks/admin/useConfig';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { ContactInfo } from '../../../types/admin';

export function ContactInfoList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useContactInfo();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm('Eliminar item', '¿Estás seguro de eliminar este item de contacto?', 'danger');
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Item eliminado correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await handleToggle(id, active);
      notify({ type: 'success', message: active ? 'Item activado' : 'Item desactivado' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onEdit = (id: string) => navigate(`/admin/contact-info/edit/${id}`);

  const columns: Column<ContactInfo>[] = [
    { key: 'icon_name', label: 'Icono', sortable: true },
    { key: 'label', label: 'Etiqueta', sortable: true },
    { key: 'value', label: 'Valor', sortable: true },
    { key: 'order_index', label: 'Orden', sortable: true },
    {
      key: 'active',
      label: 'Estado',
      render: (row) => <StatusBadge active={row.active} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Información de Contacto"
        description={`${total} item(s) registrados`}
        actions={
          <button onClick={() => navigate('/admin/contact-info/new')}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm">
            Nuevo Item
          </button>
        }
      />
      <DataTable columns={columns} data={data} loading={loading} error={error} onRetry={reload}
        emptyMessage="No hay items de contacto" searchValue={search} onSearch={handleSearch}
        sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
