import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { ExternalLink, X, Pencil, GripVertical } from "lucide-react";
import type { ReactNode } from "react";
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
import type { ServiceSize } from "@/hooks/useServices";

interface ServiceCardProps {
  name: string;
  description: string;
  url: string;
  icon: ReactNode;
  accentColor?: string;
  glowClass?: string;
  size: ServiceSize;
  index: number;
  isAdmin: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isDragMode?: boolean;
  isDraggingThis?: boolean;
  dragOverSide?: "before" | "after" | null;
  onRemove: () => void;
  onEdit: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (side: "before" | "after") => void;
  onDragLeave?: () => void;
  onDrop?: () => void;
}

const ServiceCard = ({
  name,
  url,
  icon,
  accentColor,
  glowClass,
  size,
  index,
  isAdmin,
  isDragMode,
  isDraggingThis,
  dragOverSide,
  onRemove,
  onEdit,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: ServiceCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const colorStyle = accentColor ? `hsl(var(--${accentColor}))` : undefined;
  const sizeClasses: Record<string, string> = {
    "1x1": "",
    "2x1": "col-span-2",
    "3x1": "col-span-2 sm:col-span-3",
    "1x2": "row-span-2",
    "2x2": "col-span-2 row-span-2",
  };
  const sizeClass = sizeClasses[size] || "";
  const isInDragMode = isDragMode && isAdmin;

  const jellyRotate = useMotionValue(0);
  const jellyScale = useMotionValue(1);

  const startJelly = () => {
    animate(jellyRotate, [0, -2, 3, -2, 1.5, -1, 0.5, 0], { duration: 0.6, ease: "easeOut" });
    animate(jellyScale, [1, 1.05, 0.97, 1.03, 0.99, 1.01, 1], { duration: 0.6, ease: "easeOut" });
  };

  const handleNativeDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    startJelly();
    onDragStart?.();
  };

  const handleNativeDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!onDragOver || isDraggingThis) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    onDragOver(e.clientX < midX ? "before" : "after");
  };

  const handleNativeDragEnd = () => onDragEnd?.();
  const handleNativeDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); onDrop?.(); };
  const handleNativeDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    onDragLeave?.();
  };

  const cardContent = (
    <>
      {/* Noise texture */}
      <div className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjgiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

      {/* Accent orb */}
      <div
        className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-[0.04] sm:opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none blur-2xl"
        style={{ backgroundColor: colorStyle || "hsl(var(--primary))" }}
      />

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-3 right-3 h-[1px] rounded-full transition-opacity duration-500 opacity-20 sm:opacity-0 group-hover:opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, ${colorStyle || "hsl(var(--primary))"}, transparent)`,
        }}
      />

      {/* Admin controls — only in reorder/add mode */}
      {isAdmin && isInDragMode && (
        <div className="absolute bottom-2 right-2 flex items-center gap-0.5 z-10">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
            className="h-5 w-5 flex items-center justify-center rounded bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Edit ${name}`}
          >
            <Pencil className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmOpen(true); }}
            className="h-5 w-5 flex items-center justify-center rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            aria-label={`Remove ${name}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}

      {/* External link */}
      {!isInDragMode && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <ExternalLink className="h-3 w-3 text-muted-foreground/40" />
        </div>
      )}

      {/* Drag handle */}
      {isInDragMode && (
        <div className="absolute top-2 right-2 text-muted-foreground/60">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col justify-between w-full h-full min-h-[80px] relative z-[1]">
        {/* Icon */}
        <div className="relative w-fit">
          <div
            className="absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500 scale-150"
            style={{ backgroundColor: colorStyle || "hsl(var(--primary))" }}
          />
          <div
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: colorStyle ? `hsl(var(--${accentColor}) / 0.12)` : "hsl(var(--primary) / 0.12)",
              color: colorStyle || "hsl(var(--primary))",
              border: `1px solid ${colorStyle ? `hsl(var(--${accentColor}) / 0.15)` : "hsl(var(--primary) / 0.15)"}`,
            }}
          >
            <div className="scale-[0.85]">{icon}</div>
          </div>
        </div>

        {/* Name + status */}
        <div className="mt-auto pt-2">
          <h3 className="font-display text-[13px] sm:text-[14px] font-semibold text-foreground truncate leading-tight">{name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="h-1 w-1 rounded-full shrink-0"
              style={{
                backgroundColor: colorStyle || "hsl(var(--primary))",
                boxShadow: `0 0 4px 1px ${colorStyle || "hsl(var(--primary))"} / 0.5`,
              }}
            />
            <span className="text-[9px] text-muted-foreground/60 font-mono uppercase tracking-widest">Online</span>
          </div>
        </div>
      </div>
    </>
  );

  const innerClassName = `glass-card ${glowClass || ""} group relative flex flex-col items-start rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 transition-all duration-200 ${
    isInDragMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
  } hover:border-primary/30 w-full h-full min-h-[100px] overflow-hidden`;

  return (
    <>
      <div
        className={`${sizeClass} relative`}
        draggable={isInDragMode}
        onDragStart={isInDragMode ? handleNativeDragStart : undefined}
        onDragEnd={isInDragMode ? handleNativeDragEnd : undefined}
        onDragOver={isInDragMode ? handleNativeDragOver : undefined}
        onDragLeave={isInDragMode ? handleNativeDragLeave : undefined}
        onDrop={isInDragMode ? handleNativeDrop : undefined}
      >
        {/* Drop indicators */}
        <AnimatePresence>
          {dragOverSide === "before" && (
            <motion.div
              key="indicator-before"
              initial={{ opacity: 0, scaleY: 0.6 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute -left-[5px] top-1 bottom-1 w-[2px] rounded-full bg-primary z-10 pointer-events-none shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]"
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {dragOverSide === "after" && (
            <motion.div
              key="indicator-after"
              initial={{ opacity: 0, scaleY: 0.6 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute -right-[5px] top-1 bottom-1 w-[2px] rounded-full bg-primary z-10 pointer-events-none shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]"
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {dragOverSide && (
            <motion.div
              key="ghost-outline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute inset-0 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.06] z-[5] pointer-events-none"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{
            opacity: isDraggingThis ? 0.35 : 1,
            y: 0,
            scale: isDraggingThis ? 0.95 : 1,
          }}
          transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotate: jellyRotate, scale: jellyScale }}
          whileHover={isInDragMode ? undefined : { y: -3, scale: 1.015 }}
          whileTap={isInDragMode ? undefined : { scale: 0.98 }}
        >
          {isInDragMode ? (
            <div className={innerClassName}>{cardContent}</div>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className={innerClassName}>
              {cardContent}
            </a>
          )}
        </motion.div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the service from your dashboard. You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onRemove()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServiceCard;
