import { useContext } from 'react';
import { NotificationContext } from '../components/admin/common/Notification/NotificationProvider';

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
}
