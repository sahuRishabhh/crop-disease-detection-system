import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Layers,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BarChart3,
  Cpu,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { api } from "../services/api";
import type { ClassItem } from "../types";

export const HomePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("All");

  useEffect(() => {
    api.getClasses()
      .then((res) => setClasses(res.classes))
      .catch(() => setClasses([]));
  }, []);

  const uniqueCrops = ["All", ...Array.from(new Set(classes.map((c) => c.crop_name)))];

  const filteredClasses = selectedCrop === "All"
    ? classes
    : classes.filter((c) => c.crop_name === selectedCrop);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-emerald-50/70 via-white to-transparent border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Deep Learning Transfer Learning • MobileNetV2 & Grad-CAM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI-Powered <span className="text-emerald-700">Crop Disease</span> Detection & Diagnosis
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              An academic foliar pathology platform combining lightweight deep neural networks with visual Grad-CAM explainability, integrated agronomy knowledge bases, and formal PDF diagnosis exports.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/detect"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-lg shadow-emerald-700/25 transition-all text-sm group"
              >
                <span>Detect Disease Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-xs transition-all text-sm"
              >
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span>Explore Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-700">Diagnostic Workflow</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">How FloraScan AI Operates</h3>
          <p className="text-sm text-slate-500">From raw leaf photo to explainable pathology report in milliseconds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Leaf Image Input",
              desc: "Upload or capture a clear photo of an infected or healthy crop leaf.",
              icon: Leaf,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              step: "02",
              title: "Deep Neural Vision",
              desc: "MobileNetV2 processes foliar lesions through depthwise separable convolutions.",
              icon: Cpu,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              step: "03",
              title: "Grad-CAM Heatmap",
              desc: "Extracts gradient activation heatmaps to verify where the network focused.",
              icon: Layers,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              step: "04",
              title: "Management & PDF",
              desc: "Retrieves symptoms and verified IPM recommendations with downloadable PDF.",
              icon: FileCheck,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200">{item.step}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Crops & Class Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-700">Indexed Taxonomy</h2>
              <h3 className="text-2xl font-bold text-slate-900">Supported Crops & Pathology Classes</h3>
              <p className="text-xs text-slate-500 mt-1">
                Trained neural network and knowledge base coverage across Solanaceae, Poaceae, Rosaceae, and Vitaceae crops.
              </p>
            </div>

            {/* Crop filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {uniqueCrops.map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCrop === crop
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredClasses.map((item) => (
              <div
                key={item.class_id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between shadow-xs hover:border-emerald-300 transition-colors"
              >
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    {item.crop_name}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {item.disease_name}
                  </span>
                </div>
                {item.is_healthy ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Healthy
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 shrink-0">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    Pathology
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific Notice / Academic Context */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-base font-bold text-amber-950">Academic Research and Limitations Statement</h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              This system is engineered for academic research, automated pipeline verification, and agricultural computer vision experimentation. Image-based predictions are preliminary statistical hypotheses. Confounding factors such as leaf senescence, nutrient chlorosis, and camera lighting can influence predictions. Always verify diagnosis through field pathology and local agricultural extension clinics.
            </p>
          </div>
          <Link
            to="/methodology"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 underline shrink-0"
          >
            <span>Read Methodology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
