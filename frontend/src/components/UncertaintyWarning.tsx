import React from "react";
import { AlertTriangle } from "lucide-react";

interface UncertaintyWarningProps {
  warning?: string | null;
  confidence: number;
}

export const UncertaintyWarning: React.FC<UncertaintyWarningProps> = ({ warning, confidence }) => {
  if (!warning && confidence >= 0.65) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
          Diagnostic Confidence Caution ({Math.round(confidence * 100)}%)
        </h4>
        <p className="text-xs text-amber-800 leading-relaxed">
          {warning ||
            "The model's classification confidence is below the recommended threshold (65%). Visual symptoms may be in early stages, masked by secondary pathogens, or affected by environmental factors. Confirm with local agricultural extension personnel."}
        </p>
      </div>
    </div>
  );
};
