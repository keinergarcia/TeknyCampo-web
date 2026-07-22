import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useEntities } from '../../../hooks/admin/useEntities';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import { getPublicImageUrl } from '../../../lib/storage';
import type { Column } from '../../../types/admin';
import type { Entity } from '../../../types/admin';

export function EntityList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error, page, setPage,
    search, handleSearch, sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useEntities();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm('Eliminar entidad', '¿Estás seguro de eliminar esta entidad?', 'danger');
    if (!confirmed) return;
    try { await handleDelete(id); notify({ type: 'success', message: 'Entidad eliminada' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const onToggle = async (id: string, active: boolean) => {
    try { await handleToggle(id, active); notify({ type: 'success', message: active ? 'Entidad activada' : 'Entidad desactivada' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const columns: Column<Entity>[] = [
    {
      key: 'logo_url', label: 'Logo',
      render: (row) => row.logo_url
        ? <img src={getPublicImageUrl(row.logo_url)} alt={row.name} className="w-10 h-10 object-contain rounded" />
        : <span className="text-gray-400 text-xs">—</span>,
    },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'full_name', label: 'Nombre completo', sortable: true },
    { key: 'icon_name', label: 'Icono', sortable: true },
    { key: 'order_index', label: 'Orden', sortable: true },
    { key: 'active', label: 'Estado', render: (row) => <StatusBadge active={row.active} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Entidades"
        description={`${total} entidad(es)`}
        actions={
          <button onClick={() => navigate('/admin/entities/new')} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm">
            Nueva Entidad
          </button>
        }
      />
      <DataTable
        columns={columns} data={data} loading={loading} error={error} onRetry={reload}
        emptyMessage="No hay entidades registradas"
        searchValue={search} onSearch={handleSearch}
        sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onEdit={(id) => navigate(`/admin/entities/edit/${id}`)}
        onDelete={onDelete} onToggle={onToggle}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
