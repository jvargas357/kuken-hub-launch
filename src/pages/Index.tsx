import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { GripVertical, Plus, Check } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import AddServiceCard from "@/components/AddServiceCard";
import ServiceDialog from "@/components/ServiceDialog";
import { getIconByName } from "@/components/ServiceDialog";
import { useAutheliaUser } from "@/hooks/useAutheliaUser";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/hooks/useServices";
import SystemHealthCards from "@/components/dashboard/SystemHealthCards";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import CollapsibleSection from "@/components/dashboard/CollapsibleSection";
import AddWidgetDialog from "@/components/dashboard/AddWidgetDialog";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";

const Index = () => {
  const { isAdmin, loading } = useAutheliaUser();
  const { services, loaded, addService, updateService, removeService, reorderService } =
    useServices();
  const { widgets, loaded: widgetsLoaded, addWidget, removeWidget, toggleCollapse, reorderWidget } =
    useDashboardWidgets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  // Section drag state
  const [isDragMode, setIsDragMode] = useState(false);
  const [sectionDragId, setSectionDragId] = useState<string | null>(null);
  const [sectionDragOverId, setSectionDragOverId] = useState<string | null>(null);
  const [sectionDragOverSide, setSectionDragOverSide] = useState<"before" | "after" | null>(null);

  // Service card drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverSide, setDragOverSide] = useState<"before" | "after" | null>(null);

  // Per-section add dialogs
  const [addMetricOpen, setAddMetricOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [addActionOpen, setAddActionOpen] = useState(false);

  // Refs for child add dialogs
  const metricRef = useRef<{ setOpen: (v: boolean) => void }>(null);
  const activityRef = useRef<{ setOpen: (v: boolean) => void }>(null);
  const actionRef = useRef<{ setOpen: (v: boolean) => void }>(null);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingService(null);
  };

  const handleSubmit = (data: Omit<Service, "id" | "order">) => {
    if (editingService) {
      updateService(editingService.id, data);
    } else {
      addService(data);
    }
    setEditingService(null);
  };

  // Service card drag handlers
  const handleDragStart = useCallback((id: string) => setDraggingId(id), []);
  const handleDragEnd = useCallback(() => {
    if (draggingId && dragOverId && draggingId !== dragOverId && dragOverSide) {
      reorderService(draggingId, dragOverId, dragOverSide);
    }
    setDraggingId(null);
    setDragOverId(null);
    setDragOverSide(null);
  }, [draggingId, dragOverId, dragOverSide, reorderService]);
  const handleDragOver = useCallback((targetId: string, side: "before" | "after") => {
    if (targetId === draggingId) return;
    setDragOverId(targetId);
    setDragOverSide(side);
  }, [draggingId]);
  const handleDragLeave = useCallback(() => { setDragOverId(null); setDragOverSide(null); }, []);
  const handleDrop = useCallback(() => handleDragEnd(), [handleDragEnd]);

  // Section drag handlers
  const handleSectionDragEnd = useCallback(() => {
    if (sectionDragId && sectionDragOverId && sectionDragId !== sectionDragOverId && sectionDragOverSide) {
      reorderWidget(sectionDragId, sectionDragOverId, sectionDragOverSide);
    }
    setSectionDragId(null);
    setSectionDragOverId(null);
    setSectionDragOverSide(null);
  }, [sectionDragId, sectionDragOverId, sectionDragOverSide, reorderWidget]);

  const getAddHandler = (type: string) => {
    switch (type) {
      case "system-health": return () => setAddMetricOpen(true);
      case "activity-feed": return () => setAddActivityOpen(true);
      case "quick-actions": return () => setAddActionOpen(true);
      case "services": return () => setDialogOpen(true);
      default: return undefined;
    }
  };

  const renderWidgetContent = (type: string) => {
    switch (type) {
      case "system-health":
        return <SystemHealthCards isAdmin={isAdmin} addOpen={addMetricOpen} setAddOpen={setAddMetricOpen} />;
      case "services":
        return (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loaded && services.map((service, i) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                description={service.description}
                url={service.url}
                icon={getIconByName(service.iconName)}
                accentColor={service.accentColor}
                glowClass={service.glowClass}
                size={service.size}
                index={i}
                isAdmin={isAdmin}
                isFirst={i === 0}
                isLast={i === services.length - 1}
                isDragMode={isDragMode}
                isDraggingThis={draggingId === service.id}
                dragOverSide={dragOverId === service.id ? dragOverSide : null}
                onRemove={() => removeService(service.id)}
                onEdit={() => handleEdit(service)}
                onDragStart={() => handleDragStart(service.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(side) => handleDragOver(service.id, side)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
            {!loading && isAdmin && isDragMode && (
              <AddServiceCard index={services.length} onClick={() => setDialogOpen(true)} />
            )}
          </div>
        );
      case "activity-feed":
        return <ActivityFeed isAdmin={isAdmin} addOpen={addActivityOpen} setAddOpen={setAddActivityOpen} />;
      case "quick-actions":
        return <QuickActions isAdmin={isAdmin} addOpen={addActionOpen} setAddOpen={setAddActionOpen} />;
      default:
        return null;
    }
  };

  return (
    <div className="ambient-bg min-h-screen flex flex-col">
      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-border/50"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10 h-12 sm:h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)] shrink-0" />
            <span className="font-display text-base sm:text-lg font-semibold text-foreground tracking-tight">
              jambiya
            </span>
            <span className="text-muted-foreground/30 font-light hidden sm:inline">/</span>
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-widest hidden sm:inline">
              dashboard
            </span>
          </div>

          {!loading && isAdmin && (
            <div className="flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setAddWidgetOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono uppercase tracking-wider bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent transition-all duration-150 shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">Section</span>
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  setIsDragMode((prev) => !prev);
                  setDraggingId(null);
                  setDragOverId(null);
                  setDragOverSide(null);
                  setSectionDragId(null);
                  setSectionDragOverId(null);
                  setSectionDragOverSide(null);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-all duration-150 shrink-0 ${
                  isDragMode
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                }`}
              >
                {isDragMode ? (
                  <>
                    <Check className="h-3 w-3" />
                    Done
                  </>
                ) : (
                  <>
                    <GripVertical className="h-3 w-3" />
                    <span className="hidden sm:inline">Reorder</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 py-6 sm:py-10 md:py-16 flex-1 space-y-8 sm:space-y-12">
          {widgetsLoaded &&
            widgets.map((widget) => (
              <CollapsibleSection
                key={widget.id}
                title={widget.title}
                collapsed={widget.collapsed}
                onToggle={() => toggleCollapse(widget.id)}
                onRemove={() => removeWidget(widget.id)}
                onAdd={isAdmin ? getAddHandler(widget.type) : undefined}
                isAdmin={isAdmin}
                isDragMode={isDragMode}
                isDragging={sectionDragId === widget.id}
                dragOverSide={sectionDragOverId === widget.id ? sectionDragOverSide : null}
                onDragStart={() => setSectionDragId(widget.id)}
                onDragEnd={handleSectionDragEnd}
                onDragOver={(side) => {
                  if (widget.id === sectionDragId) return;
                  setSectionDragOverId(widget.id);
                  setSectionDragOverSide(side);
                }}
                onDragLeave={() => {
                  setSectionDragOverId(null);
                  setSectionDragOverSide(null);
                }}
                onDrop={() => handleSectionDragEnd()}
              >
                {renderWidgetContent(widget.type)}
              </CollapsibleSection>
            ))}
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="py-8 text-center"
        >
          <p className="font-mono text-[10px] text-muted-foreground/30 tracking-widest uppercase">
            *.jambiya.me
          </p>
        </motion.footer>
      </main>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleSubmit}
        editingService={editingService}
      />

      <AddWidgetDialog
        open={addWidgetOpen}
        onOpenChange={setAddWidgetOpen}
        onAdd={addWidget}
        currentWidgets={widgets}
      />
    </div>
  );
};

export default Index;
