import React, { useState } from "react";
import { Eye, Layers, Sparkles, Info } from "lucide-react";

interface GradCamViewerProps {
  originalImageSrc: string;
  gradcamBase64?: string | null;
  cropName: string;
  diseaseName: string;
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({
  originalImageSrc,
  gradcamBase64,
  cropName,
  diseaseName,
}) => {
  const [viewMode, setViewMode] = useState<"overlay" | "original" | "sideBySide">("overlay");

  if (!gradcamBase64) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Original Input Foliage</h4>
        <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
          <img src={originalImageSrc} alt="Input leaf" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Model Attention (Grad-CAM)
            </h4>
          </div>
          <p className="text-xs text-slate-500">Visual explanation of features guiding classification</p>
        </div>

        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium text-slate-600">
          <button
            onClick={() => setViewMode("overlay")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "overlay"
                ? "bg-white text-emerald-800 font-semibold shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Heatmap Overlay
          </button>
          <button
            onClick={() => setViewMode("original")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "original"
                ? "bg-white text-emerald-800 font-semibold shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Original Leaf
          </button>
          <button
            onClick={() => setViewMode("sideBySide")}
            className={`px-3 py-1.5 rounded-md transition-all hidden sm:flex items-center gap-1.5 ${
              viewMode === "sideBySide"
                ? "bg-white text-emerald-800 font-semibold shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            Split View
          </button>
        </div>
      </div>

      {/* Image Display */}
      {viewMode === "sideBySide" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Input Photo</span>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={originalImageSrc} alt="Original Leaf" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Attention Map</span>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-emerald-200">
              <img src={gradcamBase64} alt="Grad-CAM Overlay" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
          <img
            src={viewMode === "overlay" ? gradcamBase64 : originalImageSrc}
            alt={viewMode === "overlay" ? "Grad-CAM Heatmap" : "Original Leaf"}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur text-[11px] font-medium text-white shadow">
            {viewMode === "overlay" ? "Grad-CAM Activation Heatmap" : "Original Foliage Image"}
          </div>
        </div>
      )}

      {/* Educational Explanation Box */}
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-[11px] text-emerald-950 leading-relaxed">
          <strong className="font-semibold text-emerald-900">How to interpret:</strong> Warm regions (red, orange, yellow) indicate leaf pixel neighborhoods that triggered the strongest gradient activations in MobileNetV2's final convolutional layer for <em>{cropName} - {diseaseName}</em>. Cool regions (blue, cyan) had minimal influence.
        </p>
      </div>
    </div>
  );
};
