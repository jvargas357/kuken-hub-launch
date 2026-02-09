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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_OPTIONS } from "@/components/ServiceDialog";
import type { Widget, WidgetDisplayType, WidgetSize } from "@/hooks/useWidgets";

const DISPLAY_TYPE_OPTIONS: { value: WidgetDisplayType; label: string; desc: string }[] = [
  { value: "key-value", label: "Key-Value", desc: "Labeled stats grid" },
  { value: "list", label: "List", desc: "Titled items feed" },
  { value: "log-feed", label: "Log Feed", desc: "Scrolling text lines" },
  { value: "gauge", label: "Gauge", desc: "Percentage bar" },
];

const SIZE_OPTIONS: { value: WidgetSize; label: string }[] = [
  { value: "1x1", label: "Normal (1×1)" },
  { value: "2x1", label: "Wide (2×1)" },
  { value: "3x1", label: "Extra Wide (3×1)" },
  { value: "1x2", label: "Tall (1×2)" },
  { value: "2x2", label: "Large (2×2)" },
];

interface WidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (widget: Omit<Widget, "id" | "order">) => void;
  editingWidget?: Widget | null;
}

const WidgetDialog = ({ open, onOpenChange, onSubmit, editingWidget }: WidgetDialogProps) => {
  const [title, setTitle] = useState("");
  const [displayType, setDisplayType] = useState<WidgetDisplayType>("key-value");
  const [apiUrl, setApiUrl] = useState("");
  const [jsonPath, setJsonPath] = useState("");
  const [pollInterval, setPollInterval] = useState("10");
  const [size, setSize] = useState<WidgetSize>("1x1");
  const [iconName, setIconName] = useState("BarChart3");
  const [titleField, setTitleField] = useState("");
  const [subtitleField, setSubtitleField] = useState("");
  const [labelField, setLabelField] = useState("");
  const [valueField, setValueField] = useState("");
  const [gaugeValueField, setGaugeValueField] = useState("");
  const [gaugeMax, setGaugeMax] = useState("100");
  const [gaugeLabel, setGaugeLabel] = useState("%");

  useEffect(() => {
    if (editingWidget) {
      setTitle(editingWidget.title);
      setDisplayType(editingWidget.displayType);
      setApiUrl(editingWidget.apiUrl);
      setJsonPath(editingWidget.jsonPath);
      setPollInterval(String(editingWidget.pollInterval));
      setSize(editingWidget.size);
      setIconName(editingWidget.iconName);
      setTitleField(editingWidget.fieldMappings?.titleField || "");
      setSubtitleField(editingWidget.fieldMappings?.subtitleField || "");
      setLabelField(editingWidget.fieldMappings?.labelField || "");
      setValueField(editingWidget.fieldMappings?.valueField || "");
      setGaugeValueField(editingWidget.gaugeValueField || "");
      setGaugeMax(String(editingWidget.gaugeMax || 100));
      setGaugeLabel(editingWidget.gaugeLabel || "%");
    } else {
      setTitle("");
      setDisplayType("key-value");
      setApiUrl("");
      setJsonPath("");
      setPollInterval("10");
      setSize("1x1");
      setIconName("BarChart3");
      setTitleField("");
      setSubtitleField("");
      setLabelField("");
      setValueField("");
      setGaugeValueField("");
      setGaugeMax("100");
      setGaugeLabel("%");
    }
  }, [editingWidget, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      displayType,
      apiUrl: apiUrl.trim(),
      jsonPath: jsonPath.trim(),
      pollInterval: Math.max(1, parseInt(pollInterval) || 10),
      size,
      iconName,
      accentColor: editingWidget?.accentColor,
      fieldMappings: {
        titleField: titleField.trim() || undefined,
        subtitleField: subtitleField.trim() || undefined,
        labelField: labelField.trim() || undefined,
        valueField: valueField.trim() || undefined,
      },
      gaugeValueField: gaugeValueField.trim() || undefined,
      gaugeMax: parseFloat(gaugeMax) || 100,
      gaugeLabel: gaugeLabel.trim() || "%",
    });
    onOpenChange(false);
  };

  const isEditing = !!editingWidget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !bg-card border-border sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            {isEditing ? "Edit Widget" : "Add Widget"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this widget's configuration."
              : "Add a new widget to display data from an API."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Title</Label>
            <Input
              placeholder="e.g. Recently Added"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          {/* Display Type + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Display Type</Label>
              <Select value={displayType} onValueChange={(v) => setDisplayType(v as WidgetDisplayType)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DISPLAY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex flex-col">
                        <span>{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground/50">{opt.desc}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Size</Label>
              <Select value={size} onValueChange={(v) => setSize(v as WidgetSize)}>
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

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Icon</Label>
            <Select value={iconName} onValueChange={setIconName}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-48">
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

          {/* Data source section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
              Data Source
            </p>

            <div className="space-y-2">
              <Label className="text-muted-foreground">API URL</Label>
              <Input
                placeholder="https://api.jambiya.me/proxy?target=..."
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="bg-secondary border-border font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">JSON Path</Label>
                <Input
                  placeholder="e.g. data.items"
                  value={jsonPath}
                  onChange={(e) => setJsonPath(e.target.value)}
                  className="bg-secondary border-border font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Poll (seconds)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="10"
                  value={pollInterval}
                  onChange={(e) => setPollInterval(e.target.value)}
                  className="bg-secondary border-border font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Field mappings — context-dependent */}
          {(displayType === "list" || displayType === "key-value") && (
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                Field Mappings
              </p>

              {displayType === "list" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Title field</Label>
                    <Input
                      placeholder="e.g. Name"
                      value={titleField}
                      onChange={(e) => setTitleField(e.target.value)}
                      className="bg-secondary border-border font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Subtitle field</Label>
                    <Input
                      placeholder="e.g. DateCreated"
                      value={subtitleField}
                      onChange={(e) => setSubtitleField(e.target.value)}
                      className="bg-secondary border-border font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {displayType === "key-value" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Label field</Label>
                    <Input
                      placeholder="e.g. label"
                      value={labelField}
                      onChange={(e) => setLabelField(e.target.value)}
                      className="bg-secondary border-border font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Value field</Label>
                    <Input
                      placeholder="e.g. value"
                      value={valueField}
                      onChange={(e) => setValueField(e.target.value)}
                      className="bg-secondary border-border font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {displayType === "gauge" && (
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                Gauge Config
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Value field</Label>
                  <Input
                    placeholder="percent"
                    value={gaugeValueField}
                    onChange={(e) => setGaugeValueField(e.target.value)}
                    className="bg-secondary border-border font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Max</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={gaugeMax}
                    onChange={(e) => setGaugeMax(e.target.value)}
                    className="bg-secondary border-border font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Unit label</Label>
                  <Input
                    placeholder="%"
                    value={gaugeLabel}
                    onChange={(e) => setGaugeLabel(e.target.value)}
                    className="bg-secondary border-border font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

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

export default WidgetDialog;
