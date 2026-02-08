import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface AddServiceCardProps {
  index: number;
  onClick: () => void;
}

const AddServiceCard = ({ index, onClick }: AddServiceCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card group relative flex flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all duration-300 cursor-pointer min-h-[180px] border-dashed !border-2 !border-muted-foreground/20 hover:!border-primary/40"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
        <Plus className="h-6 w-6" />
      </div>
      <span className="font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
        Add Service
      </span>
    </motion.button>
  );
};

export default AddServiceCard;
