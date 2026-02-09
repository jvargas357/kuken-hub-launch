import { useState, useEffect, useCallback } from "react";

export type WidgetDisplayType = "key-value" | "list" | "log-feed" | "gauge";
export type WidgetSize = "1x1" | "2x1" | "2x2";

export interface Widget {
  id: string;
  title: string;
  displayType: WidgetDisplayType;
  apiUrl: string;
  jsonPath: string;
  pollInterval: number; // seconds
  size: WidgetSize;
  accentColor?: string;
  iconName: string;
  order: number;
  // Mappings for list/key-value types
  fieldMappings?: {
    titleField?: string;
    subtitleField?: string;
    labelField?: string;
    valueField?: string;
  };
  // Gauge-specific
  gaugeMax?: number;
  gaugeLabel?: string;
  gaugeValueField?: string;
}

const STORAGE_KEY = "homelab-widgets-v1";

const MOCK_WIDGETS: Widget[] = [
  {
    id: "mock-jellyfin",
    title: "Recently Added",
    displayType: "list",
    apiUrl: "https://jellyfin.jambiya.me/Items/Latest",
    jsonPath: "",
    pollInterval: 30,
    size: "2x1",
    accentColor: "jellyfin",
    iconName: "Film",
    order: 0,
    fieldMappings: { titleField: "Name", subtitleField: "ProductionYear" },
  },
  {
    id: "mock-logs",
    title: "System Logs",
    displayType: "log-feed",
    apiUrl: "https://api.jambiya.me/logs",
    jsonPath: "entries",
    pollInterval: 5,
    size: "2x1",
    accentColor: "primary",
    iconName: "Terminal",
    order: 1,
  },
  {
    id: "mock-stats",
    title: "Server Stats",
    displayType: "key-value",
    apiUrl: "https://api.jambiya.me/stats",
    jsonPath: "",
    pollInterval: 10,
    size: "1x1",
    accentColor: "nextcloud",
    iconName: "BarChart3",
    order: 2,
    fieldMappings: { labelField: "label", valueField: "value" },
  },
  {
    id: "mock-disk",
    title: "Disk Usage",
    displayType: "gauge",
    apiUrl: "https://glances.jambiya.me/api/4/fs",
    jsonPath: "0",
    pollInterval: 15,
    size: "1x1",
    accentColor: "vaultwarden",
    iconName: "HardDrive",
    order: 3,
    gaugeMax: 100,
    gaugeLabel: "Used",
    gaugeValueField: "percent",
  },
];

// Mock data for preview
const MOCK_DATA: Record<string, any> = {
  "mock-jellyfin": [
    { Name: "Dune: Part Two", ProductionYear: "2024" },
    { Name: "Shogun", ProductionYear: "2024" },
    { Name: "3 Body Problem", ProductionYear: "2024" },
    { Name: "Fallout", ProductionYear: "2024" },
  ],
  "mock-logs": {
    entries: [
      "2026-02-09 14:32:01 [nginx] GET /api/health 200 2ms",
      "2026-02-09 14:31:58 [docker] container jellyfin health: ok",
      "2026-02-09 14:31:45 [system] cron backup-daily completed",
      "2026-02-09 14:31:30 [nginx] GET /dashboard 200 8ms",
      "2026-02-09 14:31:12 [docker] container vaultwarden health: ok",
      "2026-02-09 14:30:59 [certbot] renewal check: all certs valid",
      "2026-02-09 14:30:45 [nginx] GET /api/stats 200 3ms",
    ],
  },
  "mock-stats": [
    { label: "Containers", value: "12 running" },
    { label: "Images", value: "28 total" },
    { label: "Volumes", value: "9 active" },
    { label: "Networks", value: "4 configured" },
  ],
  "mock-disk": [{ percent: 47.3 }],
};

function seedDefaults(): Widget[] {
  return MOCK_WIDGETS;
}

export function useWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Widget[];
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
      const newWidget: Widget = {
        ...widget,
        id: crypto.randomUUID(),
        order: maxOrder + 1,
      };
      persist([...widgets, newWidget]);
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
    (id: string) => {
      persist(widgets.filter((w) => w.id !== id));
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
      persist(sorted.map((w, i) => ({ ...w, order: i })));
    },
    [widgets, persist]
  );

  return { widgets, loaded, addWidget, updateWidget, removeWidget, reorderWidget };
}

// Extract data from API response using dot-notation path
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

// Get mock data for a widget
export function getMockData(widgetId: string): any {
  return MOCK_DATA[widgetId] ?? null;
}
