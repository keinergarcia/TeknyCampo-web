import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useServices } from '../../../hooks/admin/useServices';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { Service } from '../../../types/admin';

export function ServiceList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useServices();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm(
      'Eliminar servicio',
      '¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.',
      'danger'
    );
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Servicio eliminado correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await handleToggle(id, active);
      notify({ type: 'success', message: active ? 'Servicio activado' : 'Servicio desactivado' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onEdit = (id: string) => navigate(`/admin/services/edit/${id}`);

  const columns: Column<Service>[] = [
    { key: 'title', label: 'Título', sortable: true },
    { key: 'icon_name', label: 'Icono', sortable: true },
    {
      key: 'color_scheme',
      label: 'Color',
      sortable: true,
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          row.color_scheme === 'amber' ? 'bg-amber-100 text-amber-700' :
          row.color_scheme === 'green' ? 'bg-green-100 text-green-700' :
          row.color_scheme === 'orange' ? 'bg-orange-100 text-orange-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {row.color_scheme}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Estado',
      render: (row) => <StatusBadge active={row.active} />,
    },
    { key: 'order_index', label: 'Orden', sortable: true },
  ];

  return (
    <div>
      <PageHeader
        title="Servicios"
        description={`${total} servicio(s) registrados`}
        actions={
          <button
            onClick={() => navigate('/admin/services/new')}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm"
          >
            Nuevo Servicio
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="No hay servicios registrados"
        searchValue={search}
        onSearch={handleSearch}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
