import { useState, useEffect } from "react";

export interface CustomService {
  id: string;
  name: string;
  description: string;
  url: string;
  iconName: string;
}

const STORAGE_KEY = "homelab-custom-services";

export function useCustomServices() {
  const [services, setServices] = useState<CustomService[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setServices(JSON.parse(stored));
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  const persist = (next: CustomService[]) => {
    setServices(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addService = (service: Omit<CustomService, "id">) => {
    const newService: CustomService = { ...service, id: crypto.randomUUID() };
    persist([...services, newService]);
  };

  const removeService = (id: string) => {
    persist(services.filter((s) => s.id !== id));
  };

  return { services, addService, removeService };
}
