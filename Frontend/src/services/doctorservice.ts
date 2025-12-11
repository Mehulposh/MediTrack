import api from './apiservices.ts';
import type { ApiResponse, Doctor, Appointment, Patient, VisitSummary } from '../types/index.ts';

export const doctorService = {
  async getProfile(): Promise<ApiResponse<Doctor>> {
    const response = await api.get('/doctor/profile');
    return response.data;
  },

  async updateProfile(data: Partial<Doctor>): Promise<ApiResponse<Doctor>> {
    const response = await api.put('/doctor/profile', data);
    return response.data;
  },

  async getAppointments(params?: { status?: string; date?: string }): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/doctor/appointments', { params });
    return response.data;
  },

  async getTodaySchedule(): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/doctor/appointments/today');
    return response.data;
  },

  async getPatientDetails(patientId: string): Promise<ApiResponse<{ patient: Patient; visitHistory: VisitSummary[] }>> {
    const response = await api.get(`/doctor/patients/${patientId}`);
    return response.data;
  },

  async addVisitSummary(data: any): Promise<ApiResponse<VisitSummary>> {
    const response = await api.post('/doctor/visit-summaries', data);
    return response.data;
  },

  async markNoShow(appointmentId: string): Promise<ApiResponse<Appointment>> {
    const response = await api.put(`/doctor/appointments/${appointmentId}/no-show`);
    return response.data;
  },

  async getAppointmentsHistory(params?: { page?: number; limit?: number }): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/doctor/appointments/history', { params });
    return response.data;
  },
};