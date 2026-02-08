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
import PythonOutput from "@/components/PythonOutput";
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
  pythonEndpoint?: string;
  pythonScript?: string;
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
  description,
  url,
  icon,
  accentColor,
  glowClass,
  size,
  index,
  isAdmin,
  pythonEndpoint,
  pythonScript,
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
  const hasPython = !!(pythonEndpoint && pythonScript);
  const colorStyle = accentColor ? `hsl(var(--${accentColor}))` : undefined;
  const sizeClass = size === "2x1" ? "sm:col-span-2" : "";
  const isInDragMode = isDragMode && isAdmin;

  // Jelly animation values
  const jellyRotate = useMotionValue(0);
  const jellyScale = useMotionValue(1);

  const startJelly = () => {
    animate(jellyRotate, [0, -2, 3, -2, 1.5, -1, 0.5, 0], {
      duration: 0.6,
      ease: "easeOut",
    });
    animate(jellyScale, [1, 1.05, 0.97, 1.03, 0.99, 1.01, 1], {
      duration: 0.6,
      ease: "easeOut",
    });
  };

  // Native HTML5 drag event handlers (on the plain wrapper div)
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

  const handleNativeDragEnd = () => {
    onDragEnd?.();
  };

  const handleNativeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop?.();
  };

  const handleNativeDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only fire if leaving the card entirely, not entering a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    onDragLeave?.();
  };

  const cardContent = (
    <>
      {/* Accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-150"
        style={{ backgroundColor: colorStyle || "hsl(var(--primary))" }}
      />

      {/* Admin controls — visible on hover */}
      {isAdmin && !isInDragMode && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
            className="h-7 w-7 flex items-center justify-center rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Edit ${name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmOpen(true); }}
            className="h-7 w-7 flex items-center justify-center rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            aria-label={`Remove ${name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Drag handle in drag mode */}
      {isInDragMode && (
        <div className="absolute top-3 right-3 text-muted-foreground/60">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <div className="flex w-full items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-150"
          style={{
            backgroundColor: colorStyle ? `hsl(var(--${accentColor}) / 0.12)` : "hsl(var(--primary) / 0.12)",
            color: colorStyle || "hsl(var(--primary))",
          }}
        >
          {icon}
        </div>
        {!isInDragMode && (
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {hasPython && !isInDragMode && (
        <PythonOutput endpoint={pythonEndpoint!} script={pythonScript!} />
      )}

      {!hasPython && (
        <div className="flex items-center gap-2 mt-auto">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: colorStyle || "hsl(var(--primary))" }}
          />
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Online</span>
        </div>
      )}
    </>
  );

  const innerClassName = `glass-card ${glowClass || ""} group relative flex flex-col items-start gap-4 rounded-xl p-6 transition-all duration-150 ${
    isInDragMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
  } hover:border-primary/30 w-full h-full`;

  return (
    <>
      {/* Outer wrapper: plain div handles HTML5 drag events; motion.div handles animations */}
      <div
        className={`${sizeClass} relative`}
        draggable={isInDragMode}
        onDragStart={isInDragMode ? handleNativeDragStart : undefined}
        onDragEnd={isInDragMode ? handleNativeDragEnd : undefined}
        onDragOver={isInDragMode ? handleNativeDragOver : undefined}
        onDragLeave={isInDragMode ? handleNativeDragLeave : undefined}
        onDrop={isInDragMode ? handleNativeDrop : undefined}
      >
        {/* Ghost drop indicator — glowing line on the side */}
        <AnimatePresence>
          {dragOverSide === "before" && (
            <motion.div
              key="indicator-before"
              initial={{ opacity: 0, scaleY: 0.6 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute -left-[6px] top-1 bottom-1 w-[3px] rounded-full bg-primary z-10 pointer-events-none shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]"
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
              className="absolute -right-[6px] top-1 bottom-1 w-[3px] rounded-full bg-primary z-10 pointer-events-none shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]"
            />
          )}
        </AnimatePresence>

        {/* Ghost card outline — dashed border overlay */}
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

        {/* Animated card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: isDraggingThis ? 0.35 : 1,
            y: 0,
            scale: isDraggingThis ? 0.95 : 1,
          }}
          transition={{
            duration: 0.35,
            delay: index * 0.07,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ rotate: jellyRotate, scale: jellyScale }}
          whileHover={isInDragMode ? undefined : { y: -4, scale: 1.02 }}
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
