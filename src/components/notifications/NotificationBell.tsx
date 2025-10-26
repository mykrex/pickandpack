'use client';
import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotifications } from './useNotifications';
import type { NewsItem, NotificationDTO } from './types';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SevBadge({ sev }: { sev: NotificationDTO['severity'] }) {
  const base = 'text-white text-xs font-semibold px-2 py-0.5 rounded-md';
  const cls =
    sev === 'urgent' ? 'bg-red-600' :
    sev === 'high'   ? 'bg-orange-500' :
                       'bg-blue-600';
  const label = sev === 'urgent' ? 'Urgente' : sev === 'high' ? 'Alto' : 'Info';
  return <span className={`${base} ${cls}`}>{label}</span>;
}

function NotiCard({ n, onAck, onResolve }: { n: NotificationDTO; onAck: () => void; onResolve: () => void }) {
  const title =
    n.type === 'SpecChange'   ? `Cambio en ${n.drawer ?? 'carrito'} — ${n.flight ?? ''}` :
    n.type === 'ExpirySoon'   ? `Caducidad próxima — ${n.productCode ?? ''}` :
    n.type === 'Substitution' ? `Sustitución — ${n.productCode ?? ''}` :
                                n.type;

  return (
    <div className="rounded-xl p-3 mb-3 border border-gray-300 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <strong className="text-gray-900">{title}</strong>
        <SevBadge sev={n.severity} />
      </div>

      <div className="mt-1 text-xs text-gray-700">
        Ruta {n.route ?? '—'} · Vuelo {n.flight ?? '—'} · Estación {n.station ?? '—'}
      </div>

      {/* Texto legible desde servidor */}
      {n.payload?.message && (
        <p className="mt-2 text-sm text-gray-900">
          {n.payload.message}
        </p>
      )}

      {/* Fallback en cliente si no vino message */}
      {!n.payload?.message && n.type === 'SpecChange' && (n as any).payload?.before && (n as any).payload?.after && (
        <p className="mt-2 text-sm text-gray-900">
          Cambia <strong>{(n as any).payload.before.name}</strong> por <strong>{(n as any).payload.after.name}</strong> en el carrito <strong>{n.drawer}</strong>.
        </p>
      )}

      {/* Detalle técnico opcional */}
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-blue-600 hover:underline">Ver detalle</summary>
        <pre className="mt-2 text-xs overflow-auto rounded-lg p-2 bg-gray-50 text-gray-900 border border-gray-200">
          {JSON.stringify(n.payload, null, 2)}
        </pre>
      </details>

      <div className="flex gap-2 mt-2">
        {n.state === 'new' && (
          <button
            className="px-2 py-1 rounded-md text-sm border border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
            onClick={onAck}
          >
            Marcar visto
          </button>
        )}
        {n.state !== 'resolved' && (
          <button
            className="px-2 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
            onClick={onResolve}
          >
            Resolver
          </button>
        )}
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const chipLine = useMemo(() => {
    return [item.Ruta, item.Vuelo, item.Estacion].filter(Boolean).join(' · ') || 'General';
  }, [item.Ruta, item.Vuelo, item.Estacion]);
  return (
    <div className="rounded-xl p-4 mb-3 border border-gray-300 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-navy leading-tight">{item.Title}</h3>
        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(item.Date)}</span>
      </div>
      <div className="mt-2 text-xs uppercase tracking-wide text-gray-500">{chipLine}</div>
      <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.Body}</p>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, loading, hasUnread, markAllRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    setOpen(prev => {
      if (prev) markAllRead();
      return !prev;
    });
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
      markAllRead();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, markAllRead]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggle}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-sm"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 rounded-full px-1.5 text-xs font-semibold bg-red-600 text-white">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-10 w-[420px] max-h-[520px] overflow-auto rounded-2xl border border-gray-300 p-3 bg-white shadow-2xl z-[60]"
        >
          <div className="flex items-center justify-between mb-3">
            <strong className="text-gray-900">Noticias</strong>
            {loading && <span className="text-xs text-gray-600">cargando…</span>}
          </div>
          {items.map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
          {!loading && items.length === 0 && (
            <div className="text-sm text-gray-700">Sin novedades</div>
          )}
        </div>
      )}
    </div>
  );
}
