import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Download, X, Zap, RefreshCw, Trash2 } from "lucide-react";
import type { QuickAction } from "./mockData";
import { quickActions as defaultActions } from "./mockData";
import { useCustomItems } from "@/hooks/useCustomItems";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const iconMap: Record<string, React.ReactNode> = {
  RotateCcw: <RotateCcw className="h-4 w-4" />,
  Download: <Download className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  RefreshCw: <RefreshCw className="h-4 w-4" />,
  Trash2: <Trash2 className="h-4 w-4" />,
};

function ActionCard({ action, index, isAdmin, onRemove }: { action: QuickAction; index: number; isAdmin: boolean; onRemove: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    toast.success(`${action.label} triggered successfully (mock)`);
    setConfirmOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
        className="relative group"
      >
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setConfirmOpen(true)}
          className={`glass-card rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer text-left transition-colors hover:border-primary/30 w-full ${
            action.destructive ? "hover:border-destructive/30" : ""
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              action.destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            }`}
          >
            {iconMap[action.icon] || <Zap className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[13px] font-semibold text-foreground">{action.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{action.description}</p>
          </div>
        </motion.button>
        {isAdmin && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all z-10"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </motion.div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action.label}</AlertDialogTitle>
            <AlertDialogDescription>{action.confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className={action.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface AddActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (action: QuickAction) => void;
}

function AddActionDialog({ open, onOpenChange, onAdd }: AddActionDialogProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [icon, setIcon] = useState("Zap");
  const [destructive, setDestructive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd({
      id: `action-${crypto.randomUUID().slice(0, 8)}`,
      label: label.trim(),
      description: description.trim(),
      confirmMessage: confirmMessage.trim() || `Execute "${label.trim()}"?`,
      icon,
      destructive,
    });
    setLabel(""); setDescription(""); setConfirmMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Add Quick Action</DialogTitle>
          <DialogDescription>Add a new quick action to the dashboard.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Clear Cache" className="bg-secondary border-border" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="bg-secondary border-border" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Confirm Message</Label>
            <Input value={confirmMessage} onChange={(e) => setConfirmMessage(e.target.value)} placeholder="Are you sure?" className="bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <Label className="text-muted-foreground text-xs">Destructive?</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch checked={destructive} onCheckedChange={setDestructive} />
                <span className="text-xs text-muted-foreground">{destructive ? "Yes" : "No"}</span>
              </div>
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

export default function QuickActions({ isAdmin, addOpen, setAddOpen }: { isAdmin: boolean; addOpen: boolean; setAddOpen: (v: boolean) => void }) {
  const { items, addItem, removeItem } = useCustomItems<QuickAction>("quick-actions", defaultActions);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((action, i) => (
          <ActionCard key={action.id} action={action} index={i} isAdmin={isAdmin} onRemove={() => removeItem(action.id)} />
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-4 font-mono col-span-2">No actions configured</p>
        )}
      </div>
      <AddActionDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addItem} />
    </>
  );
}
