export type Severity = 'urgent' | 'high' | 'info';
export type EventType = 'SpecChange' | 'Substitution' | 'ExpirySoon' | 'StockOut' | 'PredictionRule';

export interface NotificationDTO {
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
}

export interface NewsItem {
  id: number;
  Title: string;
  Body: string;
  Date: string;
  Ruta?: string | null;
  Vuelo?: string | null;
  Estacion?: string | null;
}
