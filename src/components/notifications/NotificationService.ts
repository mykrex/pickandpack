'use client';
import { io, Socket } from 'socket.io-client';
import type { NotificationDTO } from './types';

let socket: Socket | null = null;

export function connectNotifications(baseUrl: string, ctx: { station?: string; routes?: string[]; flights?: string[] }) {
  if (socket) return socket;
  socket = io(baseUrl, { transports: ['websocket'] });
  socket.on('connect', () => socket?.emit('subscribe', ctx));
  return socket;
}

export function onNewNotification(cb: (n: NotificationDTO) => void) {
  socket?.on('notification:new', cb);
}
export function offNewNotification(cb: (n: NotificationDTO) => void) {
  socket?.off('notification:new', cb);
}

export async function fetchNotifications(apiBase: string, params: Record<string, any> = {}) {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${apiBase}/notifications?${q}`);
  const json = await res.json();
  return json.data as NotificationDTO[];
}

export async function ackNotification(apiBase: string, id: number) {
  await fetch(`${apiBase}/notifications/${id}/ack`, { method: 'POST' });
}
export async function resolveNotification(apiBase: string, id: number) {
  await fetch(`${apiBase}/notifications/${id}/resolve`, { method: 'POST' });
}
