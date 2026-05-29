"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type NotificationItem = {
  id: string;
  body: string;
  created_at: string;
  source?: { leadUuid: string; leadName: string };
};

type Ctx = {
  items: NotificationItem[];
  setItems: (items: NotificationItem[]) => void;
  push: (item: NotificationItem) => void;
  clear: () => void;
};

const NotificationsContext = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const push = useCallback((item: NotificationItem) => {
    setItems((prev) => [item, ...prev.filter((x) => x.id !== item.id)]);
  }, []);
  const clear = useCallback(() => setItems([]), []);
  return (
    <NotificationsContext.Provider value={{ items, setItems, push, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    return { items: [] as NotificationItem[], setItems: () => {}, push: () => {}, clear: () => {} } satisfies Ctx;
  }
  return ctx;
}
