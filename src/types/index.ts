export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

/**
 * Registration -> PENDING_APPROVAL -> APPROVED -> ALLOCATED -> ACTIVE
 *                                  \-> REJECTED
 */
export type StudentStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ALLOCATED'
  | 'ACTIVE'
  | 'REJECTED';

export type ContentType = 'VIDEO' | 'NOTES' | 'ASSIGNMENT' | 'IMAGE';

export type DocumentType = 'PHOTO' | 'ID_PROOF' | 'MARKSHEET' | 'OTHER';

export type BatchStatus = 'UPCOMING' | 'RUNNING' | 'COMPLETED';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  phone: string;
  designation?: string;
  /** Set for STUDENT accounts - links to the Student record. */
  studentId?: string;
  /** Set for TEACHER accounts - courses they own. */
  courseIds?: string[];
  avatarColor: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  tagline: string;
  description: string;
  durationWeeks: number;
  fee: number;
  level: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface CourseModule {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
}

export interface ContentItem {
  id: string;
  moduleId: string;
  courseId: string;
  order: number;
  type: ContentType;
  title: string;
  description: string;
  duration: string | null;
  fileName: string;
  fileSize: string;
  url: string;
  uploadedOn: string;
  uploadedBy: string;
  dueDate?: string;
}

export interface Batch {
  id: string;
  code: string;
  courseId: string;
  startDate: string;
  endDate: string;
  days: string;
  startTime: string;
  endTime: string;
  capacity: number;
  mode: string;
  room: string;
  teacherId: string;
  status: BatchStatus;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  uploadedOn: string;
}

export interface Education {
  qualification: string;
  institution: string;
  board: string;
  yearOfPassing: number;
  percentage: number;
}

export interface Student {
  id: string;
  registrationNo: string;
  status: StudentStatus;

  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;

  email: string;
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  guardianName: string;
  guardianPhone: string;

  education: Education;

  courseId: string;
  batchId: string | null;

  appliedOn: string;
  reviewedOn: string | null;
  reviewedBy: string | null;
  allocatedOn: string | null;
  rejectionReason: string | null;

  documents: StudentDocument[];
  completedContentIds: string[];
  avatarColor: string;
}

/** Payload produced by the multi step registration form. */
export interface RegistrationPayload {
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  guardianName: string;
  guardianPhone: string;
  education: Education;
  courseId: string;
  documents: StudentDocument[];
  password: string;
}

export interface DashboardStats {
  students: {
    pending: number;
    approved: number;
    allocated: number;
    active: number;
    rejected: number;
    total: number;
  };
  courses: number;
  batches: number;
  content: number;
}
