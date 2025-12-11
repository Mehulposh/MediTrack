import express from 'express';
import * as adminController from '../controller/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Doctor management
router.post('/doctors', adminController.addDoctor);
router.get('/doctors', adminController.getDoctors);
router.get('/doctors/:id', adminController.getDoctorById);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);
router.put('/doctors/:id/availability', adminController.setDoctorAvailability);

// Appointment management
router.get('/appointments', adminController.getAppointments);

// Patient management
router.get('/patients', adminController.getPatients);


export default router;