// // src/components/CalendarBottomSheet.tsx
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { motion, AnimatePresence, useMotionValue } from "framer-motion";
// import CalendarGrid from "./CalendarGrid";
// import DayDetailSheet from "./DayDetailSheet";
// import { apiFetch } from "../lib/api";

// interface Props {
//   open: boolean;
//   onClose: () => void;
// }

// interface DaySummary {
//   date: string;
//   calories: number;
//   protein: number;
//   fat?: number;
//   workouts: number;
//   hydrationGlasses: number;
// }

// function vibrate(ms: number) {
//   if (navigator.vibrate) navigator.vibrate(ms);
// }

// const CalendarBottomSheet: React.FC<Props> = ({ open, onClose }) => {
//   const [month, setMonth] = useState(() => {
//     const d = new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//   });

//   const [data, setData] = useState<DaySummary[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);

//   // DRAG LOGIC
//   const y = useMotionValue(0);

//   // LOAD DATA
//   useEffect(() => {
//     if (!open) return;

//     vibrate(5);
//     let cancelled = false;

//     const load = async () => {
//       setLoading(true);
//       try {
//         const res = await apiFetch(`/api/calendar/month?month=${month}`);
//         if (!cancelled && res?.days) setData(res.days);
//       } catch (err) {
//         console.warn("Calendar fetch error:", err);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [open, month]);

//   // DRAG END
//   const handleDragEnd = useCallback(
//     (_: any, info: any) => {
//       const offset = info.offset.y;
//       const velocity = info.velocity.y;

//       if (offset > 120 || velocity > 500) {
//         vibrate(10);
//         onClose();
//       } else {
//         y.set(0, {
//           type: "spring",
//           stiffness: 800,
//           damping: 55,
//         });
//       }
//     },
//     [onClose, y]
//   );

//   // MONTH NAVIGATION
//   const go = (dir: number) => {
//     const [yy, mm] = month.split("-").map(Number);
//     const dt = new Date(yy, mm - 1 + dir, 1);
//     setMonth(
//       `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`
//     );
//   };

//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           {/* BACKDROP */}
//           <motion.div
//             className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//           />

//           {/* SHEET */}
//           <motion.aside
//             className="
//               fixed left-0 right-0 bottom-0 z-50
//               backdrop-blur-2xl bg-slate-900/70
//               border-t border-white/10
//               rounded-t-3xl shadow-2xl
//               flex flex-col
//             "
//             style={{ y, height: "100vh" }}
//           >
//             {/* DRAG HANDLE (drag only here) */}
//             <motion.div
//               drag="y"
//               dragConstraints={{ top: 0, bottom: 0 }}
//               dragElastic={0.08}
//               onDragEnd={handleDragEnd}
//               className="w-full cursor-grab active:cursor-grabbing py-3 flex justify-center"
//             >
//               <div className="w-10 h-1.5 rounded-full bg-white/30" />
//             </motion.div>

//             {/* HEADER */}
//             <div className="px-5 pb-4 flex items-center justify-between border-b border-white/10">
//               <div>
//                 <h3 className="text-white text-lg font-semibold">
//                   Calendar Insights
//                 </h3>
//                 <p className="text-sm text-slate-300">{month}</p>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => go(-1)}
//                   className="text-sm px-3 py-1 rounded-md bg-white/10 text-white"
//                 >
//                   Prev
//                 </button>
//                 <button
//                   onClick={() => go(1)}
//                   className="text-sm px-3 py-1 rounded-md bg-white/10 text-white"
//                 >
//                   Next
//                 </button>
//                 <button
//                   onClick={onClose}
//                   className="text-white/70 hover:text-white ml-2"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>

//             {/* CONTENT (FULLY SCROLLABLE NOW) */}
//             <div className="px-4 py-4 overflow-y-auto flex-1">
//               {loading ? (
//                 <div className="flex items-center justify-center py-8 text-slate-300">
//                   Loading…
//                 </div>
//               ) : (
//                 <CalendarGrid
//                   month={month}
//                   days={data}
//                   onSelectDay={(d) => setSelectedDay(d)}
//                 />
//               )}

//               <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-900/90 to-transparent" />
//             </div>

//             {/* DAY DETAILS */}
//             <DayDetailSheet
//               day={selectedDay}
//               onClose={() => setSelectedDay(null)}
//               onNavigateToDay={(iso) => console.log("Open day", iso)}
//             />
//           </motion.aside>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default CalendarBottomSheet;
// src/components/CalendarBottomSheet.tsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import ReactDOM from "react-dom";
import CalendarGrid from "./CalendarGrid";
import DayDetailSheet from "./DayDetailSheet";
import { apiFetch } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface DaySummary {
  date: string;
  calories: number;
  protein: number;
  fat?: number;
  workouts: number;
  hydrationGlasses: number;
}

function vibrate(ms: number) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

const CalendarBottomSheet: React.FC<Props> = ({ open, onClose }) => {
  const y = useMotionValue(0);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [data, setData] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);

  // ---------------------------------------------------------
  // BODY SCROLL LOCK
  // ---------------------------------------------------------
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ---------------------------------------------------------
  // FETCH MONTH DATA
  // ---------------------------------------------------------
  useEffect(() => {
    if (!open) return;

    vibrate(5);

    let cancel = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/calendar/month?month=${month}`);
        if (!cancel && res?.days) {
          setData(res.days);
        }
      } catch (err) {
        console.warn("Calendar fetch error:", err);
      }
      if (!cancel) setLoading(false);
    };

    load();

    return () => {
      cancel = true;
    };
  }, [open, month]);

  // ---------------------------------------------------------
  // DRAG CLOSE (ONLY FROM HANDLE)
  // ---------------------------------------------------------
  const handleDragEnd = useCallback(
    (_: any, info: any) => {
      const offset = info.offset.y;
      const velocity = info.velocity.y;

      if (offset > 120 || velocity > 500) {
        vibrate(10);
        onClose();
      } else {
        y.set(0, {
          type: "spring",
          stiffness: 800,
          damping: 55,
        });
      }
    },
    [onClose]
  );

  // ---------------------------------------------------------
  // MONTH SWITCHING
  // ---------------------------------------------------------
  const go = (dir: number) => {
    const [yy, mm] = month.split("-").map(Number);
    const dt = new Date(yy, mm - 1 + dir, 1);
    setMonth(
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`
    );
  };

  // ---------------------------------------------------------
  // PORTAL (THIS ENSURES IT ALWAYS OVERLAYS WHERE YOU ARE)
  // ---------------------------------------------------------
  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* BOTTOM SHEET */}
          <motion.aside
            className="
              fixed left-0 right-0 bottom-0 z-[9999]
              bg-slate-900/70 backdrop-blur-2xl
              border-t border-white/10 rounded-t-3xl
              shadow-2xl flex flex-col
            "
            style={{ y, height: "100vh" }}
          >
            {/* DRAG HANDLE */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.08}
              onDragEnd={handleDragEnd}
              className="py-3 flex justify-center cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-white/30 rounded-full" />
            </motion.div>

            {/* HEADER */}
            <div className="px-5 pb-4 flex items-center justify-between border-b border-white/10">
              <div>
                <h3 className="text-white text-lg font-semibold">
                  Calendar Insights
                </h3>
                <p className="text-sm text-slate-300">{month}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => go(-1)}
                  className="text-sm px-3 py-1 rounded bg-white/10 text-white"
                >
                  Prev
                </button>
                <button
                  onClick={() => go(1)}
                  className="text-sm px-3 py-1 rounded bg-white/10 text-white"
                >
                  Next
                </button>
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            {/* MAIN SCROLL AREA */}
            <div className="px-4 py-4 overflow-y-auto flex-1">
              {loading ? (
                <div className="text-center text-slate-300 py-6">Loading…</div>
              ) : (
                <CalendarGrid
                  month={month}
                  days={data}
                  onSelectDay={(d) => setSelectedDay(d)}
                />
              )}
            </div>

            {/* DAY DETAIL SHEET — now scrollable, fixed inside the sheet */}
            <DayDetailSheet
              day={selectedDay}
              onClose={() => setSelectedDay(null)}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CalendarBottomSheet;
