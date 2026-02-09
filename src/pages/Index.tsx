import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GripVertical, Plus, Check, LayoutGrid, Activity } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import AddServiceCard from "@/components/AddServiceCard";
import ServiceDialog from "@/components/ServiceDialog";
import { getIconByName } from "@/components/ServiceDialog";
import SystemHealth from "@/components/SystemHealth";
import { useAutheliaUser } from "@/hooks/useAutheliaUser";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/hooks/useServices";

type Tab = "services" | "health";

const Index = () => {
  const { isAdmin, loading } = useAutheliaUser();
  const { services, loaded, addService, updateService, removeService, reorderService } =
    useServices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("services");

  // Drag state
  const [isDragMode, setIsDragMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverSide, setDragOverSide] = useState<"before" | "after" | null>(null);

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

  // Drag handlers
  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggingId && dragOverId && draggingId !== dragOverId && dragOverSide) {
      reorderService(draggingId, dragOverId, dragOverSide);
    }
    setDraggingId(null);
    setDragOverId(null);
    setDragOverSide(null);
  }, [draggingId, dragOverId, dragOverSide, reorderService]);

  const handleDragOver = useCallback(
    (targetId: string, side: "before" | "after") => {
      if (targetId === draggingId) return;
      setDragOverId(targetId);
      setDragOverSide(side);
    },
    [draggingId]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
    setDragOverSide(null);
  }, []);

  const handleDrop = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

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

            {/* Tab switcher */}
            <div className="flex items-center gap-0.5 ml-2 sm:ml-4 bg-secondary/50 rounded-lg p-0.5">
              <button
                onClick={() => { setActiveTab("services"); setIsDragMode(false); }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-all ${
                  activeTab === "services"
                    ? "bg-background/80 text-foreground shadow-sm"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                <LayoutGrid className="h-3 w-3" />
                <span className="hidden sm:inline">Services</span>
              </button>
              <button
                onClick={() => { setActiveTab("health"); setIsDragMode(false); }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-all ${
                  activeTab === "health"
                    ? "bg-background/80 text-foreground shadow-sm"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                <Activity className="h-3 w-3" />
                <span className="hidden sm:inline">System</span>
              </button>
            </div>
          </div>

          {/* Admin controls — only on services tab */}
          {!loading && isAdmin && activeTab === "services" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                setIsDragMode((prev) => !prev);
                setDraggingId(null);
                setDragOverId(null);
                setDragOverSide(null);
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
                  <span className="text-muted-foreground/40 hidden sm:inline">/</span>
                  <Plus className="h-3 w-3" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 py-6 sm:py-10 md:py-16 flex-1">
          {activeTab === "services" && (
            <>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-8">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className="h-[1px] w-12 bg-gradient-to-r from-primary/60 to-transparent origin-left"
                />
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-mono text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em]"
                >
                  Services
                </motion.p>
              </div>

              {/* Services grid */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loaded &&
                  services.map((service, i) => (
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
                  <AddServiceCard
                    index={services.length}
                    onClick={() => setDialogOpen(true)}
                  />
                )}
              </div>
            </>
          )}

          {activeTab === "health" && <SystemHealth />}
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
    </div>
  );
};

export default Index;
