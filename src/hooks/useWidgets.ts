import { useState, useEffect, useCallback } from "react";

export type WidgetDisplayType = "key-value" | "list" | "log-feed" | "gauge";

export interface Widget {
  id: string;
  title: string;
  displayType: WidgetDisplayType;
  apiUrl: string;
  jsonPath: string;
  pollInterval: number;
  colSpan: number;
  rowSpan: number;
  accentColor?: string;
  iconName: string;
  order: number;
  fieldMappings?: {
    titleField?: string;
    subtitleField?: string;
    labelField?: string;
    valueField?: string;
  };
  gaugeMax?: number;
  gaugeLabel?: string;
  gaugeValueField?: string;
}

const STORAGE_KEY = "homelab-widgets-v1";

function migrateWidget(w: any): Widget {
  if (w.size && !w.colSpan) {
    const [c, r] = w.size.split("x").map(Number);
    return { ...w, colSpan: c || 1, rowSpan: r || 1, size: undefined };
  }
  return { ...w, colSpan: w.colSpan || 1, rowSpan: w.rowSpan || 1 };
}

function seedDefaults(): Widget[] {
  return [];
}

export function useWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored).map(migrateWidget) as Widget[];
        setWidgets(parsed.sort((a, b) => a.order - b.order));
      } else {
        const defaults = seedDefaults();
        setWidgets(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch {
      const defaults = seedDefaults();
      setWidgets(defaults);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Widget[]) => {
    const sorted = [...next].sort((a, b) => a.order - b.order);
    setWidgets(sorted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  }, []);

  const addWidget = useCallback(
    (widget: Omit<Widget, "id" | "order">) => {
      const maxOrder = widgets.length > 0 ? Math.max(...widgets.map((w) => w.order)) : -1;
      persist([...widgets, { ...widget, id: crypto.randomUUID(), order: maxOrder + 1 }]);
    },
    [widgets, persist]
  );

  const updateWidget = useCallback(
    (id: string, updates: Partial<Omit<Widget, "id">>) => {
      persist(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    },
    [widgets, persist]
  );

  const removeWidget = useCallback(
    (id: string) => { persist(widgets.filter((w) => w.id !== id)); },
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
      persist(sorted.map((w, i) => ({ ...w, order: i })));
    },
    [widgets, persist]
  );

  return { widgets, loaded, addWidget, updateWidget, removeWidget, reorderWidget };
}

export function extractByPath(data: any, path: string): any {
  if (!path || path.trim() === "") return data;
  const keys = path.split(".");
  let result = data;
  for (const key of keys) {
    if (result == null) return null;
    result = Array.isArray(result) && /^\d+$/.test(key) ? result[parseInt(key)] : result[key];
  }
  return result;
}
