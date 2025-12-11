import api from '../services/apiservices.ts';
import type { ApiResponse, Patient, Doctor, Appointment, VisitSummary } from '../types/index.ts';

export const patientService = {
  async getProfile(): Promise<ApiResponse<Patient>> {
    const response = await api.get('/patient/profile');
    return response.data;
  },

  async updateProfile(data: Partial<Patient>): Promise<ApiResponse<Patient>> {
    const response = await api.put('/patient/profile', data);
    return response.data;
  },

  async getDoctors(params?: { specialization?: string; page?: number; limit?: number }): Promise<ApiResponse<Doctor[]>> {
    const response = await api.get('/patient/doctors', { params });
    return response.data;
  },

  async getDoctorById(id: string): Promise<ApiResponse<Doctor>> {
    const response = await api.get(`/patient/doctors/${id}`);
    return response.data;
  },

  async bookAppointment(data: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> {
    const response = await api.post('/patient/appointments', data);
    return response.data;
  },

  async getAppointments(params?: { status?: string; upcoming?: boolean }): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/patient/appointments', { params });
    return response.data;
  },

  async cancelAppointment(id: string, cancellationReason: string): Promise<ApiResponse<Appointment>> {
    const response = await api.put(`/patient/appointments/${id}/cancel`, { cancellationReason });
    return response.data;
  },

  async getVisitSummaries(): Promise<ApiResponse<VisitSummary[]>> {
    const response = await api.get('/patient/visit-summaries');
    return response.data;
  },

  async getVisitSummary(id: string): Promise<ApiResponse<VisitSummary>> {
    const response = await api.get(`/patient/visit-summaries/${id}`);
    return response.data;
  },
};