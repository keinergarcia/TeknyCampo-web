import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useJobs } from '../../../hooks/admin/useJobs';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { Job } from '../../../types/admin';

export function JobList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useJobs();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm(
      'Eliminar vacante',
      '¿Estás seguro de eliminar esta vacante? Esta acción no se puede deshacer.',
      'danger'
    );
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Vacante eliminada correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await handleToggle(id, active);
      notify({ type: 'success', message: active ? 'Vacante abierta' : 'Vacante cerrada' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onEdit = (id: string) => navigate(`/admin/jobs/edit/${id}`);

  const columns: Column<Job>[] = [
    { key: 'title', label: 'Título', sortable: true },
    { key: 'type', label: 'Tipo', sortable: true },
    { key: 'location', label: 'Ubicación', sortable: true },
    {
      key: 'active',
      label: 'Estado',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          row.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {row.active ? 'Abierta' : 'Cerrada'}
        </span>
      ),
    },
    { key: 'order_index', label: 'Orden', sortable: true },
  ];

  return (
    <div>
      <PageHeader
        title="Vacantes"
        description={`${total} vacante(s) registradas`}
        actions={
          <button
            onClick={() => navigate('/admin/jobs/new')}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm"
          >
            Nueva Vacante
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="No hay vacantes registradas"
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
