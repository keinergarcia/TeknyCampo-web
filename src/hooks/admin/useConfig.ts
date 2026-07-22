import { useState, useEffect, useCallback } from 'react';
import {
  getSiteConfig, updateSiteConfig,
  listContactInfo, deleteContactInfo, toggleContactInfo,
  listSocialLinks, createSocialLink, updateSocialLink, toggleSocialLink,
  listMessages, deleteMessage,
} from '../../lib/admin/config';
import { getErrorMessage } from '../../lib/errors';
import type { SiteConfig, ContactInfo, SocialLink, ContactMessage } from '../../types/admin';

// ── SiteConfig ───────────────────────────────────────────────────

interface UseSiteConfigReturn {
  config: SiteConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
  load: () => Promise<void>;
  save: (data: Partial<SiteConfig>) => Promise<void>;
}

export function useSiteConfig(): UseSiteConfigReturn {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSiteConfig();
      setConfig(result);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (data: Partial<SiteConfig>) => {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateSiteConfig(data);
      setConfig(result);
    } catch (e) {
      setSaveError(getErrorMessage(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return { config, loading, saving, error, saveError, load, save };
}

// ── ContactInfo ──────────────────────────────────────────────────

interface UseContactInfoReturn {
  data: ContactInfo[];
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

export function useContactInfo(): UseContactInfoReturn {
  const [data, setData] = useState<ContactInfo[]>([]);
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
      const result = await listContactInfo({ page, pageSize, search, sortColumn, sortDirection });
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
    await deleteContactInfo(id);
    await load();
  }, [load]);

  const handleToggle = useCallback(async (id: string, active: boolean) => {
    await toggleContactInfo(id, active);
    setData((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
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

// ── SocialLinks ──────────────────────────────────────────────────

interface UseSocialLinksReturn {
  links: SocialLink[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  handleToggle: (id: string, active: boolean) => Promise<void>;
  handleUpdate: (id: string, data: Partial<SocialLink>) => Promise<void>;
  handleCreate: (data: { platform: string; url: string }) => Promise<void>;
}

export function useSocialLinks(): UseSocialLinksReturn {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listSocialLinks();
      setLinks(result);
    } catch (e) {
      setError(getErrorMessage(e));
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = useCallback(async (id: string, active: boolean) => {
    await toggleSocialLink(id, active);
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, active } : l)));
  }, []);

  const handleUpdate = useCallback(async (id: string, data: Partial<SocialLink>) => {
    const result = await updateSocialLink(id, data);
    setLinks((prev) => prev.map((l) => (l.id === id ? result : l)));
  }, []);

  const handleCreate = useCallback(async (data: { platform: string; url: string }) => {
    const result = await createSocialLink(data);
    setLinks((prev) => [...prev, result]);
  }, []);

  return { links, loading, error, reload: load, handleToggle, handleUpdate, handleCreate };
}

// ── Messages ─────────────────────────────────────────────────────

interface UseMessagesReturn {
  data: ContactMessage[];
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

export function useMessages(): UseMessagesReturn {
  const [data, setData] = useState<ContactMessage[]>([]);
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
      const result = await listMessages({ page, pageSize, search, sortColumn, sortDirection });
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
    await deleteMessage(id);
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
