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
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card group relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-300 cursor-pointer min-h-[100px] border-dashed !border-2 !border-muted-foreground/20 hover:!border-primary/40"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
        <Plus className="h-5 w-5" />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors duration-300">
        Add Service
      </span>
    </motion.button>
  );
};

export default AddServiceCard;
