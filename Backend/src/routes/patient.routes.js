import express from 'express';
import * as patientController from '../controllers/patient.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';


const router = express.Router();

// All routes require authentication and patient role
router.use(authenticate, authorize('patient'));

// Profile routes
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

// Doctor browsing
router.get('/doctors', patientController.getDoctors);
router.get('/doctors/:id', patientController.getDoctorById);

// Appointment routes
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments', patientController.getAppointments);
router.put('/appointments/:id/cancel', patientController.cancelAppointment);

// Visit summaries
router.get('/visit-summaries', patientController.getVisitSummaries);
router.get('/visit-summaries/:id', patientController.getVisitSummary);

export default router;