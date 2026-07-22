import { useState, useEffect, useCallback } from 'react';
import { listNews, deleteNews, toggleNews } from '../../lib/admin/news';
import { getErrorMessage } from '../../lib/errors';
import type { News } from '../../types/admin';

interface UseNewsReturn {
  data: News[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  search: string;
  handleSearch: (value: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (column: string) => void;
  reload: () => void;
  handleDelete: (id: string) => Promise<void>;
  handleToggle: (id: string, active: boolean) => Promise<void>;
}

export function useNews(): UseNewsReturn {
  const [data, setData] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('published_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listNews({ page, pageSize, search, sortColumn, sortDirection });
      setData(result.data);
      setTotal(result.total);
    } catch (e) {
      setError(getErrorMessage(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortColumn, sortDirection]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteNews(id);
    await load();
  }, [load]);

  const handleToggle = useCallback(async (id: string, active: boolean) => {
    await toggleNews(id, active);
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
  }, []);

  return {
    data, total, loading, error, page, setPage,
    search, handleSearch, sortColumn, sortDirection, handleSort,
    reload: load, handleDelete, handleToggle,
  };
}
