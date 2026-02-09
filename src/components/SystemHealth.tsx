import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Clock, Activity, Wifi, Settings2 } from "lucide-react";
import { useState } from "react";
import { useGlances } from "@/hooks/useGlances";
import { Input } from "@/components/ui/input";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatRate(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec)}/s`;
}

interface GaugeProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  detail?: string;
  color?: string;
}

const Gauge = ({ value, label, icon, detail, color = "primary" }: GaugeProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const isHigh = clampedValue > 80;
  const isCritical = clampedValue > 90;

  return (
    <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
      {/* Background accent */}
      <div
        className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-[0.04] blur-2xl pointer-events-none ${
          isCritical ? "bg-destructive" : `bg-${color}`
        }`}
        style={!isCritical ? { backgroundColor: `hsl(var(--${color}))` } : undefined}
      />

      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `hsl(var(--${color}) / 0.12)`,
            color: `hsl(var(--${color}))`,
          }}
        >
          {icon}
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          {label}
        </span>
      </div>

      <div className="flex items-end gap-1.5 mb-2">
        <span
          className={`font-display text-2xl font-bold leading-none ${
            isCritical ? "text-destructive" : isHigh ? "text-yellow-400" : "text-foreground"
          }`}
        >
          {clampedValue.toFixed(0)}
        </span>
        <span className="text-muted-foreground/50 text-xs font-mono mb-0.5">%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-secondary/80 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className={`h-full rounded-full ${
            isCritical
              ? "bg-destructive"
              : isHigh
              ? "bg-yellow-400"
              : ""
          }`}
          style={
            !isCritical && !isHigh
              ? { backgroundColor: `hsl(var(--${color}))` }
              : undefined
          }
        />
      </div>

      {detail && (
        <p className="text-[10px] text-muted-foreground/50 font-mono mt-2 truncate">{detail}</p>
      )}
    </div>
  );
};

const SystemHealth = () => {
  const { stats, error, loading, apiUrl, updateApiUrl } = useGlances();
  const [showSettings, setShowSettings] = useState(false);
  const [urlInput, setUrlInput] = useState(apiUrl);

  if (loading && !stats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="h-[1px] w-12 bg-gradient-to-r from-primary/60 to-transparent origin-left"
          />
          <p className="font-mono text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em]">
            System Health
          </p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-[120px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="h-[1px] w-12 bg-gradient-to-r from-primary/60 to-transparent origin-left"
          />
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="font-mono text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em]"
          >
            System Health
          </motion.p>
          {stats?.hostname && (
            <span className="font-mono text-[10px] text-muted-foreground/30">
              — {stats.hostname}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="flex items-center gap-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card rounded-xl p-4 mb-4"
        >
          <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest block mb-2">
            Glances API URL
          </label>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://glances.jambiya.me/api/4"
              className="bg-secondary border-border font-mono text-xs flex-1"
            />
            <button
              onClick={() => updateApiUrl(urlInput)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
            >
              Save
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-4 border-destructive/30"
        >
          <p className="text-xs text-destructive font-mono">
            Failed to connect to Glances API — check the URL in settings
          </p>
          <p className="text-[10px] text-muted-foreground/40 font-mono mt-1">{apiUrl}</p>
        </motion.div>
      )}

      {stats && (
        <>
          {/* Main gauges */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {stats.cpu && (
              <Gauge
                value={stats.cpu.total}
                label="CPU"
                icon={<Cpu className="h-3.5 w-3.5" />}
                detail={`usr ${stats.cpu.user.toFixed(0)}% · sys ${stats.cpu.system.toFixed(0)}%`}
                color="primary"
              />
            )}
            {stats.mem && (
              <Gauge
                value={stats.mem.percent}
                label="Memory"
                icon={<MemoryStick className="h-3.5 w-3.5" />}
                detail={`${formatBytes(stats.mem.used)} / ${formatBytes(stats.mem.total)}`}
                color="accent"
              />
            )}
            {stats.load && (
              <Gauge
                value={Math.min(stats.load.min1 * 25, 100)}
                label="Load"
                icon={<Activity className="h-3.5 w-3.5" />}
                detail={`${stats.load.min1.toFixed(2)} · ${stats.load.min5.toFixed(2)} · ${stats.load.min15.toFixed(2)}`}
                color="jellyfin"
              />
            )}
            {stats.uptime && (
              <div className="glass-card rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: "hsl(var(--vaultwarden) / 0.12)",
                      color: "hsl(var(--vaultwarden))",
                    }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                    Uptime
                  </span>
                </div>
                <span className="font-display text-lg font-semibold text-foreground leading-none">
                  {stats.uptime}
                </span>
              </div>
            )}
          </div>

          {/* Disk usage */}
          {stats.fs.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest pl-1">
                Disks
              </p>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {stats.fs.map((disk) => (
                  <Gauge
                    key={disk.mnt_point}
                    value={disk.percent}
                    label={disk.mnt_point}
                    icon={<HardDrive className="h-3.5 w-3.5" />}
                    detail={`${formatBytes(disk.used)} / ${formatBytes(disk.size)}`}
                    color="nextcloud"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Network */}
          {stats.network.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest pl-1">
                Network
              </p>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {stats.network
                  .filter((n) => n.rx > 0 || n.tx > 0)
                  .map((net) => (
                    <div key={net.interface_name} className="glass-card rounded-xl p-4 relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: "hsl(var(--primary) / 0.12)",
                            color: "hsl(var(--primary))",
                          }}
                        >
                          <Wifi className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                          {net.interface_name}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[9px] text-muted-foreground/40 font-mono">↓ RX</span>
                          <p className="font-mono text-xs text-foreground">{formatRate(net.rx)}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted-foreground/40 font-mono">↑ TX</span>
                          <p className="font-mono text-xs text-foreground">{formatRate(net.tx)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SystemHealth;
