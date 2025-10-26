'use client';
import { useNotificationsCtx } from './NotificationsProvider';

export function useNotifications() {
  return useNotificationsCtx();
}
