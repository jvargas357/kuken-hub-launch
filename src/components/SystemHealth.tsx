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
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)}B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)}K/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)}M/s`;
}

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  critical?: boolean;
  high?: boolean;
}

const StatChip = ({ icon, label, value, color = "primary", critical, high }: StatChipProps) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50 border border-border/30 min-w-0">
    <div
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
      style={{ color: critical ? "hsl(var(--destructive))" : high ? "#facc15" : `hsl(var(--${color}))` }}
    >
      {icon}
    </div>
    <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider hidden sm:inline">{label}</span>
    <span className={`font-mono text-[11px] font-semibold leading-none ${
      critical ? "text-destructive" : high ? "text-yellow-400" : "text-foreground"
    }`}>
      {value}
    </span>
  </div>
);

const SystemHealthStrip = () => {
  const { stats, loading } = useGlances();

  if (loading && !stats) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center gap-1.5 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-secondary/40 rounded-lg animate-pulse" />
        ))}
      </motion.div>
    );
  }

  if (!stats) return null;

  const totalRx = stats.network.reduce((sum, n) => sum + n.rx, 0);
  const totalTx = stats.network.reduce((sum, n) => sum + n.tx, 0);
  const primaryDisk = stats.fs[0] ?? null;

  const chips: React.ReactNode[] = [];

  if (stats.cpu) {
    chips.push(
      <StatChip key="cpu" icon={<Cpu className="h-3 w-3" />} label="CPU" value={`${stats.cpu.total.toFixed(0)}%`}
        color="primary" critical={stats.cpu.total > 90} high={stats.cpu.total > 80} />
    );
  }
  if (stats.mem) {
    chips.push(
      <StatChip key="ram" icon={<MemoryStick className="h-3 w-3" />} label="RAM"
        value={`${stats.mem.percent.toFixed(0)}%`}
        color="accent" critical={stats.mem.percent > 90} high={stats.mem.percent > 80} />
    );
  }
  if (stats.load) {
    chips.push(
      <StatChip key="load" icon={<Activity className="h-3 w-3" />} label="Load"
        value={stats.load.min1.toFixed(2)} color="jellyfin" />
    );
  }
  if (primaryDisk) {
    chips.push(
      <StatChip key="disk" icon={<HardDrive className="h-3 w-3" />} label="Disk"
        value={`${primaryDisk.percent.toFixed(0)}%`}
        color="nextcloud" critical={primaryDisk.percent > 90} high={primaryDisk.percent > 80} />
    );
  }
  if (stats.network.length > 0) {
    chips.push(
      <StatChip key="net" icon={<ArrowDownUp className="h-3 w-3" />} label="Net"
        value={`↓${formatRate(totalRx)} ↑${formatRate(totalTx)}`} color="primary" />
    );
  }
  if (stats.uptime) {
    chips.push(
      <StatChip key="up" icon={<Clock className="h-3 w-3" />} label="Up"
        value={stats.uptime} color="vaultwarden" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-start gap-1.5"
    >
      <div className="flex flex-wrap justify-start gap-1.5">
        {chips}
      </div>
    </motion.div>
  );
};

export default SystemHealthStrip;
