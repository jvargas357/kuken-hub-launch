import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

interface ServiceCardProps {
  name: string;
  description: string;
  url: string;
  icon: ReactNode;
  glowClass: string;
  accentColor: string;
  index: number;
}

const ServiceCard = ({
  name,
  description,
  url,
  icon,
  glowClass,
  accentColor,
  index,
}: ServiceCardProps) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card ${glowClass} group relative flex flex-col items-start gap-4 rounded-xl p-6 transition-all duration-300 cursor-pointer`}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300"
        style={{ backgroundColor: `hsl(var(--${accentColor}))` }}
      />

      <div className="flex w-full items-start justify-between">
        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300"
          style={{
            backgroundColor: `hsl(var(--${accentColor}) / 0.12)`,
            color: `hsl(var(--${accentColor}))`,
          }}
        >
          {icon}
        </div>

        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="space-y-1">
        <h3 className="font-mono text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Status dot */}
      <div className="flex items-center gap-2 mt-auto">
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: `hsl(var(--${accentColor}))` }}
        />
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          Online
        </span>
      </div>
    </motion.a>
  );
};

export default ServiceCard;
