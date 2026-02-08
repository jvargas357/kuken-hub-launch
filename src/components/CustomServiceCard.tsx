import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
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

interface CustomServiceCardProps {
  name: string;
  description: string;
  url: string;
  icon: ReactNode;
  index: number;
  isAdmin: boolean;
  onRemove?: () => void;
}

const CustomServiceCard = ({
  name,
  description,
  url,
  icon,
  index,
  isAdmin,
  onRemove,
}: CustomServiceCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card group relative flex flex-col items-start gap-4 rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-primary/30"
      >
        {/* Accent line */}
        <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-primary opacity-40 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Remove button */}
        {isAdmin && onRemove && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-md bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-destructive/20"
            aria-label={`Remove ${name}`}
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <div className="flex w-full items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/12 text-primary transition-colors duration-300">
            {icon}
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="space-y-1">
          <h3 className="font-mono text-lg font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Online
          </span>
        </div>
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
              onClick={() => onRemove?.()}
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

export default CustomServiceCard;
