import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Pencil, RefreshCw } from "lucide-react";
import { getIconByName } from "@/components/ServiceDialog";
import { extractByPath, getMockData } from "@/hooks/useWidgets";
import type { Widget } from "@/hooks/useWidgets";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WidgetCardProps {
  widget: Widget;
  index: number;
  isAdmin: boolean;
  isDragMode?: boolean;
  onRemove: () => void;
  onEdit: () => void;
}

const KeyValueDisplay = ({ data, widget }: { data: any; widget: Widget }) => {
  const items = Array.isArray(data) ? data : [];
  const labelField = widget.fieldMappings?.labelField || "label";
  const valueField = widget.fieldMappings?.valueField || "value";
  return (
    <div className="space-y-1.5">
      {items.slice(0, 6).map((item: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground/60 font-mono truncate">{item[labelField] ?? `Item ${i}`}</span>
          <span className="text-[11px] text-foreground font-mono font-medium whitespace-nowrap">{item[valueField] ?? "—"}</span>
        </div>
      ))}
    </div>
  );
};

const ListDisplay = ({ data, widget }: { data: any; widget: Widget }) => {
  const items = Array.isArray(data) ? data : [];
  const titleField = widget.fieldMappings?.titleField || "title";
  const subtitleField = widget.fieldMappings?.subtitleField || "subtitle";
  return (
    <div className="space-y-1">
      {items.slice(0, 5).map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 py-0.5 border-b border-border/20 last:border-0">
          <div className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--${widget.accentColor || "primary"}))` }} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-foreground font-medium truncate leading-tight">{item[titleField] ?? `Item ${i + 1}`}</p>
            {item[subtitleField] && <p className="text-[9px] text-muted-foreground/50 font-mono truncate">{item[subtitleField]}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

const LogFeedDisplay = ({ data }: { data: any }) => {
  const lines = Array.isArray(data) ? data : [];
  return (
    <div className="font-mono text-[9px] leading-relaxed space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-thin">
      {lines.slice(0, 10).map((line: string, i: number) => (
        <p key={i} className="text-muted-foreground/70 truncate hover:text-foreground transition-colors">{String(line)}</p>
      ))}
    </div>
  );
};

const GaugeDisplay = ({ data, widget }: { data: any; widget: Widget }) => {
  const valueField = widget.gaugeValueField || "value";
  const max = widget.gaugeMax || 100;
  const rawValue = typeof data === "number" ? data : data?.[valueField] ?? 0;
  const percent = Math.min(100, Math.max(0, (rawValue / max) * 100));
  const isCritical = percent > 90;
  const isHigh = percent > 80;
  return (
    <div>
      <div className="flex items-end gap-1 mb-1.5">
        <span className={`font-display text-2xl font-bold leading-none ${isCritical ? "text-destructive" : isHigh ? "text-yellow-400" : "text-foreground"}`}>
          {rawValue.toFixed(1)}
        </span>
        <span className="text-muted-foreground/50 text-[10px] font-mono mb-0.5">{widget.gaugeLabel || "%"}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary/80 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className={`h-full rounded-full ${isCritical ? "bg-destructive" : isHigh ? "bg-yellow-400" : ""}`}
          style={!isCritical && !isHigh ? { backgroundColor: `hsl(var(--${widget.accentColor || "primary"}))` } : undefined}
        />
      </div>
    </div>
  );
};

const WidgetCard = ({ widget, index, isAdmin, isDragMode, onRemove, onEdit }: WidgetCardProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const colorStyle = widget.accentColor ? `hsl(var(--${widget.accentColor}))` : "hsl(var(--primary))";
  const sizeClasses: Record<string, string> = {
    "1x1": "",
    "2x1": "col-span-2",
    "3x1": "col-span-2 sm:col-span-3",
    "1x2": "row-span-2",
    "2x2": "col-span-2 row-span-2",
  };
  const sizeClass = sizeClasses[widget.size] || "";

  const fetchData = useCallback(async () => {
    const mock = getMockData(widget.id);
    if (mock) {
      const extracted = extractByPath(mock, widget.jsonPath);
      setData(extracted);
      setLoading(false);
      setError(false);
      return;
    }
    try {
      const res = await fetch(widget.apiUrl);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(extractByPath(json, widget.jsonPath));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [widget.apiUrl, widget.jsonPath, widget.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, widget.pollInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchData, widget.pollInterval]);

  const renderContent = () => {
    if (loading) return <div className="h-12 bg-secondary/30 rounded-lg animate-pulse" />;
    if (error || data == null) return <p className="text-[10px] text-muted-foreground/40 font-mono">No data available</p>;
    switch (widget.displayType) {
      case "key-value": return <KeyValueDisplay data={data} widget={widget} />;
      case "list": return <ListDisplay data={data} widget={widget} />;
      case "log-feed": return <LogFeedDisplay data={data} />;
      case "gauge": return <GaugeDisplay data={data} widget={widget} />;
      default: return null;
    }
  };

  return (
    <>
      <div className={`${sizeClass} relative`}>
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-card group relative rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 h-full min-h-[100px] overflow-hidden">
            {/* Noise */}
            <div className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjgiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

            {/* Accent orb */}
            <div
              className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none blur-2xl"
              style={{ backgroundColor: colorStyle }}
            />

            {/* Bottom accent bar */}
            <div
              className="absolute bottom-0 left-3 right-3 h-[1px] rounded-full transition-opacity duration-500 opacity-0 group-hover:opacity-40"
              style={{ background: `linear-gradient(90deg, transparent, ${colorStyle}, transparent)` }}
            />

            {/* Admin controls — only in reorder/add mode */}
            {isAdmin && isDragMode && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5 z-10">
                <button
                  onClick={onEdit}
                  className="h-5 w-5 flex items-center justify-center rounded bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Pencil className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="h-5 w-5 flex items-center justify-center rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-2 mb-2 relative z-[1]">
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{
                  backgroundColor: `hsl(var(--${widget.accentColor || "primary"}) / 0.12)`,
                  color: colorStyle,
                }}
              >
                <div className="scale-[0.65]">{getIconByName(widget.iconName)}</div>
              </div>
              <h3 className="font-display text-[12px] font-semibold text-foreground truncate leading-tight flex-1">
                {widget.title}
              </h3>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[7px] text-muted-foreground/25 uppercase">{widget.pollInterval}s</span>
                <RefreshCw className="h-2 w-2 text-muted-foreground/20" />
              </div>
            </div>

            <div className="relative z-[1]">{renderContent()}</div>
          </div>
        </motion.div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{widget.title}"?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the widget from your dashboard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WidgetCard;
