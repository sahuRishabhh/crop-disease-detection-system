export interface HealthInfo {
  status: string;
  model_ready: boolean;
  model_name?: string;
  classes_count: number;
  device: string;
  disclaimer: string;
}

export interface ClassItem {
  class_id: string;
  crop_name: string;
  disease_name: string;
  is_healthy: boolean;
}

export interface SampleItem {
  id: string;
  label: string;
  url: string;
}

export interface TopPrediction {
  class_name: string;
  crop_name: string;
  disease_name: string;
  confidence: number;
}

export interface KnowledgeGuidance {
  pathogen?: string;
  symptoms: string[];
  prevention: string[];
  management: string[];
  limitations?: string;
  references: string[];
  verified: boolean;
}

export interface PredictionResult {
  prediction_id: string;
  predicted_class: string;
  crop_name: string;
  disease_name: string;
  is_healthy: boolean;
  confidence: number;
  model_name: string;
  inference_time_ms: number;
  warning?: string | null;
  top_predictions: TopPrediction[];
  guidance: KnowledgeGuidance;
  gradcam_base64?: string | null;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  predicted_class: string;
  crop_name: string;
  disease_name: string;
  confidence: number;
  model_version: string;
  inference_time_ms: number;
  warning?: string | null;
  top_predictions?: TopPrediction[];
  created_at: string;
}

export interface HistoryResponse {
  total: number;
  page: number;
  page_size: number;
  items: HistoryItem[];
}

export interface DiseaseFrequency {
  name: string;
  count: number;
}

export interface AnalyticsSummary {
  total_predictions: number;
  healthy_count: number;
  diseased_count: number;
  class_distribution: DiseaseFrequency[];
  recent_activity: {
    id: string;
    crop_name: string;
    disease_name: string;
    confidence: number;
    created_at: string;
  }[];
}
