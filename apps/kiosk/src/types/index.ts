export type UserRole = 'admin' | 'staff' | 'student'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  studentId?: string | null
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

export type RequestStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'released'
  | 'cancelled'
  | 'rejected'

export interface DocumentType {
  id: string
  name: string
  description: string
  processingDays: number
  fee: number
  requiresClearance: boolean
  isActive: boolean
}

export interface ServiceRequest {
  id: string
  userId: string
  documentTypeId: string
  status: RequestStatus
  purpose?: string
  copies: number
  remarks?: string
  rejectionReason?: string
  trackingNumber: string
  requestedAt: string
  completedAt?: string
  user?: Partial<User>
  documentType?: DocumentType
}

export interface VisitorLog {
  id: string
  visitorName: string
  contactNumber?: string
  studentId?: string
  purpose: string
  purposeDetails?: string
  timeIn: string
  timeOut?: string
  notes?: string
  servedBy?: Partial<User>
}

export interface Announcement {
  id: string
  title: string
  content: string
  target: 'all' | 'students' | 'staff' | 'kiosk'
  isActive: boolean
  expiresAt?: string
  createdAt: string
  createdBy?: Partial<User>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthResponse {
  accessToken: string
  user: User
}