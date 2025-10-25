import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import fs from 'fs-extra';
import path from 'node:path';

type Severity = 'urgent' | 'high' | 'info';
type EventType = 'SpecChange' | 'Substitution' | 'ExpirySoon' | 'StockOut' | 'PredictionRule';

interface Notification {
  id: number;
  type: EventType;
  payload: any;
  route?: string;
  flight?: string;
  drawer?: string;
  productCode?: string;
  station?: string;
  severity: Severity;
  deadlineTs?: number;
  createdAt: number;
  state: 'new' | 'ack' | 'resolved';
  assignedTo?: string;
  acknowledgedAt?: number | null;
  resolvedAt?: number | null;
}

const DB_FILE = path.join(process.cwd(), 'pp_notifications.json');

/* ------------------------- tiny JSON “DB” helpers ------------------------- */
async function loadAll(): Promise<Notification[]> {
  await fs.ensureFile(DB_FILE);
  try { return await fs.readJson(DB_FILE); } catch { return []; }
}
async function saveAll(list: Notification[]) {
  await fs.writeJson(DB_FILE, list, { spaces: 2 });
}
async function add(n: Omit<Notification, 'id'|'createdAt'|'state'>): Promise<Notification> {
  const list = await loadAll();
  const row: Notification = { id: (list.at(-1)?.id ?? 0) + 1, createdAt: Date.now(), state: 'new', ...n };
  list.push(row); await saveAll(list); return row;
}
async function getById(id: number) { return (await loadAll()).find(n => n.id === id); }
async function list(filters: { state?: string; station?: string; route?: string; flight?: string; limit?: number; offset?: number }) {
  let data = await loadAll();
  if (filters.state)   data = data.filter(n => n.state === filters.state);
  if (filters.station) data = data.filter(n => n.station === filters.station);
  if (filters.route)   data = data.filter(n => n.route === filters.route);
  if (filters.flight)  data = data.filter(n => n.flight === filters.flight);
  data.sort((a,b) => b.createdAt - a.createdAt);
  const start = filters.offset ?? 0;
  const end   = start + (filters.limit ?? 50);
  return data.slice(start, end);
}
async function ack(id: number) {
  const list = await loadAll();
  const i = list.findIndex(n => n.id === id); if (i === -1) return false;
  list[i].state = 'ack'; list[i].acknowledgedAt = Date.now(); await saveAll(list); return true;
}
async function resolve(id: number) {
  const list = await loadAll();
  const i = list.findIndex(n => n.id === id); if (i === -1) return false;
  list[i].state = 'resolved'; list[i].resolvedAt = Date.now(); await saveAll(list); return true;
}

/* ---------------------------- human message gen --------------------------- */
function humanMessage(type: EventType, body: any): string {
  switch (type) {
    case 'SpecChange': {
      const drawer = body.drawer ?? 'carrito';
      const route = body.route ?? 'ruta';
      const flight = body.flight ?? 'vuelo';
      const station = body.station ?? 'estación';
      const before = body.before?.name ?? 'un producto';
      const after  = body.after?.name ?? 'otro producto';
      return `En ${drawer} del ${flight} (${route}) en ${station}: cambia ${before} por ${after}.`;
    }
    case 'Substitution': {
      const product = body.productName ?? body.productCode ?? 'producto';
      const substitute = body.substituteName ?? body.substituteCode ?? 'sustituto';
      const scopeRoute = body.route ?? body.scope?.route ?? '';
      const flights = body.flight ?? (Array.isArray(body.scope?.flights) ? body.scope.flights.join(', ') : '');
      const where = [scopeRoute, flights && `vuelos ${flights}`].filter(Boolean).join(' · ');
      return `Sustituir ${product} por ${substitute}${where ? ` — ${where}` : ''}.`;
    }
    case 'ExpirySoon': {
      const prod = body.productName ?? body.productCode ?? 'producto';
      const lot  = body.lot ? ` (lote ${body.lot})` : '';
      const cut  = body.cutDate ? new Date(body.cutDate).toLocaleString() : 'pronto';
      return `${prod}${lot} está por caducar. Retira o reemplaza antes de ${cut}.`;
    }
    case 'StockOut': {
      const prod = body.productName ?? body.productCode ?? 'producto';
      const where = [body.station, body.route].filter(Boolean).join(' · ');
      return `${prod} sin stock${where ? ` en ${where}` : ''}. Aplica sustitución o ajusta cantidades.`;
    }
    case 'PredictionRule': {
      const what  = body.itemName ?? body.drawer ?? 'ítem';
      const adj   = body.recommendation ?? 'ajuste recomendado';
      const scope = [body.route, body.turno && `turno ${body.turno}`].filter(Boolean).join(' · ');
      return `${what}: ${adj}${scope ? ` — ${scope}` : ''}.`;
    }
    default:
      return body?.message ?? 'Revisión requerida.';
  }
}

/* --------------------------------- server -------------------------------- */
const app = express();
app.use(cors());
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket: Socket) => {
  socket.on('subscribe', (ctx: { station?: string; routes?: string[]; flights?: string[] }) => {
    if (ctx.station) socket.join(`station:${ctx.station}`);
    ctx.routes?.forEach(r => socket.join(`route:${r}`));
    ctx.flights?.forEach(f => socket.join(`flight:${f}`));
  });
});

function emitToScope(row: Notification) {
  const rooms = new Set<string>();
  if (row.station) rooms.add(`station:${row.station}`);
  if (row.route)   rooms.add(`route:${row.route}`);
  if (row.flight)  rooms.add(`flight:${row.flight}`);
  if (rooms.size === 0) io.emit('notification:new', row);
  else rooms.forEach(room => io.to(room).emit('notification:new', row));
}

/* ---------------------------------- api ---------------------------------- */
app.get('/health', (_: Request, res: Response) => res.json({ ok: true }));

app.get('/notifications', async (req: Request, res: Response) => {
  const { state, station, route, flight, limit = 50, offset = 0 } = req.query as any;
  const data = await list({ state, station, route, flight, limit: Number(limit), offset: Number(offset) });
  res.json({ data });
});

app.post('/notifications/:id/ack', async (req: Request, res: Response) => {
  const ok = await ack(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Not found' });
  io.emit('notification:ack', { id: Number(req.params.id) });
  res.json({ ok: true });
});

app.post('/notifications/:id/resolve', async (req: Request, res: Response) => {
  const ok = await resolve(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Not found' });
  io.emit('notification:resolved', { id: Number(req.params.id) });
  res.json({ ok: true });
});

/* ------------------------------ event routes ------------------------------ */
app.post('/events/spec-change', async (req: Request, res: Response) => {
  const { drawer, route, flight, station, before, after, deadlineTs } = req.body;
  const message = humanMessage('SpecChange', req.body);

  const row = await add({
    type: 'SpecChange',
    severity: 'high',
    drawer, route, flight, station,
    productCode: after?.productCode,
    payload: { message, drawer, route, flight, station, before, after },
    deadlineTs
  });

  emitToScope(row);
  res.status(201).json({ id: row.id });
});

app.post('/events/expiry-soon', async (req: Request, res: Response) => {
  const { productCode, productName, lot, cutDate, route, station } = req.body;
  const message = humanMessage('ExpirySoon', req.body);

  const row = await add({
    type: 'ExpirySoon',
    severity: 'urgent',
    route, station, productCode,
    payload: { message, productCode, productName, lot, cutDate, route, station }
  });

  emitToScope(row);
  res.status(201).json({ id: row.id });
});

app.post('/events/substitution', async (req: Request, res: Response) => {
  const { productCode, productName, substituteCode, substituteName, route, flight, scope } = req.body;
  const message = humanMessage('Substitution', req.body);

  const row = await add({
    type: 'Substitution',
    severity: 'high',
    route, flight, productCode,
    payload: { message, productCode, productName, substituteCode, substituteName, route, flight, scope }
  });

  emitToScope(row);
  res.status(201).json({ id: row.id });
});

/* -------------- opcionales si quieres usarlos también --------------- */
app.post('/events/stock-out', async (req: Request, res: Response) => {
  const message = humanMessage('StockOut', req.body);
  const row = await add({
    type: 'StockOut',
    severity: 'high',
    route: req.body.route,
    station: req.body.station,
    productCode: req.body.productCode,
    payload: { message, ...req.body }
  });
  emitToScope(row);
  res.status(201).json({ id: row.id });
});

app.post('/events/prediction', async (req: Request, res: Response) => {
  const message = humanMessage('PredictionRule', req.body);
  const row = await add({
    type: 'PredictionRule',
    severity: 'info',
    route: req.body.route,
    payload: { message, ...req.body }
  });
  emitToScope(row);
  res.status(201).json({ id: row.id });
});

/* --------------------------------- start --------------------------------- */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`[notifications-json] listening on :${PORT}`));
