import React from "react";
import { Leaf, ShieldAlert, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Project Summary */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 text-emerald-200" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">FloraScan AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Academic deep learning foliar pathology detection system utilizing transfer learning with MobileNetV2,
              Grad-CAM explainability, and integrated disease agronomy databases.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                PyTorch 2.15
              </span>
              <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                FastAPI
              </span>
              <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                React 19
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home & Overview</Link></li>
              <li><Link to="/detect" className="hover:text-emerald-400 transition-colors">Leaf Disease Detection</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Analytics Dashboard</Link></li>
              <li><Link to="/history" className="hover:text-emerald-400 transition-colors">Prediction History Log</Link></li>
              <li><Link to="/methodology" className="hover:text-emerald-400 transition-colors">Academic Methodology</Link></li>
            </ul>
          </div>

          {/* Technical Documentation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Documentation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
                  <span>FastAPI Swagger UI</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="/redoc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
                  <span>ReDoc Specification</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link to="/methodology#gradcam" className="hover:text-emerald-400 transition-colors">
                  Grad-CAM Attention Theory
                </Link>
              </li>
              <li>
                <Link to="/methodology#dataset" className="hover:text-emerald-400 transition-colors">
                  Dataset & Split Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Academic Rigor */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Scientific & Agronomic Notice</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Predictions produced by this system represent preliminary statistical inferences from foliar imagery.
              They are not legal, commercial, or clinical diagnosis certifications. Always consult qualified agricultural extension officers before applying chemical treatments.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Crop Disease Detection Academic Project. Built for academic research and demonstration.</p>
          <p className="text-slate-400">Local Environment • Zero External Paid APIs</p>
        </div>
      </div>
    </footer>
  );
};
