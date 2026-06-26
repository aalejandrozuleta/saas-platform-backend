export type WsTarget = 'broadcast' | { userId: string };

export interface WsNotificationPayload {
  event: string;
  target: WsTarget;
  data: Record<string, unknown>;
}
