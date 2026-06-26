import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function tryScroll(id: string, retries = 5): void {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (retries > 0) {
    setTimeout(() => tryScroll(id, retries - 1), 200);
  }
}

export function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      tryScroll(id);
    }
  }, [location]);
}

export function useScrollToState(scrollTo?: string) {
  useEffect(() => {
    if (scrollTo) tryScroll(scrollTo);
  }, [scrollTo]);
}
