const QUEUE_KEY = "lud-offline-queue";

export interface OfflineQueueItem {
  id: string;
  type: "quest_log" | "water_log" | "finance_log";
  payload: Record<string, unknown>;
  clientTimestamp: string;
}

function getQueue(): OfflineQueueItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as OfflineQueueItem[];
  } catch {
    return [];
  }
}

function setQueue(items: OfflineQueueItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function pushOfflineQueue(item: OfflineQueueItem) {
  const queue = getQueue();
  queue.push(item);
  setQueue(queue);
}

export function popAllOfflineQueue() {
  const queue = getQueue();
  setQueue([]);
  return queue;
}

export function getOfflineQueueSize() {
  return getQueue().length;
}
