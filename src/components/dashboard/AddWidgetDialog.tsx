import { Activity, Bell, Zap, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { widgetRegistry, type WidgetType, type WidgetConfig } from "@/hooks/useDashboardWidgets";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className="h-5 w-5" />,
  Bell: <Bell className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
};

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: WidgetType) => void;
  currentWidgets: WidgetConfig[];
}

export default function AddWidgetDialog({
  open,
  onOpenChange,
  onAdd,
  currentWidgets,
}: AddWidgetDialogProps) {
  const activeTypes = currentWidgets.map((w) => w.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Add Widget</DialogTitle>
          <DialogDescription>Choose a widget to add to your dashboard.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {widgetRegistry.map((entry, i) => {
            const alreadyAdded = activeTypes.includes(entry.type);
            return (
              <motion.button
                key={entry.type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                disabled={alreadyAdded}
                onClick={() => {
                  onAdd(entry.type);
                  onOpenChange(false);
                }}
                className={`w-full glass-card rounded-xl px-4 py-3.5 flex items-center gap-3 text-left transition-colors ${
                  alreadyAdded
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer hover:border-primary/30"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {iconMap[entry.icon]}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[13px] font-semibold text-foreground">
                    {entry.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{entry.description}</p>
                  {alreadyAdded && (
                    <p className="text-[10px] text-primary/60 mt-0.5 font-mono">Already added</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
