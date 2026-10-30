import React from "react";
import type { TopPrediction } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TopPredictionsChartProps {
  predictions: TopPrediction[];
}

export const TopPredictionsChart: React.FC<TopPredictionsChartProps> = ({ predictions }) => {
  if (!predictions || predictions.length === 0) return null;

  const data = predictions.map((item, idx) => ({
    name: `${item.crop_name} - ${item.disease_name}`,
    shortName: item.disease_name,
    rawClass: item.class_name,
    confidencePct: Math.round(item.confidence * 1000) / 10,
    confidence: item.confidence,
    isPrimary: idx === 0,
    isHealthy: item.class_name.toLowerCase().includes("healthy")
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">
          Confidence Distribution (Top Hypotheses)
        </h4>
        <p className="text-xs text-slate-500">Softmax probability distribution across top candidate classes</p>
      </div>

      {/* Progress Bar List */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.rawClass} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium truncate max-w-[240px] sm:max-w-xs ${item.isPrimary ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
                {index + 1}. {item.name}
              </span>
              <span className={`font-mono font-bold ${item.isPrimary ? "text-emerald-700" : "text-slate-500"}`}>
                {item.confidencePct}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.isPrimary
                    ? item.isHealthy ? "bg-emerald-600" : "bg-emerald-600"
                    : "bg-slate-300"
                }`}
                style={{ width: `${Math.max(item.confidencePct, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Bar Chart for Visual Representation */}
      <div className="h-32 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 15, left: 10, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="shortName" width={100} tick={{ fontSize: 10, fill: "#64748b" }} />
            <Tooltip
              formatter={(val: any) => [`${val}%`, "Model Confidence"]}
              contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "11px" }}
              itemStyle={{ color: "#34d399" }}
            />
            <Bar dataKey="confidencePct" radius={[0, 4, 4, 0]}>
              {data.map((_item, idx) => (
                <Cell key={`cell-${idx}`} fill={idx === 0 ? "#15803d" : "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
