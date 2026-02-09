import { useState, useEffect, useCallback } from "react";

export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  iconName: string;
  accentColor?: string;
  glowClass?: string;
  colSpan: number;
  rowSpan: number;
  order: number;
}

const STORAGE_KEY = "homelab-services-v2";

const DEFAULT_SERVICES: Omit<Service, "id">[] = [
  { name: "Jellyfin", description: "Media server", url: "https://jellyfin.jambiya.me", iconName: "Film", accentColor: "jellyfin", glowClass: "glow-jellyfin", colSpan: 1, rowSpan: 1, order: 0 },
  { name: "Vaultwarden", description: "Password manager", url: "https://vault.jambiya.me", iconName: "ShieldCheck", accentColor: "vaultwarden", glowClass: "glow-vaultwarden", colSpan: 1, rowSpan: 1, order: 1 },
  { name: "Nextcloud", description: "Cloud storage", url: "https://cloud.jambiya.me", iconName: "Cloud", accentColor: "nextcloud", glowClass: "glow-nextcloud", colSpan: 1, rowSpan: 1, order: 2 },
];

function migrateService(s: any): Service {
  // Migrate old "size" field to colSpan/rowSpan
  if (s.size && !s.colSpan) {
    const [c, r] = s.size.split("x").map(Number);
    return { ...s, colSpan: c || 1, rowSpan: r || 1, size: undefined };
  }
  return { ...s, colSpan: s.colSpan || 1, rowSpan: s.rowSpan || 1 };
}

function seedDefaults(): Service[] {
  return DEFAULT_SERVICES.map((s, i) => ({ ...s, id: `default-${i}` }));
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored).map(migrateService) as Service[];
        setServices(parsed.sort((a, b) => a.order - b.order));
      } else {
        const defaults = seedDefaults();
        setServices(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch {
      const defaults = seedDefaults();
      setServices(defaults);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Service[]) => {
    const sorted = [...next].sort((a, b) => a.order - b.order);
    setServices(sorted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  }, []);

  const addService = useCallback(
    (service: Omit<Service, "id" | "order">) => {
      const maxOrder = services.length > 0 ? Math.max(...services.map((s) => s.order)) : -1;
      persist([...services, { ...service, id: crypto.randomUUID(), order: maxOrder + 1 }]);
    },
    [services, persist]
  );

  const updateService = useCallback(
    (id: string, updates: Partial<Omit<Service, "id">>) => {
      persist(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    },
    [services, persist]
  );

  const removeService = useCallback(
    (id: string) => { persist(services.filter((s) => s.id !== id)); },
    [services, persist]
  );

  const moveService = useCallback(
    (id: string, direction: "up" | "down") => {
      const sorted = [...services].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;
      const tempOrder = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
      sorted[swapIdx] = { ...sorted[swapIdx], order: tempOrder };
      persist(sorted);
    },
    [services, persist]
  );

  const reorderService = useCallback(
    (dragId: string, targetId: string, side: "before" | "after") => {
      const sorted = [...services].sort((a, b) => a.order - b.order);
      const dragIdx = sorted.findIndex((s) => s.id === dragId);
      const targetIdx = sorted.findIndex((s) => s.id === targetId);
      if (dragIdx < 0 || targetIdx < 0 || dragIdx === targetIdx) return;
      const [dragged] = sorted.splice(dragIdx, 1);
      const newTargetIdx = sorted.findIndex((s) => s.id === targetId);
      const insertIdx = side === "before" ? newTargetIdx : newTargetIdx + 1;
      sorted.splice(insertIdx, 0, dragged);
      persist(sorted.map((s, i) => ({ ...s, order: i })));
    },
    [services, persist]
  );

  return { services, loaded, addService, updateService, removeService, moveService, reorderService };
}
