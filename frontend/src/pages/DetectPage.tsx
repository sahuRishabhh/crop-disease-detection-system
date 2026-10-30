import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  Download,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  X
} from "lucide-react";
import { api, ApiError } from "../services/api";
import type { PredictionResult, SampleItem } from "../types";
import { GradCamViewer } from "../components/GradCamViewer";
import { TopPredictionsChart } from "../components/TopPredictionsChart";
import { UncertaintyWarning } from "../components/UncertaintyWarning";

export const DetectPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getSamples()
      .then((res) => setSamples(res.samples))
      .catch(() => setSamples([]));
  }, []);

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    setResult(null);

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Invalid file format. Please upload a JPEG, PNG, or WEBP image.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5 MB limit. Please select a smaller photo.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleItem) => {
    setErrorMsg(null);
    setResult(null);
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], sample.id, { type: "image/jpeg" });
      handleFileChange(file);
    } catch {
      setErrorMsg("Failed to load sample image. Please try uploading a local image.");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setResult(null);
    setErrorMsg(null);
  };

  const runPrediction = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const pred = await api.predictLeaf(selectedFile);
      setResult(pred);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to analyze image. Please ensure the backend service is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-Time Convolutional Inference</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leaf Pathology Diagnosis</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Upload an image of a plant leaf showing disease symptoms or select from verified sample foliage below.
          MobileNetV2 will perform transfer-learned classification alongside Grad-CAM visual attention mapping.
        </p>
      </div>

      {/* Main Analysis Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Leaf Image Source</span>
              {previewUrl && (
                <button
                  onClick={clearSelection}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </h3>

            {/* Dropzone */}
            {!previewUrl ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/60"
                    : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50/80 bg-slate-50/40"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drop leaf image
                  </p>
                  <p className="text-xs text-slate-500 mt-1">JPEG, PNG, or WEBP up to 5 MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                  <img src={previewUrl} alt="Selected Leaf" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                  <span>{selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB</span>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={runPrediction}
              disabled={!selectedFile || isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                !selectedFile || isLoading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 active:scale-[0.99]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Neural Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Leaf Foliage</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Images Palette */}
          {samples.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-600">
                Or Test With Verified Sample Leaves
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {samples.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSample(s)}
                    className="group bg-white rounded-xl border border-slate-200 p-2 text-left hover:border-emerald-400 transition-all hover:shadow-xs flex flex-col gap-1.5"
                  >
                    <div className="aspect-square w-full rounded-lg bg-slate-100 overflow-hidden">
                      <img
                        src={s.url}
                        alt={s.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 truncate block">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Results Panel */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6">
              {/* Primary Diagnosis Header Card */}
              <div
                className={`rounded-3xl p-6 border shadow-sm ${
                  result.is_healthy
                    ? "bg-emerald-50/80 border-emerald-200"
                    : "bg-red-50/70 border-red-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-1">
                      Identified Host: <strong className="text-slate-900">{result.crop_name}</strong>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {result.disease_name}
                    </h2>
                    <p className="text-xs font-mono text-slate-500 mt-1">Class ID: {result.predicted_class}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] uppercase font-semibold text-slate-500 block">Confidence</span>
                      <span className="text-2xl font-black text-slate-900 font-mono">
                        {Math.round(result.confidence * 1000) / 10}%
                      </span>
                    </div>

                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                        result.is_healthy ? "bg-emerald-600" : "bg-red-600"
                      }`}
                    >
                      {result.is_healthy ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <ShieldAlert className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200/60 text-xs">
                  <span className="bg-white/80 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                    Model: {result.model_name}
                  </span>
                  <span className="bg-white/80 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                    Latency: {result.inference_time_ms} ms
                  </span>
                  <a
                    href={api.getReportDownloadUrl(result.prediction_id)}
                    download
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-700 text-white font-semibold shadow-xs hover:bg-emerald-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </a>
                </div>
              </div>

              {/* Confidence Uncertainty Warning if any */}
              <UncertaintyWarning warning={result.warning} confidence={result.confidence} />

              {/* Grad-CAM Attention Map Visualization */}
              {previewUrl && (
                <GradCamViewer
                  originalImageSrc={previewUrl}
                  gradcamBase64={result.gradcam_base64}
                  cropName={result.crop_name}
                  diseaseName={result.disease_name}
                />
              )}

              {/* Top-5 Predictions Probability Chart */}
              <TopPredictionsChart predictions={result.top_predictions} />

              {/* Agronomic Knowledge Base Guidance */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Agronomic Symptomatology & Management Guidance
                  </h3>
                </div>

                {/* Pathogen */}
                {result.guidance.pathogen && (
                  <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-700">Causal Organism: </span>
                    <span className="font-mono text-slate-800">{result.guidance.pathogen}</span>
                  </div>
                )}

                {/* Symptoms */}
                {result.guidance.symptoms.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Characteristic Foliar Symptoms
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {result.guidance.symptoms.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prevention */}
                {result.guidance.prevention.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Preventive Agronomic Practices
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {result.guidance.prevention.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Management Recommendations */}
                {result.guidance.management.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Integrated Disease Management (IPM)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {result.guidance.management.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* References */}
                {result.guidance.references.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Extension Sources: </span>
                    <span>{result.guidance.references.join(" • ")}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-800">Awaiting Leaf Foliage</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a leaf photo from your device or choose one of the verified sample leaves on the left to initiate real-time deep learning inference.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
