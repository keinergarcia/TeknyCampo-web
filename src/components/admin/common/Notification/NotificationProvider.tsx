import { createContext, useCallback, useRef, useEffect, useState, type ReactNode } from 'react';
import type { NotificationItem } from '../../../../types/admin';

interface NotificationContextValue {
  notifications: NotificationItem[];
  notify: (item: Omit<NotificationItem, 'id'>) => void;
  remove: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  notify: () => {},
  remove: () => {},
});

let nextId = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const remove = useCallback((id: string) => {
    timersRef.current.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((item: Omit<NotificationItem, 'id'>) => {
    const id = String(++nextId);
    setNotifications((prev) => [...prev, { ...item, id }]);
    const timer = setTimeout(() => remove(id), 5000);
    timersRef.current.set(id, timer);
  }, [remove]);

  return (
    <NotificationContext.Provider value={{ notifications, notify, remove }}>
      {children}
      <div className="fixed top-4 right-2 left-2 sm:right-4 sm:left-auto z-[60] space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm text-white min-w-0 sm:min-w-[280px] animate-slide-in ${
              n.type === 'success' ? 'bg-green-700' :
              n.type === 'error' ? 'bg-red-600' :
              n.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            <span className="flex-1">{n.message}</span>
            <button onClick={() => remove(n.id)} aria-label="Cerrar notificación" className="text-white/80 hover:text-white shrink-0">✕</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
