import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Download } from "lucide-react";
import { quickActions, type QuickAction } from "./mockData";
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
import { toast } from "sonner";

const iconMap: Record<string, React.ReactNode> = {
  RotateCcw: <RotateCcw className="h-4 w-4" />,
  Download: <Download className="h-4 w-4" />,
};

function ActionCard({ action, index }: { action: QuickAction; index: number }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    toast.success(`${action.label} triggered successfully (mock)`);
    setConfirmOpen(false);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setConfirmOpen(true)}
        className={`glass-card rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer text-left transition-colors hover:border-primary/30 ${
          action.destructive ? "hover:border-destructive/30" : ""
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            action.destructive
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          {iconMap[action.icon]}
        </div>
        <div className="min-w-0">
          <p className="font-display text-[13px] font-semibold text-foreground">{action.label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{action.description}</p>
        </div>
      </motion.button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action.label}</AlertDialogTitle>
            <AlertDialogDescription>{action.confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={action.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function QuickActions({ isAdmin }: { isAdmin: boolean }) {
  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
          Quick Actions
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickActions.map((action, i) => (
          <ActionCard key={action.id} action={action} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
