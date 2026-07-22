import { useState, useEffect, useCallback } from 'react';
import { listJobs, deleteJob, toggleJob, listApplications, deleteApplication } from '../../lib/admin/jobs';
import { getErrorMessage } from '../../lib/errors';
import type { Job, JobApplication } from '../../types/admin';

interface UseJobsReturn {
  data: Job[];
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

export function useJobs(): UseJobsReturn {
  const [data, setData] = useState<Job[]>([]);
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
      const result = await listJobs({ page, pageSize, search, sortColumn, sortDirection });
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
    await deleteJob(id);
    await load();
  }, [load]);

  const handleToggle = useCallback(async (id: string, active: boolean) => {
    await toggleJob(id, active);
    setData((prev) => prev.map((j) => (j.id === id ? { ...j, active } : j)));
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

interface UseApplicationsReturn {
  data: JobApplication[];
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
}

export function useApplications(): UseApplicationsReturn {
  const [data, setData] = useState<JobApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listApplications({ page, pageSize, search, sortColumn, sortDirection });
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
    await deleteApplication(id);
    await load();
  }, [load]);

  return {
    data, total, loading, error,
    page, setPage,
    search, handleSearch,
    sortColumn, sortDirection, handleSort,
    reload: load,
    handleDelete,
  };
}
