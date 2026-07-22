import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useWhyChooseUs } from '../../../hooks/admin/useWhyChooseUs';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { WhyChooseUs } from '../../../types/admin';

export function WhyChooseUsList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useWhyChooseUs();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm(
      'Eliminar elemento',
      '¿Estás seguro de eliminar este elemento? Esta acción no se puede deshacer.',
      'danger'
    );
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Elemento eliminado correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onToggle = async (id: string, active: boolean) => {
    try {
      await handleToggle(id, active);
      notify({ type: 'success', message: active ? 'Elemento activado' : 'Elemento desactivado' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onEdit = (id: string) => navigate(`/admin/why-choose-us/edit/${id}`);

  const columns: Column<WhyChooseUs>[] = [
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
    { key: 'title', label: 'Título', sortable: true },
    {
      key: 'description',
      label: 'Descripción',
      render: (row) => (
        <span className="text-sm text-gray-600 line-clamp-1">{row.description}</span>
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
        title="¿Por qué elegirnos?"
        description={`${total} elemento(s) registrados`}
        actions={
          <button
            onClick={() => navigate('/admin/why-choose-us/new')}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm"
          >
            Nuevo Elemento
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="No hay elementos registrados"
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
