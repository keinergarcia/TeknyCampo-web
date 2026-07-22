import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useBenefits } from '../../../hooks/admin/useBenefits';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { Benefit } from '../../../types/admin';

export function BenefitList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useBenefits();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm(
      'Eliminar beneficio',
      '¿Estás seguro de eliminar este beneficio? Esta acción no se puede deshacer.',
      'danger'
    );
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Beneficio eliminado correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await handleToggle(id, active);
      notify({ type: 'success', message: active ? 'Beneficio activado' : 'Beneficio desactivado' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onEdit = (id: string) => navigate(`/admin/benefits/edit/${id}`);

  const columns: Column<Benefit>[] = [
    { key: 'title', label: 'Título', sortable: true },
    {
      key: 'icon_name',
      label: 'Icono',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">
          {row.icon_name}
        </span>
      ),
    },
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
        title="Beneficios"
        description={`${total} beneficio(s) registrados`}
        actions={
          <button
            onClick={() => navigate('/admin/benefits/new')}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm"
          >
            Nuevo Beneficio
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="No hay beneficios registrados"
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
