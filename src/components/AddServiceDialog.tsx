import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor,
  Shield,
  Database,
  Mail,
  Download,
  HardDrive,
  Wifi,
  Camera,
  Gamepad2,
  BarChart3,
  Globe,
  Terminal,
  Container,
  Home,
  Music,
  Image,
} from "lucide-react";
import type { ReactNode } from "react";

export const ICON_OPTIONS: { value: string; label: string; icon: ReactNode }[] = [
  { value: "Monitor", label: "Monitor", icon: <Monitor className="h-4 w-4" /> },
  { value: "Shield", label: "Shield", icon: <Shield className="h-4 w-4" /> },
  { value: "Database", label: "Database", icon: <Database className="h-4 w-4" /> },
  { value: "Mail", label: "Mail", icon: <Mail className="h-4 w-4" /> },
  { value: "Download", label: "Download", icon: <Download className="h-4 w-4" /> },
  { value: "HardDrive", label: "Hard Drive", icon: <HardDrive className="h-4 w-4" /> },
  { value: "Wifi", label: "Wifi", icon: <Wifi className="h-4 w-4" /> },
  { value: "Camera", label: "Camera", icon: <Camera className="h-4 w-4" /> },
  { value: "Gamepad2", label: "Gamepad", icon: <Gamepad2 className="h-4 w-4" /> },
  { value: "BarChart3", label: "Chart", icon: <BarChart3 className="h-4 w-4" /> },
  { value: "Globe", label: "Globe", icon: <Globe className="h-4 w-4" /> },
  { value: "Terminal", label: "Terminal", icon: <Terminal className="h-4 w-4" /> },
  { value: "Container", label: "Container", icon: <Container className="h-4 w-4" /> },
  { value: "Home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { value: "Music", label: "Music", icon: <Music className="h-4 w-4" /> },
  { value: "Image", label: "Image", icon: <Image className="h-4 w-4" /> },
];

export function getIconByName(name: string): ReactNode {
  const match = ICON_OPTIONS.find((o) => o.value === name);
  if (!match) return <Globe className="h-6 w-6" />;
  // Return a larger version for the card
  const Icon = {
    Monitor, Shield, Database, Mail, Download, HardDrive,
    Wifi, Camera, Gamepad2, BarChart3, Globe, Terminal,
    Container, Home, Music, Image,
  }[name];
  return Icon ? <Icon className="h-6 w-6" /> : <Globe className="h-6 w-6" />;
}

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (service: { name: string; description: string; url: string; iconName: string }) => void;
}

const AddServiceDialog = ({ open, onOpenChange, onAdd }: AddServiceDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [iconName, setIconName] = useState("Globe");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      iconName,
    });
    setName("");
    setDescription("");
    setUrl("");
    setIconName("Globe");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">Add Service</DialogTitle>
          <DialogDescription>
            Add a new self-hosted service to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Portainer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-muted-foreground">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Container management UI"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-muted-foreground">URL</Label>
            <Input
              id="url"
              placeholder="https://portainer.kuken.ffse"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Icon</Label>
            <Select value={iconName} onValueChange={setIconName}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceDialog;
