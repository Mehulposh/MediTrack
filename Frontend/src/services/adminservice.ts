import api from './apiservices.ts';
import type { ApiResponse, Doctor, Appointment, Patient , Availability} from '../types/index.ts';

export const adminService = {
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  async addDoctor(data: Doctor): Promise<ApiResponse<Doctor>> {
    const response = await api.post('/admin/doctors', data);
    return response.data;
  },

  async getDoctors(params?: Doctor): Promise<ApiResponse<Doctor[]>> {
    const response = await api.get('/admin/doctors', { params });
    return response.data;
  },

  async getDoctorById(id: string): Promise<ApiResponse<Doctor>> {
    const response = await api.get(`/admin/doctors/${id}`);
    return response.data;
  },

  async updateDoctor(id: string, data: Doctor): Promise<ApiResponse<Doctor>> {
    const response = await api.put(`/admin/doctors/${id}`, data);
    return response.data;
  },

  async deleteDoctor(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/admin/doctors/${id}`);
    return response.data;
  },

  async setDoctorAvailability(id: string, availability: Availability): Promise<ApiResponse<Doctor>> {
    const response = await api.put(`/admin/doctors/${id}/availability`, { availability });
    return response.data;
  },

  async getAppointments(params?: Appointment): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },

  async getPatients(params?: Patient): Promise<ApiResponse<Patient[]>> {
    const response = await api.get('/admin/patients', { params });
    return response.data;
  },
};