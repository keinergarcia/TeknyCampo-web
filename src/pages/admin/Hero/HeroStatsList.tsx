import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useHeroStats } from '../../../hooks/admin/useHeroStats';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { HeroStat } from '../../../types/admin';

export function HeroStatsList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useHeroStats();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm(
      'Eliminar estadística',
      '¿Estás seguro de eliminar esta estadística? Esta acción no se puede deshacer.',
      'danger'
    );
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Estadística eliminada correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await handleToggle(id, active);
      notify({ type: 'success', message: active ? 'Estadística activada' : 'Estadística desactivada' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onEdit = (id: string) => navigate(`/admin/hero/edit/${id}`);

  const columns: Column<HeroStat>[] = [
    { key: 'value', label: 'Valor', sortable: true },
    { key: 'label', label: 'Etiqueta', sortable: true },
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
        title="Estadísticas del Hero"
        description={`${total} estadística(s) registradas`}
        actions={
          <button
            onClick={() => navigate('/admin/hero/new')}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm"
          >
            Nueva Estadística
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="No hay estadísticas registradas"
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
