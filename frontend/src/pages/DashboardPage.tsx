import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  BarChart3,
  ArrowRight,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import { api } from "../services/api";
import type { AnalyticsSummary } from "../types";

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsSummary()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
        Loading analytics dashboard...
      </div>
    );
  }

  const total = data?.total_predictions || 0;
  const healthy = data?.healthy_count || 0;
  const diseased = data?.diseased_count || 0;
  const healthyPct = total > 0 ? Math.round((healthy / total) * 100) : 0;
  const diseasedPct = total > 0 ? Math.round((diseased / total) * 100) : 0;

  const pieData = [
    { name: "Healthy Foliage", value: healthy, color: "#15803d" },
    { name: "Pathology Detected", value: diseased, color: "#dc2626" },
  ];

  const classData = data?.class_distribution.map((d) => ({
    name: d.name,
    count: d.count,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Diagnostics Analytics</h1>
          <p className="text-sm text-slate-600 mt-1">
            Historical diagnostic telemetry, classification ratios, and neural activity logs.
          </p>
        </div>
        <Link
          to="/detect"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Activity className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Academic Caution Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong className="font-semibold text-blue-950">Usage vs Agricultural Prevalence Note: </strong>
          The metrics shown reflect cumulative queries submitted to this local software instance for pipeline verification and demonstration. They do <em>not</em> represent statistical disease incidence or epidemiological prevalence in actual farm fields.
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inferences</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3 font-mono">{total}</p>
          <p className="text-[11px] text-slate-500 mt-1">Lifetime processed leaf queries</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Healthy Foliage</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-800 mt-3 font-mono">{healthy}</p>
          <p className="text-[11px] text-slate-500 mt-1">{healthyPct}% of total queries</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Pathology Detected</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-800 mt-3 font-mono">{diseased}</p>
          <p className="text-[11px] text-slate-500 mt-1">{diseasedPct}% of total queries</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Avg Latency</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-900 mt-3 font-mono">~50 ms</p>
          <p className="text-[11px] text-slate-500 mt-1">Lightweight CPU execution</p>
        </div>
      </div>

      {total > 0 ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bar Chart: Frequency */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Diagnosis Frequency by Class</h3>
                <p className="text-xs text-slate-500">Distribution of historical predictions across identified conditions</p>
              </div>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      height={50}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Bar dataKey="count" fill="#15803d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Healthy vs Diseased */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Health Ratio</h3>
                <p className="text-xs text-slate-500">Proportion of healthy leaves vs. disease detections</p>
              </div>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100">
                <div className="bg-emerald-50 rounded-xl p-2">
                  <span className="text-[11px] font-semibold text-emerald-800 block">Healthy</span>
                  <span className="text-lg font-bold text-emerald-900">{healthy}</span>
                </div>
                <div className="bg-red-50 rounded-xl p-2">
                  <span className="text-[11px] font-semibold text-red-800 block">Pathology</span>
                  <span className="text-lg font-bold text-red-900">{diseased}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Inferences Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Diagnostic Feed</h3>
                <p className="text-xs text-slate-500">Latest neural classifications logged to the SQLite database</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.recent_activity.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900">{item.crop_name} - {item.disease_name}</span>
                    <span className="text-slate-400 block font-mono text-[11px]">{item.created_at}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-700">
                      {Math.round(item.confidence * 1000) / 10}%
                    </span>
                    <a
                      href={api.getReportDownloadUrl(item.id)}
                      download
                      title="Download PDF Report"
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Empty Dashboard State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Historical Records Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run your first leaf diagnostic analysis on the detection page to populate the telemetry database.
          </p>
          <Link
            to="/detect"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 mt-2"
          >
            Go to Detection Page
          </Link>
        </div>
      )}
    </div>
  );
};
