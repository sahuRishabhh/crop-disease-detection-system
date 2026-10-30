import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  FileText
} from "lucide-react";
import { api } from "../services/api";
import type { HistoryItem } from "../types";

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [cropFilter, setCropFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = () => {
    setLoading(true);
    api.getHistory(page, pageSize, cropFilter || undefined)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [page, cropFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const openDetails = async (id: string) => {
    try {
      const data = await api.getHistoryDetail(id);
      setSelectedRecord(data);
    } catch {
      alert("Failed to load prediction details.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await api.deleteHistoryItem(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchHistory();
    } catch {
      alert("Failed to delete record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Diagnostic History Log</h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete database of prior leaf analyses with downloadable PDF reports and audit details.
          </p>
        </div>

        {/* Search filter form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter by crop (e.g. Tomato)..."
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Host Crop</th>
                <th className="py-3.5 px-4">Diagnosed Condition</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Latency</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading prediction history...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No prediction records found.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isHealthy = item.predicted_class.toLowerCase().includes("healthy");
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.created_at.replace("T", " ").slice(0, 19)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.crop_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-500" : "bg-red-500"}`} />
                          <span className="font-medium text-slate-800">{item.disease_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={item.confidence >= 0.65 ? "text-emerald-700" : "text-amber-600"}>
                          {Math.round(item.confidence * 1000) / 10}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {item.inference_time_ms} ms
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openDetails(item.id)}
                            title="View Record Details"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={api.getReportDownloadUrl(item.id)}
                            download
                            title="Download PDF Diagnosis Report"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {total > pageSize && (
          <div className="py-3.5 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-medium">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Historical Diagnosis Audit</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Host Crop</span>
                  <strong className="text-slate-900 text-sm">{selectedRecord.record.crop_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Condition</span>
                  <strong className="text-slate-900 text-sm">{selectedRecord.record.disease_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Confidence</span>
                  <strong className="text-slate-900 font-mono">{Math.round(selectedRecord.record.confidence * 1000) / 10}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Logged Timestamp</span>
                  <span className="text-slate-600 font-mono">{selectedRecord.record.created_at}</span>
                </div>
              </div>

              {selectedRecord.guidance?.symptoms?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Visible Symptoms</h4>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {selectedRecord.guidance.symptoms.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecord.guidance?.management?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Management Guidance</h4>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {selectedRecord.guidance.management.map((m: string, idx: number) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={api.getReportDownloadUrl(selectedRecord.record.id)}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Report</span>
              </a>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleIn text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Diagnostic Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This action permanently purges this inference record from the local SQLite history table.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
