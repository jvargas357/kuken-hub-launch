import { motion } from "framer-motion";
import { Film, Cloud, ShieldCheck, Server } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

const services = [
  {
    name: "Jellyfin",
    description: "Media server — movies, shows & music streaming",
    url: "https://jellyfin.kuken.ffse",
    icon: <Film className="h-6 w-6" />,
    glowClass: "glow-jellyfin",
    accentColor: "jellyfin",
  },
  {
    name: "Vaultwarden",
    description: "Password manager — secure credential vault",
    url: "https://vault.kuken.ffse",
    icon: <ShieldCheck className="h-6 w-6" />,
    glowClass: "glow-vaultwarden",
    accentColor: "vaultwarden",
  },
  {
    name: "Nextcloud",
    description: "Cloud storage — files, calendar & contacts",
    url: "https://cloud.kuken.ffse",
    icon: <Cloud className="h-6 w-6" />,
    glowClass: "glow-nextcloud",
    accentColor: "nextcloud",
  },
];

const Index = () => {
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
              kuken.ffse
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
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
            {services.map((service, i) => (
              <ServiceCard key={service.name} {...service} index={i} />
            ))}
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
            *.kuken.ffse
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
