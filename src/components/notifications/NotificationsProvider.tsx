'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { NewsItem } from './types';

type Ctx = {
  items: NewsItem[];
  loading: boolean;
  hasUnread: boolean;
  markAllRead: () => void;
  refresh: () => Promise<void>;
};

const NotificationsCtx = createContext<Ctx | null>(null);

type Props = {
  children: React.ReactNode;
};

export function NotificationsProvider({ children }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('News')
      .select('*')
      .order('Date', { ascending: false });
    if (error) {
      console.error('[NotificationsProvider] News fetch failed', error);
    } else if (data) {
      setItems(data);
      setHasUnread(data.length > 0);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<Ctx>(() => ({
    items,
    loading,
    hasUnread,
    markAllRead: () => setHasUnread(false),
    refresh,
  }), [items, loading, hasUnread, refresh]);

  return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
}

export function useNotificationsCtx() {
  const ctx = useContext(NotificationsCtx);
  if (!ctx) throw new Error('useNotificationsCtx must be used within <NotificationsProvider>');
  return ctx;
}
