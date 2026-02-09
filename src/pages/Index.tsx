import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GripVertical, Plus, Check, LayoutGrid, Rows3 } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import AddServiceCard from "@/components/AddServiceCard";
import ServiceDialog from "@/components/ServiceDialog";
import { getIconByName } from "@/components/ServiceDialog";
import SystemHealthStrip from "@/components/SystemHealth";
import WidgetCard from "@/components/WidgetCard";
import WidgetDialog from "@/components/WidgetDialog";
import { useAutheliaUser } from "@/hooks/useAutheliaUser";
import { useServices } from "@/hooks/useServices";
import { useWidgets } from "@/hooks/useWidgets";
import type { Service } from "@/hooks/useServices";
import type { Widget } from "@/hooks/useWidgets";

const LAYOUT_KEY = "dashboard-layout-mode";

const Index = () => {
  const { isAdmin, loading } = useAutheliaUser();
  const { services, loaded, addService, updateService, removeService, reorderService } =
    useServices();
  const { widgets, loaded: widgetsLoaded, addWidget, updateWidget, removeWidget, reorderWidget } = useWidgets();

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [layoutMode, setLayoutMode] = useState<"merged" | "separate">(() => {
    return (localStorage.getItem(LAYOUT_KEY) as "merged" | "separate") || "separate";
  });

  // Drag state — shared for services and widgets
  const [isDragMode, setIsDragMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<"service" | "widget" | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverSide, setDragOverSide] = useState<"before" | "after" | null>(null);

  const toggleLayout = () => {
    const next = layoutMode === "merged" ? "separate" : "merged";
    setLayoutMode(next);
    localStorage.setItem(LAYOUT_KEY, next);
  };

  const handleEditService = (service: Service) => { setEditingService(service); setServiceDialogOpen(true); };
  const handleServiceDialogClose = (open: boolean) => { setServiceDialogOpen(open); if (!open) setEditingService(null); };
  const handleServiceSubmit = (data: Omit<Service, "id" | "order">) => {
    if (editingService) updateService(editingService.id, data); else addService(data);
    setEditingService(null);
  };
  const handleEditWidget = (widget: Widget) => { setEditingWidget(widget); setWidgetDialogOpen(true); };
  const handleWidgetDialogClose = (open: boolean) => { setWidgetDialogOpen(open); if (!open) setEditingWidget(null); };
  const handleWidgetSubmit = (data: Omit<Widget, "id" | "order">) => {
    if (editingWidget) updateWidget(editingWidget.id, data); else addWidget(data);
    setEditingWidget(null);
  };

  // Generic drag handlers
  const handleDragStart = useCallback((id: string, type: "service" | "widget") => {
    setDraggingId(id);
    setDraggingType(type);
  }, []);

  const clearDrag = useCallback(() => {
    setDraggingId(null);
    setDraggingType(null);
    setDragOverId(null);
    setDragOverSide(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggingId && dragOverId && draggingId !== dragOverId && dragOverSide) {
      if (draggingType === "service") reorderService(draggingId, dragOverId, dragOverSide);
      else if (draggingType === "widget") reorderWidget(draggingId, dragOverId, dragOverSide);
    }
    clearDrag();
  }, [draggingId, dragOverId, dragOverSide, draggingType, reorderService, reorderWidget, clearDrag]);

  const handleDragOver = useCallback((targetId: string, side: "before" | "after") => {
    if (targetId === draggingId) return;
    setDragOverId(targetId);
    setDragOverSide(side);
  }, [draggingId]);

  const handleDragLeave = useCallback(() => { setDragOverId(null); setDragOverSide(null); }, []);
  const handleDrop = useCallback(() => { handleDragEnd(); }, [handleDragEnd]);

  const gridClass = "grid gap-2 sm:gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  const renderServiceCards = (startIndex = 0) =>
    loaded && services.map((service, i) => (
      <ServiceCard
        key={service.id} name={service.name} description={service.description} url={service.url}
        icon={getIconByName(service.iconName)} accentColor={service.accentColor} glowClass={service.glowClass}
        size={service.size} index={startIndex + i} isAdmin={isAdmin}
        isFirst={i === 0} isLast={i === services.length - 1}
        isDragMode={isDragMode} isDraggingThis={draggingId === service.id}
        dragOverSide={dragOverId === service.id ? dragOverSide : null}
        onRemove={() => removeService(service.id)} onEdit={() => handleEditService(service)}
        onDragStart={() => handleDragStart(service.id, "service")} onDragEnd={handleDragEnd}
        onDragOver={(side) => handleDragOver(service.id, side)} onDragLeave={handleDragLeave} onDrop={handleDrop}
      />
    ));

  const renderWidgetCards = (startIndex = 0) =>
    widgetsLoaded && widgets.map((widget, i) => (
      <WidgetCard
        key={widget.id} widget={widget} index={startIndex + i} isAdmin={isAdmin}
        isDragMode={isDragMode} isDraggingThis={draggingId === widget.id}
        dragOverSide={dragOverId === widget.id ? dragOverSide : null}
        onRemove={() => removeWidget(widget.id)} onEdit={() => handleEditWidget(widget)}
        onDragStart={() => handleDragStart(widget.id, "widget")} onDragEnd={handleDragEnd}
        onDragOver={(side) => handleDragOver(widget.id, side)} onDragLeave={handleDragLeave} onDrop={handleDrop}
      />
    ));

  const sectionHeader = (label: string, delay = 0.1) => (
    <div className="flex items-center gap-2 mb-2">
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
        className="h-[1px] w-6 bg-gradient-to-r from-primary/60 to-transparent origin-left" />
      <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delay + 0.05 }}
        className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-[0.2em]">
        {label}
      </motion.p>
    </div>
  );

  const addServiceButton = !loading && isAdmin && isDragMode && (
    <AddServiceCard index={services.length} onClick={() => setServiceDialogOpen(true)} />
  );

  const addWidgetButton = !loading && isAdmin && isDragMode && (
    <motion.button onClick={() => setWidgetDialogOpen(true)}
      initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: widgets.length * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}
      className="glass-card group relative flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-all duration-300 cursor-pointer border-dashed !border-2 !border-muted-foreground/20 hover:!border-accent/40"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors duration-300">
        <Plus className="h-4 w-4" />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">Add Widget</span>
    </motion.button>
  );

  return (
    <div className="ambient-bg min-h-screen flex flex-col">
      {/* Top bar */}
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="mx-auto max-w-[1400px] px-3 sm:px-5 md:px-8 h-10 sm:h-11 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_2px_hsl(var(--primary)/0.4)] shrink-0" />
            <span className="font-display text-sm font-semibold text-foreground tracking-tight">jambiya</span>
            <span className="text-muted-foreground/30 font-light hidden sm:inline">/</span>
            <span className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-widest hidden sm:inline">dashboard</span>
          </div>
          <div className="flex items-center gap-1">
            {!loading && isAdmin && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                onClick={toggleLayout}
                className="p-1.5 rounded-md bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150 shrink-0"
                title={layoutMode === "merged" ? "Separate sections" : "Merge grid"}>
                {layoutMode === "merged" ? <Rows3 className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
              </motion.button>
            )}
            {!loading && isAdmin && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                onClick={() => { setIsDragMode((prev) => !prev); clearDrag(); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all duration-150 shrink-0 ${
                  isDragMode ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                }`}>
                {isDragMode ? <><Check className="h-3 w-3" /><span className="hidden sm:inline">Done</span></> : <><GripVertical className="h-3 w-3" /><Plus className="h-3 w-3" /></>}
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-5 md:px-8 py-3 sm:py-4 md:py-6 flex-1 space-y-3 sm:space-y-4">
          <SystemHealthStrip />

          {layoutMode === "merged" ? (
            <section>
              {sectionHeader("Dashboard")}
              <div className={gridClass}>
                {renderServiceCards(0)}
                {renderWidgetCards(services.length)}
                {addServiceButton}
                {addWidgetButton}
              </div>
            </section>
          ) : (
            <>
              <section>
                {sectionHeader("Services")}
                <div className={gridClass}>
                  {renderServiceCards(0)}
                  {addServiceButton}
                </div>
              </section>

              {(widgetsLoaded && widgets.length > 0) || (isAdmin && isDragMode) ? (
                <section>
                  {sectionHeader("Widgets", 0.2)}
                  <div className={gridClass}>
                    {renderWidgetCards(0)}
                    {addWidgetButton}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="py-3 text-center">
          <p className="font-mono text-[9px] text-muted-foreground/25 tracking-widest uppercase">*.jambiya.me</p>
        </motion.footer>
      </main>

      <ServiceDialog open={serviceDialogOpen} onOpenChange={handleServiceDialogClose} onSubmit={handleServiceSubmit} editingService={editingService} />
      <WidgetDialog open={widgetDialogOpen} onOpenChange={handleWidgetDialogClose} onSubmit={handleWidgetSubmit} editingWidget={editingWidget} />
    </div>
  );
};

export default Index;
