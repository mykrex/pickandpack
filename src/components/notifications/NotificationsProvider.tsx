'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { NotificationDTO } from './types';

type Ctx = {
  items: NotificationDTO[];
  loading: boolean;
  ack: (id: number) => Promise<void>;
  resolve: (id: number) => Promise<void>;
};

const NotificationsCtx = createContext<Ctx | null>(null);

type Props = {
  children: React.ReactNode;
  socketUrl: string;
  apiBase: string;
  station?: string;
  routes?: string[];
  flights?: string[];
  initialState?: 'new' | 'ack' | 'resolved';
  persistKey?: string; // opcional: localStorage key
};

async function fetchNotifications(apiBase: string, params: Record<string, any> = {}) {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${apiBase}/notifications?${q}`);
  const json = await res.json();
  return json.data as NotificationDTO[];
}
async function ackNotification(apiBase: string, id: number) {
  await fetch(`${apiBase}/notifications/${id}/ack`, { method: 'POST' });
}
async function resolveNotification(apiBase: string, id: number) {
  await fetch(`${apiBase}/notifications/${id}/resolve`, { method: 'POST' });
}

export function NotificationsProvider({
  children,
  socketUrl,
  apiBase,
  station,
  routes,
  flights,
  initialState,
  persistKey = 'pp_notifs_v1',
}: Props) {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // socket singleton por módulo
  const socketRef = useRef<Socket | null>(null);
  if (!socketRef.current) {
    socketRef.current = io(socketUrl, { transports: ['websocket'] });
  }

  // cargar desde localStorage para evitar parpadeo
  useEffect(() => {
    try {
      const cached = localStorage.getItem(persistKey);
      if (cached) setItems(JSON.parse(cached));
    } catch {}
  }, [persistKey]);

  // conectar socket + fetch inicial (se corre 1 vez)
  useEffect(() => {
    const socket = socketRef.current!;
    const subscribeCtx = { station, routes, flights };
    socket.on('connect', () => socket.emit('subscribe', subscribeCtx));

    const onNew = (n: NotificationDTO) => {
      setItems(prev => (prev.find(x => x.id === n.id) ? prev : [n, ...prev]));
    };
    const onAck = ({ id }: { id: number }) => {
      setItems(prev => prev.map(x => (x.id === id ? { ...x, state: 'ack' } : x)));
    };
    const onResolved = ({ id }: { id: number }) => {
      setItems(prev => prev.map(x => (x.id === id ? { ...x, state: 'resolved' } : x)));
    };

    socket.on('notification:new', onNew);
    socket.on('notification:ack', onAck);
    socket.on('notification:resolved', onResolved);

    (async () => {
      setLoading(true);
      const data = await fetchNotifications(apiBase, {
        state: initialState,
        station,
        route: routes?.[0],
        flight: flights?.[0],
        limit: 50,
      });
      setItems(curr => {
        // merge con cache para no perder lo que ya estaba
        const map = new Map<number, NotificationDTO>();
        [...data, ...curr].forEach(n => map.set(n.id, n));
        return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
      });
      setLoading(false);
    })();

    return () => {
      socket.off('notification:new', onNew);
      socket.off('notification:ack', onAck);
      socket.off('notification:resolved', onResolved);
      // NO desconectar el socket; queremos que sobreviva entre rutas
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // importante: dependencias vacías para que solo monte una vez

  // persistencia ligera
  useEffect(() => {
    try {
      localStorage.setItem(persistKey, JSON.stringify(items.slice(0, 100)));
    } catch {}
  }, [items, persistKey]);

  const value = useMemo<Ctx>(() => ({
    items,
    loading,
    ack: async (id: number) => {
      await ackNotification(apiBase, id);
      setItems(prev => prev.map(n => (n.id === id ? { ...n, state: 'ack' } : n)));
    },
    resolve: async (id: number) => {
      await resolveNotification(apiBase, id);
      setItems(prev => prev.map(n => (n.id === id ? { ...n, state: 'resolved' } : n)));
    },
  }), [items, loading, apiBase]);

  return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
}

export function useNotificationsCtx() {
  const ctx = useContext(NotificationsCtx);
  if (!ctx) throw new Error('useNotificationsCtx must be used within <NotificationsProvider>');
  return ctx;
}
