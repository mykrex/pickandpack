'use client';
import { useNotifications } from './useNotifications';
import type { NotificationDTO } from './types';
import { Bell } from 'lucide-react';
import { useState } from 'react';

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

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, loading, ack, resolve } = useNotifications({
    socketUrl: process.env.NEXT_PUBLIC_NOTIFS_SOCKET ?? 'http://localhost:4000',
    apiBase: process.env.NEXT_PUBLIC_NOTIFS_API ?? 'http://localhost:4000',
    station: 'Puesto-3',
    routes: ['MTY-CUN']
  });
  const unseen = items.filter(i => i.state === 'new').length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-sm"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unseen > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full px-1.5 text-xs font-semibold bg-red-600 text-white">
            {unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-[420px] max-h-[520px] overflow-auto rounded-2xl border border-gray-300 p-3 bg-white shadow-2xl z-[60]">
          <div className="flex items-center justify-between mb-2">
            <strong className="text-gray-900">Notificaciones</strong>
            {loading && <span className="text-xs text-gray-600">cargando…</span>}
          </div>
          {items.map(n => (
            <NotiCard key={n.id} n={n} onAck={() => ack(n.id)} onResolve={() => resolve(n.id)} />
          ))}
          {items.length === 0 && <div className="text-sm text-gray-700">Sin notificaciones</div>}
        </div>
      )}
    </div>
  );
}
