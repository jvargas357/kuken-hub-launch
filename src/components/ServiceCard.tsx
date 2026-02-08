import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, X, Pencil, ArrowUp, ArrowDown } from "lucide-react";
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
  onRemove: () => void;
  onEdit: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
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
  isFirst,
  isLast,
  pythonEndpoint,
  pythonScript,
  onRemove,
  onEdit,
  onMoveUp,
  onMoveDown,
}: ServiceCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasPython = !!(pythonEndpoint && pythonScript);
  const colorStyle = accentColor ? `hsl(var(--${accentColor}))` : undefined;
  const sizeClass = size === "2x1" ? "sm:col-span-2" : "";

  return (
    <>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`glass-card ${glowClass || ""} ${sizeClass} group relative flex flex-col items-start gap-4 rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-primary/30`}
      >
        {/* Accent line */}
        <div
          className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300"
          style={{ backgroundColor: colorStyle || "hsl(var(--primary))" }}
        />

        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onMoveUp && !isFirst && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveUp(); }}
                className="h-6 w-6 flex items-center justify-center rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label={`Move ${name} up`}
              >
                <ArrowUp className="h-3 w-3" />
              </button>
            )}
            {onMoveDown && !isLast && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveDown(); }}
                className="h-6 w-6 flex items-center justify-center rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label={`Move ${name} down`}
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
              className="h-6 w-6 flex items-center justify-center rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label={`Edit ${name}`}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmOpen(true); }}
              className="h-6 w-6 flex items-center justify-center rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              aria-label={`Remove ${name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex w-full items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300"
            style={{
              backgroundColor: colorStyle
                ? `hsl(var(--${accentColor}) / 0.12)`
                : "hsl(var(--primary) / 0.12)",
              color: colorStyle || "hsl(var(--primary))",
            }}
          >
            {icon}
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Python output */}
        {hasPython && (
          <PythonOutput endpoint={pythonEndpoint!} script={pythonScript!} />
        )}

        {/* Status dot */}
        {!hasPython && (
          <div className="flex items-center gap-2 mt-auto">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: colorStyle || "hsl(var(--primary))" }}
            />
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Online
            </span>
          </div>
        )}
      </motion.a>

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
