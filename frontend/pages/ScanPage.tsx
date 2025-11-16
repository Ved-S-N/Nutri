import React, { useEffect, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import Input from "../components/Input";
import { apiFetch } from "../lib/api";
import FloatingScan from "../components/FloatingScan";
import toast from "react-hot-toast";

type Mode = "photo" | "barcode";

interface Ingredient {
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PhotoAnalysisResult {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

const videoRegionId = "barcode-scanner";

const TAB_THEME: Record<Mode, string> = {
  barcode: "from-sky-400/20 via-cyan-500/10 to-transparent",
  photo: "from-purple-400/20 via-fuchsia-500/10 to-transparent",
};

/* -----------------------------------------------------
   Meal Type Picker (Bottom Sheet Modal)
------------------------------------------------------ */
const MealTypePicker = ({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}) => {
  if (!open) return null;

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="sticky pb-24 inset-0 z-50  bg-black/40 rounded-3xl backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        exit={{ y: 200 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-md p-5 rounded-t-3xl
          bg-white/10 backdrop-blur-xl border border-white/20
          shadow-xl space-y-3
        "
      >
        <h3 className="text-lg font-semibold text-center mb-2">
          Select Meal Type
        </h3>

        {mealTypes.map((m) => (
          <button
            key={m}
            onClick={() => {
              onSelect(m);
              onClose();
            }}
            className="
              w-full py-3 rounded-xl capitalize
              bg-white/5 border border-white/10 
              hover:bg-white/10 transition 
              text-white font-medium
            "
          >
            {m}
          </button>
        ))}

        <button
          onClick={onClose}
          className="
            w-full py-3 mt-2 rounded-xl
            bg-rose-500/20 border border-rose-500/40 text-rose-300
          "
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};

const ScanPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("photo");

  /* barcode */
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to scan");
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");

  /* scanned product */
  const [scannedData, setScannedData] = useState<any | null>(null);

  /* builder */
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [foodName, setFoodName] = useState("");

  /* photo */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [analysisResult, setAnalysisResult] =
    useState<PhotoAnalysisResult | null>(null);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  /* NEW — meal picker state */
  const [mealPickerOpen, setMealPickerOpen] = useState(false);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Barcode scanner control ---------- */
  const startScanner = async () => {
    setError(null);
    setBarcode(null);
    setStatus("Initializing camera...");
    setScanning(true);

    try {
      const html5QrCode = new Html5Qrcode(videoRegionId);
      setScanner(html5QrCode);

      const devices = await Html5Qrcode.getCameras();
      if (!devices.length) {
        setError("No camera found.");
        setScanning(false);
        return;
      }

      const cameraId =
        devices.find((d) => d.label.toLowerCase().includes("back"))?.id ||
        devices[0].id;

      await html5QrCode.start(
        { deviceId: { exact: cameraId } },
        {
          fps: 20,
          qrbox: { width: 420, height: 180 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          if (/^\d{8,14}$/.test(decodedText)) {
            setBarcode(decodedText);
            setStatus("Barcode detected!");
            stopScanner();
            fetchBarcodeData(decodedText);
          }
        },
        () => {}
      );

      setStatus("Scanning…");
    } catch (err) {
      console.error("[Scan] start error:", err);
      setError("Camera error. Check permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
        await scanner.clear();
      }
    } catch {}
    setScanning(false);
    setStatus("Scanner stopped");
  };

  /* ---------- Barcode product fetch ---------- */
  const fetchBarcodeData = async (code: string) => {
    setError(null);
    setScannedData(null);
    try {
      const data = await apiFetch(`/api/food/barcode/${code}`);
      setScannedData({ ...data, quantity: 100 });
    } catch {
      setError("Product not found.");
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    fetchBarcodeData(manualCode.trim());
  };

  /* ---------- builder ---------- */
  const addIngredient = () => {
    if (!scannedData) return;
    setIngredients((prev) => [
      ...prev,
      {
        name: scannedData.name,
        quantity: scannedData.quantity,
        calories: (scannedData.calories * scannedData.quantity) / 100,
        protein: (scannedData.protein * scannedData.quantity) / 100,
        carbs: (scannedData.carbs * scannedData.quantity) / 100,
        fat: (scannedData.fat * scannedData.quantity) / 100,
      },
    ]);
    setScannedData(null);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const totalMacros = ingredients.reduce(
    (acc, i) => {
      acc.calories += i.calories;
      acc.protein += i.protein;
      acc.carbs += i.carbs;
      acc.fat += i.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const saveCustomFood = async () => {
    if (!foodName || ingredients.length === 0) {
      toast.error("Add name and ingredients first.");
      return;
    }

    try {
      await apiFetch("/food/custom", {
        method: "POST",
        body: JSON.stringify({ name: foodName, ingredients }),
      });

      toast.success("Custom food saved!");
      setFoodName("");
      setIngredients([]);
    } catch {
      toast.error("Failed to save custom food.");
    }
  };

  /* ---------- photo upload ---------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  /* ---------- AI analysis ---------- */
  const analyzePhoto = async () => {
    if (!imageFile) return toast.error("Upload a photo first");

    setLoadingAnalysis(true);
    setAnalysisResult(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("context", photoDescription);

      const result = await apiFetch("/api/ai/photo", {
        method: "POST",
        body: formData,
        isFormData: true,
      });

      setAnalysisResult(result);
    } catch {
      toast.error("Failed to analyze photo");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  /* ---------- Save photo → open modal ---------- */
  const savePhotoMacros = () => {
    if (!analysisResult) return toast.error("Nothing to save");
    setMealPickerOpen(true);
  };

  /* ---------- When user selects meal ---------- */
  const handleMealSelect = async (mealType: string) => {
    try {
      await apiFetch("/api/food-log/add", {
        method: "POST",
        body: JSON.stringify({
          mealType,
          foodName: "AI Photo Meal",
          calories: analysisResult!.totalCalories,
          protein: analysisResult!.protein,
          carbs: analysisResult!.carbs,
          fat: analysisResult!.fat,
        }),
      });

      toast.success(`Saved to ${mealType}!`);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
    } catch {
      toast.error("Failed to save.");
    }
  };

  /* Stop scanner when switching modes */
  useEffect(() => {
    if (mode === "photo") stopScanner();
    else {
      setAnalysisResult(null);
      setImageFile(null);
      setImagePreview(null);
      setPhotoDescription("");
    }
    // eslint-disable-next-line
  }, [mode]);

  /* ---------- render ---------- */
  return (
    <>
      {/* header */}
      <motion.div
        className="
          sticky top-0 z-30 px-4 py-4
          backdrop-blur-2xl bg-black/40
          border-b border-white/10
        "
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold">Scan</h1>
        <p className="text-neutral-400 text-sm">
          Scan barcodes or analyze photos for nutrition insights.
        </p>
      </motion.div>

      {/* gradient */}
      <motion.div
        key={mode + "-bg"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute inset-0 -z-10 bg-gradient-to-b ${TAB_THEME[mode]} blur-xl`}
      />

      <div className="px-4 pt-6 pb-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="
              rounded-3xl p-4 bg-white/5 backdrop-blur-xl
              border border-white/10 shadow-lg
            "
          >
            {/* header row */}
            <div className="flex justify-between mb-4 text-sm text-neutral-400">
              <div>
                Mode: <span className="text-white font-semibold">{mode}</span>
              </div>
              <div className="text-xs text-neutral-500">
                Use the floating switch
              </div>
            </div>

            {/* ------------ BARCODE UI ------------ */}
            {mode === "barcode" && (
              <>
                <div className="relative w-full">
                  <div
                    id={videoRegionId}
                    className="w-full h-64 rounded-xl border border-white/10 bg-black"
                  />
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="w-64 h-28 border-2 border-accent/70 rounded-md opacity-80" />
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  {!scanning ? (
                    <Button onClick={startScanner} className="flex-1">
                      Start Scanner
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={stopScanner}
                      className="flex-1"
                    >
                      Stop
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() =>
                      document.getElementById("manual-input")?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                  >
                    Manual
                  </Button>
                </div>

                {/* manual */}
                <div className="flex gap-2 items-start mt-4">
                  <Input
                    id="manual-input"
                    label="Enter barcode"
                    value={manualCode}
                    placeholder="e.g. 5449000000996"
                    onChange={(e) => setManualCode(e.target.value)}
                  />
                  <div className="w-28 pt-6">
                    <Button onClick={handleManualSubmit} className="w-full">
                      Search
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-neutral-400 mt-2">
                  <div>{status}</div>
                  {barcode && (
                    <div className="text-emerald-400">Detected: {barcode}</div>
                  )}
                  {error && <div className="text-rose-400">{error}</div>}
                </div>
              </>
            )}

            {/* ------------ PHOTO MODE ------------ */}
            {mode === "photo" && (
              <>
                <div>
                  <h2 className="text-lg font-semibold">
                    Photo Nutrition Scan
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Upload or take a picture. Add context for better accuracy.
                  </p>
                </div>

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full rounded-xl max-h-64 object-cover mt-3"
                  />
                ) : (
                  <div className="w-full h-44 mt-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm text-neutral-500">
                    No photo selected
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="
                      block w-full text-md text-neutral-300
                      file:mr-3 file:py-3 file:px-2
                      file:rounded-lg file:border-0
                      file:bg-accent file:text-white
                    "
                  />
                  <div className="w-28 h-16">
                    <Button onClick={analyzePhoto} disabled={loadingAnalysis}>
                      {loadingAnalysis ? "Analyzing…" : "Analyze"}
                    </Button>
                  </div>
                </div>

                <Input
                  id="photo-context"
                  label="Context (optional)"
                  placeholder="e.g. grilled chicken + rice"
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                />

                {analysisResult && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mt-4 space-y-3">
                    <h3 className="font-semibold text-lg">
                      Estimated Nutrition
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        Total Calories: {analysisResult.totalCalories} kcal
                      </div>
                      <div>Protein: {analysisResult.protein}g</div>
                      <div>Carbs: {analysisResult.carbs}g</div>
                      <div>Fat: {analysisResult.fat}g</div>
                    </div>

                    <div>
                      <h4 className="font-medium mt-3">Items</h4>
                      {analysisResult.items.map((item, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-black/20 border border-white/10 p-3 text-sm mt-1"
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-neutral-400">
                            {item.calories} kcal • {item.protein}g P •{" "}
                            {item.carbs}g C • {item.fat}g F
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full mt-4" onClick={savePhotoMacros}>
                      Save to Food Log
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* ------------ PRODUCT INFO ------------ */}
            {scannedData && (
              <div className="mt-6 space-y-4">
                <h2 className="text-lg font-semibold">{scannedData.name}</h2>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>Calories: {scannedData.calories} kcal / 100g</div>
                  <div>Protein: {scannedData.protein}g</div>
                  <div>Carbs: {scannedData.carbs}g</div>
                  <div>Fat: {scannedData.fat}g</div>
                </div>

                <div className="flex gap-2 items-center">
                  <Input
                    id="qty"
                    label="Quantity (g)"
                    type="number"
                    value={String(scannedData.quantity ?? 100)}
                    onChange={(e) =>
                      setScannedData({
                        ...scannedData,
                        quantity: Number(e.target.value || 0),
                      })
                    }
                  />
                  <div className="w-32">
                    <Button className="w-full" onClick={addIngredient}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------ CUSTOM BUILDER ------------ */}
            {ingredients.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Custom Food Builder</h3>

                <div className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b border-white/10 pb-2"
                    >
                      <div>
                        <div className="font-medium">{ing.name}</div>
                        <div className="text-sm text-neutral-400">
                          {ing.quantity} g • {ing.calories.toFixed(0)} kcal
                        </div>
                      </div>
                      <button
                        className="text-rose-400 hover:text-rose-500"
                        onClick={() => removeIngredient(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-neutral-400">
                  Total: {totalMacros.calories.toFixed(0)} kcal •{" "}
                  {totalMacros.protein.toFixed(1)}g P •{" "}
                  {totalMacros.carbs.toFixed(1)}g C •{" "}
                  {totalMacros.fat.toFixed(1)}g F
                </div>

                <div className="flex gap-3">
                  <Input
                    id="foodName"
                    label="Custom Food Name"
                    placeholder="e.g. Homemade Chicken Burger"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                  <div className="w-32">
                    <Button onClick={saveCustomFood} className="w-full">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* floating toggle */}
      <FloatingScan mode={mode} onChange={(m) => setMode(m)} />

      {/* Meal Picker Modal */}
      <AnimatePresence>
        {mealPickerOpen && (
          <MealTypePicker
            open={mealPickerOpen}
            onClose={() => setMealPickerOpen(false)}
            onSelect={handleMealSelect}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ScanPage;
