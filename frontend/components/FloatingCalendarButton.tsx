// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Calendar, X } from "lucide-react";

// interface FloatingCalendarButtonProps {
//   onOpen: () => void;
// }

// const FloatingCalendarButton: React.FC<FloatingCalendarButtonProps> = ({
//   onOpen,
// }) => {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <div className="fixed right-6 bottom-6 z-50">
//         <div className="flex flex-col items-end gap-3">
//           <AnimatePresence>
//             {open && (
//               <motion.div
//                 initial={{ opacity: 0, y: 6, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, y: 6, scale: 0.95 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 24 }}
//                 className="bg-black/60 p-3 rounded-lg shadow-lg w-64"
//               >
//                 <div className="text-sm font-semibold text-white">
//                   Calendar View
//                 </div>
//                 <div className="text-xs text-neutral-300 mt-1">
//                   View daily breakdown: calories, macros, hydration, workouts.
//                 </div>
//                 <div className="mt-3 grid grid-cols-2 gap-2">
//                   <button
//                     className="px-3 py-2 rounded bg-white/5 text-white text-sm hover:bg-white/10"
//                     onClick={() => {
//                       onOpen();
//                       setOpen(false);
//                     }}
//                   >
//                     Open Calendar
//                   </button>
//                   <button
//                     className="px-3 py-2 rounded bg-white/5 text-white text-sm hover:bg-white/10"
//                     onClick={() => setOpen(false)}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <motion.button
//             onClick={() => setOpen((s) => !s)}
//             initial={{ scale: 1 }}
//             animate={{ rotate: open ? 45 : 0, scale: open ? 0.98 : 1 }}
//             transition={{ type: "spring", stiffness: 400, damping: 18 }}
//             className="w-14 h-14 rounded-full bg-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.18)] flex items-center justify-center text-white"
//             aria-label="Calendar"
//           >
//             {open ? <X size={22} /> : <Calendar size={22} />}
//           </motion.button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FloatingCalendarButton;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import CalendarBottomSheet from "./CalendarBottomSheet";

const FloatingCalendarButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CalendarBottomSheet open={open} onClose={() => setOpen(false)} />

      <div className="sticky bottom-24 ml-auto w-fit pb-4   z-50">
        <motion.button
          aria-label="Open calendar insights"
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((s) => !s)}
          className=" w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
};

export default FloatingCalendarButton;
