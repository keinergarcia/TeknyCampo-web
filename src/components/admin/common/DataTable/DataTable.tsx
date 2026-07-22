import type { Column } from '../../../../types/admin';

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  emptyMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  downloadLabel?: string;
  onToggle?: (id: string, active: boolean) => void;
}

function DataTableInner<T extends { id: string; active?: boolean }>({
  columns, data, loading, emptyMessage, error, onRetry,
  sortColumn, sortDirection, onSort,
  searchValue, onSearch,
  page, totalPages, onPageChange,
  onEdit, onDelete, onDownload, downloadLabel, onToggle,
}: DataTableProps<T>) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm">
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {onSearch && (
        <div className="mb-4">
          <input
            type="text"
            value={searchValue ?? ''}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{emptyMessage ?? 'No hay registros'}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-left font-medium text-gray-600 ${col.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                      onClick={() => col.sortable && onSort?.(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortColumn === col.key && (
                          <span className="text-green-700">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  {(onEdit || onDelete || onDownload || onToggle) && (
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-700">
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                    {(onEdit || onDelete || onDownload || onToggle) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {onToggle && row.active !== undefined && (
                            <button
                              onClick={() => onToggle(row.id, !row.active)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                row.active
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {row.active ? 'Activo' : 'Inactivo'}
                            </button>
                          )}
                          {onEdit && (
                            <button onClick={() => onEdit(row.id)} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                              Ver
                            </button>
                          )}
                          {onDownload && (
                            <button onClick={() => onDownload(row.id)} className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                              {downloadLabel ?? 'Descargar'}
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(row.id)} className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200">
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">Página {page} de {totalPages}</span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 rounded border ${pageNum === page ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const DataTable = DataTableInner as <T extends { id: string; active?: boolean }>(props: DataTableProps<T>) => JSX.Element;
