import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleSectionProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  onRemove: () => void;
  isAdmin: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  collapsed,
  onToggle,
  onRemove,
  isAdmin,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={!collapsed} onOpenChange={() => onToggle()}>
      <div className="flex items-center gap-3 mb-4">
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
          <button
            onClick={onRemove}
            className="ml-auto h-5 w-5 flex items-center justify-center rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Remove ${title} section`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
