import type {
  HealthInfo,
  ClassItem,
  SampleItem,
  PredictionResult,
  HistoryResponse,
  AnalyticsSummary,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      errMsg = res.statusText || errMsg;
    }
    throw new ApiError(errMsg, res.status);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<HealthInfo> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthInfo>(res);
  },

  async getClasses(): Promise<{ count: number; model_loaded: boolean; classes: ClassItem[] }> {
    const res = await fetch(`${API_BASE}/classes`);
    return handleResponse<{ count: number; model_loaded: boolean; classes: ClassItem[] }>(res);
  },

  async getSamples(): Promise<{ samples: SampleItem[] }> {
    const res = await fetch(`${API_BASE}/samples`);
    return handleResponse<{ samples: SampleItem[] }>(res);
  },

  async predictLeaf(imageFile: File): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<PredictionResult>(res);
  },

  async getHistory(page = 1, pageSize = 10, crop?: string): Promise<HistoryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (crop) {
      params.append("crop", crop);
    }
    const res = await fetch(`${API_BASE}/history?${params.toString()}`);
    return handleResponse<HistoryResponse>(res);
  },

  async getHistoryDetail(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/history/${id}`);
    return handleResponse<any>(res);
  },

  async deleteHistoryItem(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return handleResponse<AnalyticsSummary>(res);
  },

  getReportDownloadUrl(id: string): string {
    return `${API_BASE}/reports/${id}`;
  },
};
