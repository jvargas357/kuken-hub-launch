import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, GripVertical, Plus, Settings2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleSectionProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onAdd?: () => void;
  onSettings?: () => void;
  isAdmin: boolean;
  isDragMode?: boolean;
  isDragging?: boolean;
  dragOverSide?: "before" | "after" | null;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (side: "before" | "after") => void;
  onDragLeave?: () => void;
  onDrop?: () => void;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  collapsed,
  onToggle,
  onRemove,
  onAdd,
  onSettings,
  isAdmin,
  isDragMode,
  isDragging,
  dragOverSide,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: CollapsibleSectionProps) {
  const handleNativeDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    onDragStart?.();
  };

  const handleNativeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!onDragOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    onDragOver(e.clientY < midY ? "before" : "after");
  };

  return (
    <div
      className="relative"
      draggable={isDragMode && isAdmin}
      onDragStart={isDragMode ? handleNativeDragStart : undefined}
      onDragEnd={isDragMode ? onDragEnd : undefined}
      onDragOver={isDragMode ? handleNativeDragOver : undefined}
      onDragLeave={isDragMode ? (e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        onDragLeave?.();
      } : undefined}
      onDrop={isDragMode ? (e) => { e.preventDefault(); onDrop?.(); } : undefined}
    >
      {/* Drop indicators */}
      <AnimatePresence>
        {dragOverSide === "before" && (
          <motion.div
            key="ind-before"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.5 }}
            className="absolute -top-[4px] left-0 right-0 h-[3px] rounded-full bg-primary z-10 pointer-events-none shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dragOverSide === "after" && (
          <motion.div
            key="ind-after"
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.5 }}
            className="absolute -bottom-[4px] left-0 right-0 h-[3px] rounded-full bg-primary z-10 pointer-events-none shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: isDragging ? 0.35 : 1, scale: isDragging ? 0.98 : 1 }}
        transition={{ duration: 0.15 }}
      >
        <Collapsible open={!collapsed} onOpenChange={() => onToggle()}>
          <div className="flex items-center gap-3 mb-4">
            {isDragMode && isAdmin && (
              <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing shrink-0" />
            )}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="h-[1px] w-12 bg-gradient-to-r from-primary/60 to-transparent origin-left"
            />
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 group cursor-pointer">
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-mono text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em] group-hover:text-muted-foreground transition-colors"
                >
                  {title}
                </motion.p>
                <ChevronDown
                  className={`h-3 w-3 text-muted-foreground/40 transition-transform duration-200 ${
                    collapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>
            </CollapsibleTrigger>

            {isAdmin && (
              <div className="ml-auto flex items-center gap-1">
                {onSettings && (
                  <button
                    onClick={onSettings}
                    className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/30 hover:text-foreground hover:bg-secondary/60 transition-colors"
                    aria-label="Section settings"
                  >
                    <Settings2 className="h-3 w-3" />
                  </button>
                )}
                {onAdd && (
                  <button
                    onClick={onAdd}
                    className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/30 hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label="Add item"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={onRemove}
                  className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={`Remove ${title} section`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
            {children}
          </CollapsibleContent>
        </Collapsible>
      </motion.div>
    </div>
  );
}
