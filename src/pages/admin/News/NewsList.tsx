import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { StatusBadge } from '../../../components/admin/common/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useNews } from '../../../hooks/admin/useNews';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getErrorMessage } from '../../../lib/errors';
import { getPublicImageUrl } from '../../../lib/storage';
import type { Column } from '../../../types/admin';
import type { News } from '../../../types/admin';

export function NewsList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error, page, setPage,
    search, handleSearch, sortColumn, sortDirection, handleSort,
    reload, handleDelete, handleToggle,
  } = useNews();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm('Eliminar noticia', '¿Estás seguro de eliminar esta noticia?', 'danger');
    if (!confirmed) return;
    try { await handleDelete(id); notify({ type: 'success', message: 'Noticia eliminada' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const onToggle = async (id: string, active: boolean) => {
    try { await handleToggle(id, active); notify({ type: 'success', message: active ? 'Noticia activada' : 'Noticia desactivada' }); }
    catch (e) { notify({ type: 'error', message: getErrorMessage(e) }); }
  };

  const formatDate = (d: string | null) => {
    if (!d) return <span className="text-xs text-gray-400 italic">Borrador</span>;
    return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const columns: Column<News>[] = [
    {
      key: 'image_url', label: 'Img',
      render: (row) => row.image_url
        ? <img src={getPublicImageUrl(row.image_url)} alt={row.title} className="w-10 h-10 object-contain bg-gray-100 rounded" />
        : <span className="text-gray-300 text-xs">—</span>,
    },
    { key: 'title', label: 'Título', sortable: true },
    { key: 'category', label: 'Categoría', sortable: true,
      render: (row) => <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{row.category}</span> },
    { key: 'author', label: 'Autor', sortable: true },
    {
      key: 'featured', label: 'Destacada',
      render: (row) => row.featured ? <span className="text-yellow-500 text-sm">★</span> : <span className="text-gray-300 text-sm">☆</span>,
    },
    { key: 'published_at', label: 'Publicación', sortable: true, render: (row) => formatDate(row.published_at) },
    { key: 'active', label: 'Estado', render: (row) => <StatusBadge active={row.active} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Noticias"
        description={`${total} noticia(s)`}
        actions={
          <button onClick={() => navigate('/admin/news/new')} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm">
            Nueva Noticia
          </button>
        }
      />
      <DataTable
        columns={columns} data={data} loading={loading} error={error} onRetry={reload}
        emptyMessage="No hay noticias registradas"
        searchValue={search} onSearch={handleSearch}
        sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onEdit={(id) => navigate(`/admin/news/edit/${id}`)}
        onDelete={onDelete} onToggle={onToggle}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
