import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "dashboard-items-";

/**
 * Generic hook for managing a list of items with localStorage persistence
 * and optional API endpoint fetching.
 */
export function useCustomItems<T extends { id: string }>(
  key: string,
  defaults: T[]
) {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const endpointKey = `${STORAGE_PREFIX}${key}-endpoint`;
  const [items, setItems] = useState<T[]>([]);
  const [endpoint, setEndpointState] = useState<string>("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(defaults);
        localStorage.setItem(storageKey, JSON.stringify(defaults));
      }
      const ep = localStorage.getItem(endpointKey);
      if (ep) setEndpointState(ep);
    } catch {
      setItems(defaults);
    }
    setLoaded(true);
  }, [storageKey, endpointKey]);

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const addItem = useCallback(
    (item: T) => {
      persist([...items, item]);
    },
    [items, persist]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<T>) => {
      persist(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    },
    [items, persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      persist(items.filter((item) => item.id !== id));
    },
    [items, persist]
  );

  const setEndpoint = useCallback(
    (url: string) => {
      setEndpointState(url);
      if (url) {
        localStorage.setItem(endpointKey, url);
      } else {
        localStorage.removeItem(endpointKey);
      }
    },
    [endpointKey]
  );

  const fetchFromEndpoint = useCallback(async () => {
    if (!endpoint) return;
    setFetching(true);
    setFetchError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        persist(data);
      } else if (data.items && Array.isArray(data.items)) {
        persist(data.items);
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setFetching(false);
    }
  }, [endpoint, persist]);

  return {
    items,
    loaded,
    addItem,
    updateItem,
    removeItem,
    endpoint,
    setEndpoint,
    fetchFromEndpoint,
    fetching,
    fetchError,
    setItems: persist,
  };
}
