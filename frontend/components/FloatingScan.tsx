import React from "react";
import { motion } from "framer-motion";
import { Camera, ScanBarcode } from "lucide-react";

interface Props {
  mode: "barcode" | "photo";
  onChange: (m: "barcode" | "photo") => void;
}

const FloatingScan: React.FC<Props> = ({ mode, onChange }) => {
  const isPhoto = mode === "photo";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        sticky bottom-28 right-0 z-50 w-fit ml-auto 
        
      "
    >
      <motion.div
        layout
        className="
          bg-white/10 backdrop-blur-xl border border-white/10
          rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6)]
          p-1.5 flex flex-col items-center gap-2
        "
      >
        {/* PHOTO BUTTON (now default + first) */}
        <motion.button
          onClick={() => onChange("photo")}
          whileTap={{ scale: 0.9 }}
          animate={{
            backgroundColor: isPhoto
              ? "rgba(52,211,153,0.35)"
              : "rgba(255,255,255,0.08)",
            scale: isPhoto ? 1.05 : 1,
          }}
          transition={{ duration: 0.25 }}
          className="
            w-9 h-9 rounded-lg flex items-center justify-center text-white
          "
        >
          <Camera className="w-4.5 h-4.5" />
        </motion.button>

        {/* BARCODE BUTTON */}
        <motion.button
          onClick={() => onChange("barcode")}
          whileTap={{ scale: 0.9 }}
          animate={{
            backgroundColor: !isPhoto
              ? "rgba(52,211,153,0.35)"
              : "rgba(255,255,255,0.08)",
            scale: !isPhoto ? 1.05 : 1,
          }}
          transition={{ duration: 0.25 }}
          className="
            w-9 h-9 rounded-lg flex items-center justify-center text-white
          "
        >
          <ScanBarcode className="w-4.5 h-4.5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default FloatingScan;
