'use client';
import { useNotificationsCtx } from './NotificationsProvider';

export function useNotifications(_: {
  socketUrl?: string;
  apiBase?: string;
  station?: string;
  routes?: string[];
  flights?: string[];
  initialState?: 'new' | 'ack' | 'resolved' | undefined;
}) {
  // El Provider maneja conexión y estado global; aquí solo lo consumimos.
  return useNotificationsCtx();
}
