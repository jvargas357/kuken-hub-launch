import { useState, useEffect, useCallback } from "react";

const GLANCES_URL_KEY = "glances-api-url";
const DEFAULT_URL = "https://glances.jambiya.me/api/4";

export interface GlancesStats {
  cpu: { total: number; user: number; system: number } | null;
  mem: { percent: number; used: number; total: number } | null;
  fs: { device_name: string; percent: number; used: number; size: number; mnt_point: string }[];
  uptime: string | null;
  hostname: string | null;
  load: { min1: number; min5: number; min15: number } | null;
  network: { interface_name: string; rx: number; tx: number }[];
}

export function useGlances() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem(GLANCES_URL_KEY) || DEFAULT_URL);
  const [stats, setStats] = useState<GlancesStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateApiUrl = useCallback((url: string) => {
    const trimmed = url.trim().replace(/\/+$/, "");
    setApiUrl(trimmed);
    localStorage.setItem(GLANCES_URL_KEY, trimmed);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const endpoints = ["cpu", "mem", "fs", "uptime", "system", "load", "network/interface"];
      const results = await Promise.allSettled(
        endpoints.map((e) =>
          fetch(`${apiUrl}/${e}`).then((r) => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.json();
          })
        )
      );

      const get = (i: number) => (results[i].status === "fulfilled" ? results[i].value : null);

      const cpuData = get(0);
      const memData = get(1);
      const fsData = get(2);
      const uptimeData = get(3);
      const systemData = get(4);
      const loadData = get(5);
      const netData = get(6);

      setStats({
        cpu: cpuData ? { total: cpuData.total, user: cpuData.user, system: cpuData.system } : null,
        mem: memData ? { percent: memData.percent, used: memData.used, total: memData.total } : null,
        fs: Array.isArray(fsData)
          ? fsData.map((d: any) => ({
              device_name: d.device_name,
              percent: d.percent,
              used: d.used,
              size: d.size,
              mnt_point: d.mnt_point,
            }))
          : [],
        uptime: uptimeData ?? null,
        hostname: systemData?.hostname ?? null,
        load: loadData ? { min1: loadData.min1, min5: loadData.min5, min15: loadData.min15 } : null,
        network: Array.isArray(netData)
          ? netData.map((n: any) => ({
              interface_name: n.interface_name,
              rx: n.bytes_recv_rate_per_sec ?? n.rx ?? 0,
              tx: n.bytes_sent_rate_per_sec ?? n.tx ?? 0,
            }))
          : [],
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, error, loading, apiUrl, updateApiUrl, refresh: fetchStats };
}
