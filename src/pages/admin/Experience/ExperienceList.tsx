import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useExperience } from '../../../hooks/admin/useExperiencia';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { ExperienceItem } from '../../../types/admin';

export function ExperienceList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error, page, setPage,
    search, handleSearch, sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useExperience();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm('Eliminar elemento', '¿Estás seguro de eliminar este elemento de experiencia?', 'danger');
    if (!confirmed) return;
    try { await handleDelete(id); notify({ type: 'success', message: 'Elemento eliminado' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const onToggle = async (id: string, active: boolean) => {
    try { await handleToggle(id, active); notify({ type: 'success', message: active ? 'Activado' : 'Desactivado' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const columns: Column<ExperienceItem>[] = [
    { key: 'text', label: 'Texto', sortable: true },
    { key: 'order_index', label: 'Orden', sortable: true },
    { key: 'active', label: 'Estado', render: (row) => <StatusBadge active={row.active} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Experiencia"
        description={`${total} elemento(s)`}
        actions={
          <button onClick={() => navigate('/admin/experience/new')} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm">
            Nuevo Elemento
          </button>
        }
      />
      <DataTable
        columns={columns} data={data} loading={loading} error={error} onRetry={reload}
        emptyMessage="No hay elementos de experiencia"
        searchValue={search} onSearch={handleSearch}
        sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onEdit={(id) => navigate(`/admin/experience/edit/${id}`)}
        onDelete={onDelete} onToggle={onToggle}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
