export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface MedicalHistoryEntry {
  condition: string;
  diagnosedDate?: string; // ISO date string
  notes?: string;
}

export interface Patient {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  fullName: string;
  age: number;

  medicalHistory?: MedicalHistoryEntry[];
}

export interface Doctor {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  qualification: string;
  experience: number;
  licenseNumber: string;
  phoneNumber: string;
  consultationFee: number;
  bio?: string;
  availability: Availability[];
  rating: number;
  totalReviews: number;
  fullName: string;
}


// NEW: Data Transfer Object for CREATE requests
export interface CreateDoctorDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization: string;
  qualification: string;
  experience: number;      // already parsed
  licenseNumber: string;
  phoneNumber: string;
  consultationFee: number; // already parsed
  bio?: string;
}

export interface Availability {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  _id: string;
  patientId: Patient | string;
  doctorId: Doctor | string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  cancelledBy?: 'patient' | 'doctor' | 'admin';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitSummary {
  _id: string;
  appointmentId: string;
  patientId: Patient | string;
  doctorId: Doctor | string;
  symptoms: string;
  diagnosis: string;
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: number;
    heartRate?: number;
    weight?: number;
    height?: number;
  };
  prescription: Prescription[];
  labTests?: LabTest[];
  notes?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Prescription {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabTest {
  testName: string;
  notes?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    profile: Patient | Doctor | null;
    token: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}