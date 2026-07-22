import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useTrainings } from '../../../hooks/admin/useTrainings';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import { getPublicImageUrl } from '../../../lib/storage';
import type { Column } from '../../../types/admin';
import type { Training } from '../../../types/admin';

export function TrainingList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error, page, setPage,
    search, handleSearch, sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useTrainings();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm('Eliminar capacitación', '¿Estás seguro de eliminar esta capacitación?', 'danger');
    if (!confirmed) return;
    try { await handleDelete(id); notify({ type: 'success', message: 'Capacitación eliminada' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const onToggle = async (id: string, active: boolean) => {
    try { await handleToggle(id, active); notify({ type: 'success', message: active ? 'Capacitación activada' : 'Capacitación desactivada' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const formatPrice = (p: number | null) => {
    if (p === null) return <span className="text-xs text-green-600 font-medium">Gratis</span>;
    return `$${p.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
  };

  const columns: Column<Training>[] = [
    {
      key: 'image_url', label: 'Img',
      render: (row) => row.image_url
        ? <img src={getPublicImageUrl(row.image_url)} alt={row.title} className="w-10 h-10 object-cover rounded" />
        : <span className="text-gray-300 text-xs">—</span>,
    },
    { key: 'title', label: 'Título', sortable: true },
    {
      key: 'modality', label: 'Modalidad', sortable: true,
      render: (row) => {
        const colors: Record<string, string> = { presencial: 'bg-blue-100 text-blue-700', virtual: 'bg-purple-100 text-purple-700', hibrida: 'bg-green-100 text-green-700' };
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[row.modality] || 'bg-gray-100'}`}>{row.modality}</span>;
      },
    },
    { key: 'instructor', label: 'Instructor', sortable: true,
      render: (row) => row.instructor || <span className="text-gray-400 text-xs">—</span> },
    {
      key: 'price', label: 'Precio', sortable: true,
      render: (row) => formatPrice(row.price),
    },
    { key: 'featured', label: 'Dest.', render: (row) => row.featured ? <span className="text-yellow-500 text-sm">★</span> : '' },
    { key: 'order_index', label: 'Orden', sortable: true },
    { key: 'active', label: 'Estado', render: (row) => <StatusBadge active={row.active} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Capacitaciones"
        description={`${total} capacitación(es)`}
        actions={
          <button onClick={() => navigate('/admin/trainings/new')} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm">
            Nueva Capacitación
          </button>
        }
      />
      <DataTable
        columns={columns} data={data} loading={loading} error={error} onRetry={reload}
        emptyMessage="No hay capacitaciones registradas"
        searchValue={search} onSearch={handleSearch}
        sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onEdit={(id) => navigate(`/admin/trainings/edit/${id}`)}
        onDelete={onDelete} onToggle={onToggle}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
