import express from 'express';
import * as authController from '../controller/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const router = express.Router();

// Public routes
router.post('/register/patient', authController.registerPatient);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

export default router;