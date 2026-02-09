import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Clock, X, Plus } from "lucide-react";
import type { SystemMetric } from "./mockData";
import { useCustomItems } from "@/hooks/useCustomItems";
import { systemMetrics as defaultMetrics } from "./mockData";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

// Add id to default metrics
const defaultMetricsWithId = defaultMetrics.map((m, i) => ({ ...m, id: `metric-${i}` }));

function MetricCard({ metric, index, isAdmin, onRemove }: { metric: SystemMetric & { id: string }; index: number; isAdmin: boolean; onRemove: () => void }) {
  const percent = metric.label === "Uptime" ? 100 : (metric.value / metric.max) * 100;
  const color = statusColor[metric.status];
  const displayValue = metric.label === "Disk" ? `${metric.value}/${metric.max}` : metric.value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-xl px-4 py-3.5 flex flex-col gap-2.5 min-w-0 relative group"
    >
      {isAdmin && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {iconMap[metric.icon] || <Cpu className="h-4 w-4" />}
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

interface AddMetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (metric: SystemMetric & { id: string }) => void;
}

function AddMetricDialog({ open, onOpenChange, onAdd }: AddMetricDialogProps) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [max, setMax] = useState("");
  const [unit, setUnit] = useState("");
  const [icon, setIcon] = useState("Cpu");
  const [status, setStatus] = useState<"healthy" | "warning" | "critical">("healthy");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd({
      id: `metric-${crypto.randomUUID().slice(0, 8)}`,
      label: label.trim(),
      value: Number(value) || 0,
      max: Number(max) || 100,
      unit: unit.trim() || "%",
      icon,
      status,
    });
    setLabel(""); setValue(""); setMax(""); setUnit("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Add Metric</DialogTitle>
          <DialogDescription>Add a new system health metric to the dashboard.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. GPU" className="bg-secondary border-border" required />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Value</Label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="23" className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Max</Label>
              <Input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="100" className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Unit</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="%" className="bg-secondary border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.keys(iconMap).map((k) => (
                    <SelectItem key={k} value={k}><span className="flex items-center gap-2">{iconMap[k]} {k}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SystemHealthCards({ isAdmin, addOpen, setAddOpen }: { isAdmin: boolean; addOpen: boolean; setAddOpen: (v: boolean) => void }) {
  const { items, addItem, removeItem } = useCustomItems<SystemMetric & { id: string }>("metrics", defaultMetricsWithId);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((metric, i) => (
          <MetricCard key={metric.id} metric={metric} index={i} isAdmin={isAdmin} onRemove={() => removeItem(metric.id)} />
        ))}
      </div>
      <AddMetricDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addItem} />
    </>
  );
}
