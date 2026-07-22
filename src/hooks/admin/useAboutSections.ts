import { useState, useEffect, useCallback } from 'react';
import { listAboutSections, updateAboutSection, toggleAboutSection } from '../../lib/admin/about-sections';
import { getErrorMessage } from '../../lib/errors';
import type { AboutSection } from '../../types/admin';

interface UseAboutSectionsReturn {
  sections: AboutSection[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  reload: () => void;
  handleUpdate: (id: string, data: Partial<AboutSection>) => Promise<void>;
  handleToggle: (id: string, active: boolean) => Promise<void>;
}

export function useAboutSections(): UseAboutSectionsReturn {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAboutSections();
      setSections(data);
    } catch (e) {
      setError(getErrorMessage(e));
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = useCallback(async (id: string, data: Partial<AboutSection>) => {
    setSaving(true);
    try {
      const result = await updateAboutSection(id, data);
      setSections((prev) => prev.map((s) => (s.id === id ? result : s)));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleToggle = useCallback(async (id: string, active: boolean) => {
    await toggleAboutSection(id, active);
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
  }, []);

  return { sections, loading, error, saving, reload: load, handleUpdate, handleToggle };
}
