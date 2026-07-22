import { useState, useEffect, useCallback } from 'react';
import { listWhyChooseUs, deleteWhyChooseUs, toggleWhyChooseUs } from '../../lib/admin/why-choose-us';
import { getErrorMessage } from '../../lib/errors';
import type { WhyChooseUs } from '../../types/admin';

interface UseWhyChooseUsReturn {
  data: WhyChooseUs[];
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

export function useWhyChooseUs(): UseWhyChooseUsReturn {
  const [data, setData] = useState<WhyChooseUs[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('order_index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listWhyChooseUs({ page, pageSize, search, sortColumn, sortDirection });
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

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteWhyChooseUs(id);
    await load();
  }, [load]);

  const handleToggle = useCallback(async (id: string, active: boolean) => {
    await toggleWhyChooseUs(id, active);
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
  }, []);

  return {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload: load,
    handleDelete, handleToggle,
  };
}
