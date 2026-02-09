import { motion } from "framer-motion";
import {
  Play, Film, FolderSync, ShieldAlert, AlertTriangle, Database,
} from "lucide-react";
import { recentActivity, type ActivityItem } from "./mockData";

const iconMap: Record<string, React.ReactNode> = {
  Play: <Play className="h-3.5 w-3.5" />,
  Film: <Film className="h-3.5 w-3.5" />,
  FolderSync: <FolderSync className="h-3.5 w-3.5" />,
  ShieldAlert: <ShieldAlert className="h-3.5 w-3.5" />,
  AlertTriangle: <AlertTriangle className="h-3.5 w-3.5" />,
  Database: <Database className="h-3.5 w-3.5" />,
};

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  info: { bg: "hsl(210, 80%, 55%, 0.1)", text: "hsl(210, 80%, 55%)", dot: "hsl(210, 80%, 55%)" },
  warning: { bg: "hsl(40, 85%, 55%, 0.1)", text: "hsl(40, 85%, 55%)", dot: "hsl(40, 85%, 55%)" },
  error: { bg: "hsl(0, 72%, 51%, 0.1)", text: "hsl(0, 72%, 51%)", dot: "hsl(0, 72%, 51%)" },
};

function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const style = statusStyles[item.status || "info"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0"
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {iconMap[item.icon]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground truncate">{item.title}</span>
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ backgroundColor: style.dot }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed truncate">
          {item.description}
        </p>
      </div>
      <span className="text-[10px] text-muted-foreground/50 font-mono whitespace-nowrap shrink-0 mt-1">
        {item.timestamp}
      </span>
    </motion.div>
  );
}

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
          Activity & Alerts
        </h3>
      </div>
      <div className="divide-y divide-border/0">
        {recentActivity.map((item, i) => (
          <ActivityRow key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
