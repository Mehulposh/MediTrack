import express from 'express';
import * as doctorController from '../controller/doctor.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticate, authorize('doctor'));

// Profile routes
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);

// Appointment routes
router.get('/appointments', doctorController.getAppointments);
router.get('/appointments/today', doctorController.getTodaySchedule);
router.get('/appointments/history', doctorController.getAppointmentsHistory);
router.put('/appointments/:id/no-show', doctorController.markNoShow);

// Patient routes
router.get('/patients/:patientId', doctorController.getPatientDetails);

// Visit summary routes
router.post('/visit-summaries', doctorController.addVisitSummary);
router.put('/visit-summaries/:id', doctorController.updateVisitSummary);

export default router;