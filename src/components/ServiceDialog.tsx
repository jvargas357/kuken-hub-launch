import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor, Shield, Database, Mail, Download, HardDrive,
  Wifi, Camera, Gamepad2, BarChart3, Globe, Terminal,
  Container, Home, Music, Image, Film, ShieldCheck, Cloud,
  Code,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Service, ServiceSize } from "@/hooks/useServices";
import NerdFontIcon, { NERD_FONT_GLYPHS } from "@/components/NerdFontIcon";

/** Lucide icon options */
const LUCIDE_ICON_OPTIONS: { value: string; label: string; icon: ReactNode }[] = [
  { value: "Film", label: "Film", icon: <Film className="h-4 w-4" /> },
  { value: "ShieldCheck", label: "Shield Check", icon: <ShieldCheck className="h-4 w-4" /> },
  { value: "Cloud", label: "Cloud", icon: <Cloud className="h-4 w-4" /> },
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
  { value: "Code", label: "Code", icon: <Code className="h-4 w-4" /> },
];

/** Nerd Font icon options */
const NF_ICON_OPTIONS: { value: string; label: string; icon: ReactNode }[] = Object.entries(
  NERD_FONT_GLYPHS
).map(([key, { glyph, label }]) => ({
  value: key,
  label,
  icon: <NerdFontIcon glyph={glyph} className="text-base" />,
}));

/** Combined icon list (Lucide first, then Nerd Fonts) */
export const ICON_OPTIONS = [...LUCIDE_ICON_OPTIONS, ...NF_ICON_OPTIONS];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Film, ShieldCheck, Cloud, Monitor, Shield, Database, Mail, Download,
  HardDrive, Wifi, Camera, Gamepad2, BarChart3, Globe, Terminal,
  Container, Home, Music, Image, Code,
};

export function getIconByName(name: string): ReactNode {
  // Nerd Font icon
  if (name.startsWith("nf-")) {
    const nf = NERD_FONT_GLYPHS[name];
    if (nf) return <NerdFontIcon glyph={nf.glyph} className="text-2xl" />;
  }
  // Lucide icon
  const Icon = ICON_MAP[name];
  return Icon ? <Icon className="h-6 w-6" /> : <Globe className="h-6 w-6" />;
}

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (service: Omit<Service, "id" | "order">) => void;
  editingService?: Service | null;
}

const SIZE_OPTIONS: { value: ServiceSize; label: string }[] = [
  { value: "1x1", label: "Normal (1×1)" },
  { value: "2x1", label: "Wide (2×1)" },
];

const ServiceDialog = ({ open, onOpenChange, onSubmit, editingService }: ServiceDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [iconName, setIconName] = useState("Globe");
  const [size, setSize] = useState<ServiceSize>("1x1");
  const [pythonEndpoint, setPythonEndpoint] = useState("");
  const [pythonScript, setPythonScript] = useState("");
  const [showPython, setShowPython] = useState(false);

  useEffect(() => {
    if (editingService) {
      setName(editingService.name);
      setDescription(editingService.description);
      setUrl(editingService.url);
      setIconName(editingService.iconName);
      setSize(editingService.size);
      setPythonEndpoint(editingService.pythonEndpoint || "");
      setPythonScript(editingService.pythonScript || "");
      setShowPython(!!(editingService.pythonEndpoint || editingService.pythonScript));
    } else {
      setName("");
      setDescription("");
      setUrl("");
      setIconName("Globe");
      setSize("1x1");
      setPythonEndpoint("");
      setPythonScript("");
      setShowPython(false);
    }
  }, [editingService, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      iconName,
      size,
      accentColor: editingService?.accentColor,
      glowClass: editingService?.glowClass,
      pythonEndpoint: pythonEndpoint.trim() || undefined,
      pythonScript: pythonScript.trim() || undefined,
    });
    onOpenChange(false);
  };

  const isEditing = !!editingService;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !bg-card border-border sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            {isEditing ? "Edit Service" : "Add Service"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this service's settings."
              : "Add a new self-hosted service to your dashboard."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svc-name" className="text-muted-foreground">Name</Label>
            <Input
              id="svc-name"
              placeholder="e.g. Portainer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-desc" className="text-muted-foreground">Description</Label>
            <Input
              id="svc-desc"
              placeholder="e.g. Container management UI"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-url" className="text-muted-foreground">URL</Label>
            <Input
              id="svc-url"
              placeholder="https://portainer.jambiya.me"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Icon</Label>
              <Select value={iconName} onValueChange={setIconName}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-48">
                  <SelectItem disabled value="__lucide_header" className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Lucide Icons
                  </SelectItem>
                  {LUCIDE_ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.icon}
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem disabled value="__nf_header" className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-2">
                    Nerd Font Icons
                  </SelectItem>
                  {NF_ICON_OPTIONS.map((opt) => (
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

            <div className="space-y-2">
              <Label className="text-muted-foreground">Size</Label>
              <Select value={size} onValueChange={(v) => setSize(v as ServiceSize)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Python Section */}
          <div className="space-y-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setShowPython(!showPython)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Code className="h-4 w-4" />
              <span>{showPython ? "Hide" : "Show"} Python Execution</span>
            </button>

            {showPython && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="svc-py-endpoint" className="text-muted-foreground">
                    Python API Endpoint
                  </Label>
                  <Input
                    id="svc-py-endpoint"
                    placeholder="https://api.jambiya.me/execute"
                    value={pythonEndpoint}
                    onChange={(e) => setPythonEndpoint(e.target.value)}
                    className="bg-secondary border-border font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="svc-py-script" className="text-muted-foreground">
                    Python Script
                  </Label>
                  <Textarea
                    id="svc-py-script"
                    placeholder={"import requests\nresult = requests.get('https://...')\nprint(result.json())"}
                    value={pythonScript}
                    onChange={(e) => setPythonScript(e.target.value)}
                    className="bg-secondary border-border font-mono text-xs min-h-[120px]"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;
