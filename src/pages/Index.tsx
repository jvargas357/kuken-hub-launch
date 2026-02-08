import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, GripVertical, Plus, Check } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import AddServiceCard from "@/components/AddServiceCard";
import ServiceDialog from "@/components/ServiceDialog";
import { getIconByName } from "@/components/ServiceDialog";
import { useAutheliaUser } from "@/hooks/useAutheliaUser";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/hooks/useServices";

const Index = () => {
  const { isAdmin, loading } = useAutheliaUser();
  const { services, loaded, addService, updateService, removeService, reorderService } =
    useServices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

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
    <div className="ambient-bg dot-grid min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16 space-y-3"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <span className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
              jambiya.me
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Dashboard
          </h1>
        </motion.header>

        {/* Services grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-mono text-xs text-muted-foreground uppercase tracking-widest"
            >
              Services
            </motion.p>

            {/* Drag mode toggle for admins */}
            {!loading && isAdmin && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  setIsDragMode((prev) => !prev);
                  setDraggingId(null);
                  setDragOverId(null);
                  setDragOverSide(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-150 ${
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
                    <span>Reorder</span>
                    <span className="text-muted-foreground/60">/</span>
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </>
                )}
              </motion.button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  pythonEndpoint={service.pythonEndpoint}
                  pythonScript={service.pythonScript}
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
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="font-mono text-xs text-muted-foreground/50">
            *.jambiya.me
          </p>
        </motion.footer>
      </div>

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
