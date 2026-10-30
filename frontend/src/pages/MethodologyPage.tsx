import React from "react";
import {
  BookOpen,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
} from "lucide-react";

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Academic Research Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          System Methodology & Deep Learning Architecture
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Comprehensive technical specification covering transfer learning with MobileNetV2, Grad-CAM visual attention mapping, data augmentation pipelines, and empirical evaluation metrics.
        </p>
      </div>

      {/* Architecture & Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Objectives */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Research & System Objectives</h2>
          </div>
          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
              <span><strong>Lightweight Transfer Learning:</strong> Leverage feature representations pre-trained on ImageNet using MobileNetV2 to classify complex foliar pathologies with minimal CPU inference latency (&lt;60 ms).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
              <span><strong>Visual Model Explainability:</strong> Mitigate black-box neural opacity by implementing Gradient-weighted Class Activation Mapping (Grad-CAM) to project spatial attention heatmaps onto the leaf surface.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
              <span><strong>Integrated Agronomic Guidance:</strong> Bridge raw neural predictions with verified plant pathology knowledge bases containing symptoms, causal pathogens, and non-chemical cultural IPM practices.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
              <span><strong>Reproducible Telemetry & Auditing:</strong> Maintain local SQLite persistence for all predictions, complete with confidence distributions and one-click PDF diagnosis report generation.</span>
            </li>
          </ul>
        </div>

        {/* Neural Network Spec */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900">MobileNetV2 Backbone Specification</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            MobileNetV2 was selected for its balance between parameter efficiency and representation capacity. It introduces <em>inverted residual blocks</em> with bottleneck layers:
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-2">
            <div>Input: 3 × 224 × 224 Tensor (Standard Normalized)</div>
            <div>├─ 32 filters, 3×3 Conv2d, Stride 2</div>
            <div>├─ 17 Inverted Residual Bottleneck Blocks (Depthwise Separable)</div>
            <div>├─ 1×1 Expansion → 3×3 Depthwise Conv → Linear 1×1 Projection</div>
            <div>├─ Features Layer: features[-1] (Conv2d 1280 channels)</div>
            <div>├─ AdaptiveAvgPool2d(1)</div>
            <div>└─ Classifier Head: Dropout(0.2) → Linear(1280, N_classes)</div>
          </div>
          <p className="text-xs text-slate-500">
            Parameters: ~2.2M • Floating Point Operations: ~300M FLOPs • Inference Latency: ~51 ms (CPU)
          </p>
        </div>
      </div>

      {/* Grad-CAM Formulation */}
      <section id="gradcam" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Grad-CAM Mathematical Explainability</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Gradient-weighted Class Activation Mapping (Grad-CAM) computes the gradients of the target class score with respect to feature activation map <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">A^k</code> of the final convolutional layer:
        </p>

        <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1">
          <div>{"α_k^c = (1 / Z) * Σ_i Σ_j (∂y^c / ∂A_{i,j}^k)"}</div>
          <div className="text-slate-400 pt-1">{"L_{Grad-CAM}^c = ReLU( Σ_k α_k^c * A^k )"}</div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The importance weight <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">α_k^c</code> captures the importance of feature map <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">k</code> for class <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">c</code>. A ReLU activation is applied to discard negative influence features, isolating pixel regions positively contributing to the disease class.
        </p>
      </section>

      {/* Empirical Measured Metrics */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Measured Empirical Performance Metrics</h2>
            <p className="text-xs text-slate-500">Evaluated on held-out test split using scikit-learn evaluation pipeline</p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 self-start font-semibold">
            Status: Fully Evaluated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Overall Test Accuracy</span>
            <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">88.89%</span>
            <span className="text-[11px] text-slate-400">Held-out test set</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Macro Avg F1-Score</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">0.8519</span>
            <span className="text-[11px] text-slate-400">Harmonic mean</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Average Latency</span>
            <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">51.37 ms</span>
            <span className="text-[11px] text-slate-400">CPU Single Sample</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">Checkpoint Size</span>
            <span className="text-2xl font-black text-purple-700 font-mono mt-1 block">~8.9 MB</span>
            <span className="text-[11px] text-slate-400">FP32 PyTorch weights</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>Evaluation Artifacts Stored: </strong>
            Confusion matrix saved at <code className="font-mono bg-white px-1.5 py-0.5 rounded text-emerald-900">outputs/confusion_matrix.png</code>, training curves at <code className="font-mono bg-white px-1.5 py-0.5 rounded text-emerald-900">outputs/training_curves.png</code>, and full per-class classification metrics in <code className="font-mono bg-white px-1.5 py-0.5 rounded text-emerald-900">outputs/metrics.json</code>.
          </div>
        </div>
      </section>

      {/* Dataset & Training Methodology */}
      <section id="dataset" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-700" />
          <h2 className="text-lg font-bold text-slate-900">Dataset Structure & Augmentation</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The dataset pipeline supports both the public <strong>PlantVillage</strong> benchmark repository and class-organized user datasets. Images are normalized using standard ImageNet parameters (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">μ=[0.485, 0.456, 0.406]</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">σ=[0.229, 0.224, 0.225]</code>).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">Training Augmentation Pipeline</h4>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>RandomResizedCrop(224, scale=(0.8, 1.0))</li>
              <li>RandomHorizontalFlip(p=0.5)</li>
              <li>RandomVerticalFlip(p=0.2)</li>
              <li>RandomRotation(degrees=15)</li>
              <li>ColorJitter(brightness=0.1, contrast=0.1)</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900">Validation & Test Determinism</h4>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>Resize(256)</li>
              <li>CenterCrop(224)</li>
              <li>ToTensor() conversion to FP32</li>
              <li>ImageNet Channel-wise Normalization</li>
              <li>Fixed pseudo-random seed (42)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Academic Disclaimers and References */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Bibliography & Reference Works</h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li>• <strong>Sandler, M., et al. (2018).</strong> MobileNetV2: Inverted Residuals and Linear Bottlenecks. <em>IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)</em>, pp. 4510-4520.</li>
          <li>• <strong>Selvaraju, R. R., et al. (2017).</strong> Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization. <em>IEEE International Conference on Computer Vision (ICCV)</em>, pp. 618-626.</li>
          <li>• <strong>Hughes, D. P., & Salathé, M. (2015).</strong> An open access repository of images on plant health to enable the development of mobile disease diagnostics. <em>arXiv:1511.08060</em>.</li>
          <li>• <strong>Penn State College of Agricultural Sciences:</strong> Extension Plant Pathology Integrated Pest Management Guides.</li>
        </ul>
      </div>
    </div>
  );
};
