import { useState, useEffect, useCallback } from "react";

export type WidgetType = "system-health" | "services" | "activity-feed" | "quick-actions";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  collapsed: boolean;
  order: number;
  /** Optional API endpoint to fetch data for this section */
  endpoint?: string;
}

export interface WidgetRegistryEntry {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
  defaultTitle: string;
}

export const widgetRegistry: WidgetRegistryEntry[] = [
  {
    type: "system-health",
    label: "System Health",
    description: "CPU, memory, disk & uptime metrics",
    icon: "Activity",
    defaultTitle: "System Health",
  },
  {
    type: "services",
    label: "Services",
    description: "Self-hosted service links and management",
    icon: "Globe",
    defaultTitle: "Services",
  },
  {
    type: "activity-feed",
    label: "Activity & Alerts",
    description: "Recent activity log and security alerts",
    icon: "Bell",
    defaultTitle: "Activity & Alerts",
  },
  {
    type: "quick-actions",
    label: "Quick Actions",
    description: "Admin shortcuts for common tasks",
    icon: "Zap",
    defaultTitle: "Quick Actions",
  },
];

const STORAGE_KEY = "dashboard-widgets-v2";

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "w-health", type: "system-health", title: "System Health", collapsed: false, order: 0 },
  { id: "w-services", type: "services", title: "Services", collapsed: false, order: 1 },
  { id: "w-activity", type: "activity-feed", title: "Activity & Alerts", collapsed: false, order: 2 },
  { id: "w-actions", type: "quick-actions", title: "Quick Actions", collapsed: false, order: 3 },
];

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWidgets(JSON.parse(stored));
      } else {
        setWidgets(DEFAULT_WIDGETS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WIDGETS));
      }
    } catch {
      setWidgets(DEFAULT_WIDGETS);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: WidgetConfig[]) => {
    const sorted = [...next].sort((a, b) => a.order - b.order);
    setWidgets(sorted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  }, []);

  const addWidget = useCallback(
    (type: WidgetType) => {
      const entry = widgetRegistry.find((r) => r.type === type);
      if (!entry) return;
      const maxOrder = widgets.length > 0 ? Math.max(...widgets.map((w) => w.order)) : -1;
      const newWidget: WidgetConfig = {
        id: `w-${crypto.randomUUID().slice(0, 8)}`,
        type,
        title: entry.defaultTitle,
        collapsed: false,
        order: maxOrder + 1,
      };
      persist([...widgets, newWidget]);
    },
    [widgets, persist]
  );

  const removeWidget = useCallback(
    (id: string) => {
      persist(widgets.filter((w) => w.id !== id));
    },
    [widgets, persist]
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      persist(
        widgets.map((w) => (w.id === id ? { ...w, collapsed: !w.collapsed } : w))
      );
    },
    [widgets, persist]
  );

  const updateWidget = useCallback(
    (id: string, updates: Partial<Pick<WidgetConfig, "title" | "endpoint">>) => {
      persist(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    },
    [widgets, persist]
  );

  const reorderWidget = useCallback(
    (dragId: string, targetId: string, side: "before" | "after") => {
      const sorted = [...widgets].sort((a, b) => a.order - b.order);
      const dragIdx = sorted.findIndex((w) => w.id === dragId);
      const targetIdx = sorted.findIndex((w) => w.id === targetId);
      if (dragIdx < 0 || targetIdx < 0 || dragIdx === targetIdx) return;

      const [dragged] = sorted.splice(dragIdx, 1);
      const newTargetIdx = sorted.findIndex((w) => w.id === targetId);
      const insertIdx = side === "before" ? newTargetIdx : newTargetIdx + 1;
      sorted.splice(insertIdx, 0, dragged);

      const reordered = sorted.map((w, i) => ({ ...w, order: i }));
      persist(reordered);
    },
    [widgets, persist]
  );

  return { widgets, loaded, addWidget, removeWidget, toggleCollapse, updateWidget, reorderWidget };
}
