import { motion } from "framer-motion";
import { Cpu, MemoryStick, Activity, Clock } from "lucide-react";
import { useGlances } from "@/hooks/useGlances";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
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
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `hsl(var(--${color}) / 0.1)`,
          color: `hsl(var(--${color}))`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-display text-lg font-bold leading-none ${
              isCritical ? "text-destructive" : isHigh ? "text-yellow-400" : "text-foreground"
            }`}
          >
            {clamped.toFixed(0)}%
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[3px] flex-1 rounded-full bg-secondary/80 overflow-hidden">
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
            <span className="text-[9px] text-muted-foreground/40 font-mono whitespace-nowrap hidden sm:inline">
              {detail}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SystemHealthStrip = () => {
  const { stats, error, loading } = useGlances();

  if (loading && !stats) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-secondary/40 rounded-lg animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-xl px-4 py-3 border-destructive/20"
      >
        <p className="text-[11px] text-muted-foreground/50 font-mono">
          System health unavailable
        </p>
      </motion.div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="glass-card rounded-xl px-5 py-4"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {stats.cpu && (
          <MiniGauge
            value={stats.cpu.total}
            label="CPU"
            icon={<Cpu className="h-3.5 w-3.5" />}
            detail={`usr ${stats.cpu.user.toFixed(0)}%`}
            color="primary"
          />
        )}
        {stats.mem && (
          <MiniGauge
            value={stats.mem.percent}
            label="RAM"
            icon={<MemoryStick className="h-3.5 w-3.5" />}
            detail={`${formatBytes(stats.mem.used)}`}
            color="accent"
          />
        )}
        {stats.load && (
          <MiniGauge
            value={Math.min(stats.load.min1 * 25, 100)}
            label="Load"
            icon={<Activity className="h-3.5 w-3.5" />}
            detail={`${stats.load.min1.toFixed(2)}`}
            color="jellyfin"
          />
        )}
        {stats.uptime && (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "hsl(var(--vaultwarden) / 0.1)",
                color: "hsl(var(--vaultwarden))",
              }}
            >
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-sm font-semibold text-foreground leading-none block truncate">
                {stats.uptime}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest">
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
