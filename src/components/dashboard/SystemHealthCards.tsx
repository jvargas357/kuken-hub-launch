import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Clock } from "lucide-react";
import { systemMetrics, type SystemMetric } from "./mockData";

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-4 w-4" />,
  MemoryStick: <MemoryStick className="h-4 w-4" />,
  HardDrive: <HardDrive className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
};

const statusColor: Record<string, string> = {
  healthy: "hsl(155, 65%, 45%)",
  warning: "hsl(40, 85%, 55%)",
  critical: "hsl(0, 72%, 51%)",
};

function MetricCard({ metric, index }: { metric: SystemMetric; index: number }) {
  const percent = metric.label === "Uptime" ? 100 : (metric.value / metric.max) * 100;
  const color = statusColor[metric.status];
  const displayValue = metric.label === "Disk" ? `${metric.value}/${metric.max}` : metric.value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-xl px-4 py-3.5 flex flex-col gap-2.5 min-w-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {iconMap[metric.icon]}
          </div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
            {metric.label}
          </span>
        </div>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-foreground leading-none">
          {displayValue}
        </span>
        <span className="text-[11px] text-muted-foreground font-mono">{metric.unit}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-secondary/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
}

export default function SystemHealthCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {systemMetrics.map((metric, i) => (
        <MetricCard key={metric.label} metric={metric} index={i} />
      ))}
    </div>
  );
}
