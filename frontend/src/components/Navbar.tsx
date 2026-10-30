import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, Activity, BarChart3, History, BookOpen, MessageSquare, AlertTriangle } from "lucide-react";
import { api } from "../services/api";
import type { HealthInfo } from "../types";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [health, setHealth] = useState<HealthInfo | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: Leaf },
    { to: "/detect", label: "Detect Disease", icon: Activity },
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/history", label: "History", icon: History },
    { to: "/methodology", label: "Methodology", icon: BookOpen },
    { to: "/contact", label: "Feedback", icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:bg-emerald-800 transition-colors">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                FloraScan <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold tracking-wider">AI</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium -mt-1">Crop Pathology Detection</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Model Status Indicator */}
          <div className="flex items-center gap-3">
            {health ? (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  health.model_ready
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
                title={health.model_ready ? `Model ready: ${health.model_name}` : "Model checkpoint pending"}
              >
                {health.model_ready ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>MobileNetV2 Active</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Setup Mode</span>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Checking API...</span>
              </div>
            )}

            <Link
              to="/detect"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              Analyze Leaf
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
