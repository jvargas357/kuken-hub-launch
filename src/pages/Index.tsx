import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Cloud, ShieldCheck, Server } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import AddServiceCard from "@/components/AddServiceCard";
import AddServiceDialog from "@/components/AddServiceDialog";
import CustomServiceCard from "@/components/CustomServiceCard";
import { getIconByName } from "@/components/AddServiceDialog";
import { useAutheliaUser } from "@/hooks/useAutheliaUser";
import { useCustomServices } from "@/hooks/useCustomServices";

const defaultServices = [
  {
    name: "Jellyfin",
    description: "Media server — movies, shows & music streaming",
    url: "https://jellyfin.jambiya.me",
    icon: <Film className="h-6 w-6" />,
    glowClass: "glow-jellyfin",
    accentColor: "jellyfin",
  },
  {
    name: "Vaultwarden",
    description: "Password manager — secure credential vault",
    url: "https://vault.jambiya.me",
    icon: <ShieldCheck className="h-6 w-6" />,
    glowClass: "glow-vaultwarden",
    accentColor: "vaultwarden",
  },
  {
    name: "Nextcloud",
    description: "Cloud storage — files, calendar & contacts",
    url: "https://cloud.jambiya.me",
    icon: <Cloud className="h-6 w-6" />,
    glowClass: "glow-nextcloud",
    accentColor: "nextcloud",
  },
];

const Index = () => {
  const { isAdmin, loading } = useAutheliaUser();
  const { services: customServices, addService, removeService } = useCustomServices();
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalDefaultCount = defaultServices.length;

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
          <p className="text-muted-foreground max-w-md">
            Your self-hosted services, one click away.
          </p>
        </motion.header>

        {/* Services grid */}
        <section>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6"
          >
            Services
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {defaultServices.map((service, i) => (
              <ServiceCard key={service.name} {...service} index={i} />
            ))}

            {customServices.map((service, i) => (
              <CustomServiceCard
                key={service.id}
                name={service.name}
                description={service.description}
                url={service.url}
                icon={getIconByName(service.iconName)}
                index={totalDefaultCount + i}
                isAdmin={isAdmin}
                onRemove={() => removeService(service.id)}
              />
            ))}

            {!loading && isAdmin && (
              <AddServiceCard
                index={totalDefaultCount + customServices.length}
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

      <AddServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={addService}
      />
    </div>
  );
};

export default Index;
