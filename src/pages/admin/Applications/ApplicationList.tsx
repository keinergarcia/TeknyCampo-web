import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../components/admin/common/DataTable/DataTable';
import { PageHeader } from '../../../components/admin/common/PageHeader';
import { ConfirmDialog } from '../../../components/admin/common/ConfirmDialog';
import { useApplications } from '../../../hooks/admin/useJobs';
import { useNotifications } from '../../../hooks/useNotifications';
import { useConfirm } from '../../../hooks/useConfirm';
import { getApplication } from '../../../lib/admin/jobs';
import { getSignedDocumentUrl } from '../../../lib/storage';
import { getErrorMessage } from '../../../lib/errors';
import type { Column } from '../../../types/admin';
import type { JobApplication } from '../../../types/admin';

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  revisado: 'bg-blue-100 text-blue-700',
  contactado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
  contratado: 'bg-emerald-100 text-emerald-700',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

export function ApplicationList() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { confirm, dialogProps } = useConfirm();
  const {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload, handleDelete,
  } = useApplications();

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onDelete = async (id: string) => {
    const confirmed = await confirm(
      'Eliminar postulación',
      '¿Estás seguro de eliminar esta postulación? Esta acción no se puede deshacer.',
      'danger'
    );
    if (!confirmed) return;
    try {
      await handleDelete(id);
      notify({ type: 'success', message: 'Postulación eliminada correctamente' });
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const onEdit = (id: string) => navigate(`/admin/applications/${id}`);

  const onDownload = async (id: string) => {
    try {
      const [app, { downloadApplicationPdf }] = await Promise.all([
        getApplication(id),
        import('../../../lib/pdf'),
      ]);
      downloadApplicationPdf({
        nombre: app.nombre,
        email: app.email,
        telefono: app.telefono,
        cedula: app.cedula,
        cargo: app.cargo,
        mensaje: app.mensaje,
        cv_url: app.cv_url,
        status: app.status,
        created_at: app.created_at,
      });
      if (app.cv_url) {
        const signedUrl = await getSignedDocumentUrl(app.cv_url);
        if (signedUrl) window.open(signedUrl, '_blank');
      }
    } catch (e) {
      notify({ type: 'error', message: getErrorMessage(e) });
    }
  };

  const columns: Column<JobApplication>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: true },
    { key: 'cedula', label: 'Cédula', sortable: true },
    { key: 'cargo', label: 'Cargo', sortable: true },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'created_at', label: 'Recibida', sortable: true },
  ];

  return (
    <div>
      <PageHeader
        title="Postulaciones"
        description={`${total} postulación(es) recibidas`}
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="No hay postulaciones recibidas"
        searchValue={search}
        onSearch={handleSearch}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={onEdit}
        onDownload={onDownload}
        onDelete={onDelete}
      />

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
