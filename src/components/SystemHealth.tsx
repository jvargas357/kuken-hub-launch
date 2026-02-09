import { motion } from "framer-motion";
import { Cpu, MemoryStick, Activity, Clock, HardDrive, ArrowDownUp } from "lucide-react";
import { useGlances } from "@/hooks/useGlances";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatRate(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

interface MiniGaugeProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  detail?: string;
  color?: string;
}

const MiniGauge = ({ value, label, icon, detail, color = "primary" }: MiniGaugeProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  const isCritical = clamped > 90;
  const isHigh = clamped > 80;

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `hsl(var(--${color}) / 0.1)`,
          color: `hsl(var(--${color}))`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-display text-base font-bold leading-none ${
              isCritical ? "text-destructive" : isHigh ? "text-yellow-400" : "text-foreground"
            }`}
          >
            {clamped.toFixed(0)}%
          </span>
          <span className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-widest">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="h-[2px] flex-1 rounded-full bg-secondary/80 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clamped}%` }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className={`h-full rounded-full ${
                isCritical ? "bg-destructive" : isHigh ? "bg-yellow-400" : ""
              }`}
              style={
                !isCritical && !isHigh
                  ? { backgroundColor: `hsl(var(--${color}))` }
                  : undefined
              }
            />
          </div>
          {detail && (
            <span className="text-[8px] text-muted-foreground/40 font-mono whitespace-nowrap hidden md:inline">
              {detail}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SystemHealthStrip = () => {
  const { stats, loading, isMock } = useGlances();

  if (loading && !stats) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-xl p-3"
      >
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-secondary/40 rounded-lg animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!stats) return null;

  const totalRx = stats.network.reduce((sum, n) => sum + n.rx, 0);
  const totalTx = stats.network.reduce((sum, n) => sum + n.tx, 0);
  const primaryDisk = stats.fs[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="glass-card rounded-xl px-3.5 py-3 sm:px-4 sm:py-3"
    >
      {isMock && (
        <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-border/30">
          <div className="h-1 w-1 rounded-full bg-yellow-400/60" />
          <span className="font-mono text-[8px] text-muted-foreground/40 uppercase tracking-widest">
            Mock data — connect Glances for live stats
          </span>
        </div>
      )}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-3">
        {stats.cpu && (
          <MiniGauge
            value={stats.cpu.total}
            label="CPU"
            icon={<Cpu className="h-3 w-3" />}
            detail={`usr ${stats.cpu.user.toFixed(0)}%`}
            color="primary"
          />
        )}
        {stats.mem && (
          <MiniGauge
            value={stats.mem.percent}
            label="RAM"
            icon={<MemoryStick className="h-3 w-3" />}
            detail={`${formatBytes(stats.mem.used)}`}
            color="accent"
          />
        )}
        {stats.load && (
          <MiniGauge
            value={Math.min(stats.load.min1 * 25, 100)}
            label="Load"
            icon={<Activity className="h-3 w-3" />}
            detail={`${stats.load.min1.toFixed(2)}`}
            color="jellyfin"
          />
        )}
        {primaryDisk && (
          <MiniGauge
            value={primaryDisk.percent}
            label="Disk"
            icon={<HardDrive className="h-3 w-3" />}
            detail={`${formatBytes(primaryDisk.used)}`}
            color="nextcloud"
          />
        )}
        {stats.network.length > 0 && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
              }}
            >
              <ArrowDownUp className="h-3 w-3" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] text-muted-foreground/60">
                  ↓{formatRate(totalRx)}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/60">
                  ↑{formatRate(totalTx)}
                </span>
              </div>
              <span className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-widest">
                Net
              </span>
            </div>
          </div>
        )}
        {stats.uptime && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "hsl(var(--vaultwarden) / 0.1)",
                color: "hsl(var(--vaultwarden))",
              }}
            >
              <Clock className="h-3 w-3" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-xs font-semibold text-foreground leading-none block truncate">
                {stats.uptime}
              </span>
              <span className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-widest">
                Uptime
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SystemHealthStrip;
