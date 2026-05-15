export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export type ReportCategory = 'sampah' | 'banjir' | 'jalan_rusak' | 'fasilitas_umum' | 'lampu_jalan' | 'lainnya'
export type ReportStatus = 'pending' | 'processing' | 'resolved' | 'escalated'
export type ReportPriority = 'low' | 'medium' | 'high'

export interface LocationData {
  province: string
  city: string
  district: string
  subdistrict: string
  postal_code: string
  full_address: string
  latitude: number
  longitude: number
}

export interface AIAnalysisResult {
  score: number                        // 0–100
  priority: ReportPriority
  confidence: number                   // 0–100 percentage
  detectedCategory: ReportCategory | null
  visualSummary: string
  severityLevel: 'low' | 'medium' | 'high' | 'critical'
  detectedObjects: string[]
  analysisNotes: string[]
}

// Alias used by ai-scoring.ts
export type VisualAnalysis = AIAnalysisResult

export interface Report {
  id: string
  user_id: string
  title: string
  description: string
  category: ReportCategory
  image_url?: string
  location: string
  latitude?: number
  longitude?: number
  province?: string
  city?: string
  district?: string
  subdistrict?: string
  postal_code?: string
  full_address?: string
  priority: ReportPriority
  status: ReportStatus
  ai_score: number
  ai_confidence?: number
  ai_detected_category?: string
  ai_visual_summary?: string
  created_at: string
  users?: User
}

export interface AdminProfile {
  id: string
  user_id: string
  name: string
  email: string
  role: UserRole
  province?: string
  city?: string
  district?: string
  subdistrict?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
}

export interface DashboardStats {
  total: number
  pending: number
  processing: number
  resolved: number
  high_priority: number
  escalated?: number
}
