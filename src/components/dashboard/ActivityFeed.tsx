import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Film, FolderSync, ShieldAlert, AlertTriangle, Database, X, Bell, Info,
} from "lucide-react";
import type { ActivityItem } from "./mockData";
import { recentActivity as defaultActivity } from "./mockData";
import { useCustomItems } from "@/hooks/useCustomItems";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const iconMap: Record<string, React.ReactNode> = {
  Play: <Play className="h-3.5 w-3.5" />,
  Film: <Film className="h-3.5 w-3.5" />,
  FolderSync: <FolderSync className="h-3.5 w-3.5" />,
  ShieldAlert: <ShieldAlert className="h-3.5 w-3.5" />,
  AlertTriangle: <AlertTriangle className="h-3.5 w-3.5" />,
  Database: <Database className="h-3.5 w-3.5" />,
  Bell: <Bell className="h-3.5 w-3.5" />,
  Info: <Info className="h-3.5 w-3.5" />,
};

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  info: { bg: "hsl(210, 80%, 55%, 0.1)", text: "hsl(210, 80%, 55%)", dot: "hsl(210, 80%, 55%)" },
  warning: { bg: "hsl(40, 85%, 55%, 0.1)", text: "hsl(40, 85%, 55%)", dot: "hsl(40, 85%, 55%)" },
  error: { bg: "hsl(0, 72%, 51%, 0.1)", text: "hsl(0, 72%, 51%)", dot: "hsl(0, 72%, 51%)" },
};

function ActivityRow({ item, index, isAdmin, onRemove }: { item: ActivityItem; index: number; isAdmin: boolean; onRemove: () => void }) {
  const style = statusStyles[item.status || "info"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0 group"
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {iconMap[item.icon] || <Info className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground truncate">{item.title}</span>
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed truncate">{item.description}</p>
      </div>
      <span className="text-[10px] text-muted-foreground/50 font-mono whitespace-nowrap shrink-0 mt-1">{item.timestamp}</span>
      {isAdmin && (
        <button
          onClick={onRemove}
          className="h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 mt-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: ActivityItem) => void;
}

function AddActivityDialog({ open, onOpenChange, onAdd }: AddActivityDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"media" | "file" | "security">("media");
  const [status, setStatus] = useState<"info" | "warning" | "error">("info");
  const [icon, setIcon] = useState("Info");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: `act-${crypto.randomUUID().slice(0, 8)}`,
      type,
      title: title.trim(),
      description: description.trim(),
      timestamp: "Just now",
      icon,
      status,
    });
    setTitle(""); setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Add Activity / Alert</DialogTitle>
          <DialogDescription>Add a new entry to the activity feed.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backup Complete" className="bg-secondary border-border" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." className="bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

export default function ActivityFeed({ isAdmin, addOpen, setAddOpen }: { isAdmin: boolean; addOpen: boolean; setAddOpen: (v: boolean) => void }) {
  const { items, addItem, removeItem } = useCustomItems<ActivityItem>("activities", defaultActivity);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card rounded-xl p-5"
      >
        <div className="divide-y divide-border/0">
          {items.map((item, i) => (
            <ActivityRow key={item.id} item={item} index={i} isAdmin={isAdmin} onRemove={() => removeItem(item.id)} />
          ))}
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-4 font-mono">No activity yet</p>
          )}
        </div>
      </motion.div>
      <AddActivityDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addItem} />
    </>
  );
}
