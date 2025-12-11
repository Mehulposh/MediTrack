import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import VisitSummary from '../models/VisitSummary.js';


// Get doctor profile
export const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor profile
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['phoneNumber', 'consultationFee', 'bio', 'availability'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Profile updated', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor's appointments
export const getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { status, date } = req.query;
    
    const query = { doctorId: doctor._id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const searchDate = new Date(date);
      query.appointmentDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59))
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName phoneNumber dateOfBirth gender bloodGroup allergies')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's schedule
export const getTodaySchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: { $gte: today, $lt: tomorrow }
    })
      .populate('patientId', 'firstName lastName phoneNumber age gender')
      .sort({ appointmentTime: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient details and history
export const getPatientDetails = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Get patient's visit history with this doctor
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    const visitHistory = await VisitSummary.find({
      patientId: patient._id,
      doctorId: doctor._id
    })
      .populate('appointmentId', 'appointmentDate appointmentTime')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: {
        patient,
        visitHistory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add visit summary
export const addVisitSummary = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { appointmentId, symptoms, diagnosis, vitalSigns, prescription, labTests, notes, followUpDate } = req.body;

    // Verify appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if summary already exists
    const existingSummary = await VisitSummary.findOne({ appointmentId });
    if (existingSummary) {
      return res.status(400).json({ success: false, message: 'Visit summary already exists for this appointment' });
    }

    const visitSummary = await VisitSummary.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: doctor._id,
      symptoms,
      diagnosis,
      vitalSigns,
      prescription,
      labTests,
      notes,
      followUpDate
    });

    // Update appointment status
    appointment.status = 'completed';
    await appointment.save();

    const populatedSummary = await VisitSummary.findById(visitSummary._id)
      .populate('patientId', 'firstName lastName')
      .populate('appointmentId', 'appointmentDate appointmentTime');

    res.status(201).json({
      success: true,
      message: 'Visit summary added successfully',
      data: populatedSummary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update visit summary
export const updateVisitSummary = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    const visitSummary = await VisitSummary.findOne({
      _id: req.params.id,
      doctorId: doctor._id
    });

    if (!visitSummary) {
      return res.status(404).json({ success: false, message: 'Visit summary not found' });
    }

    const allowedUpdates = ['symptoms', 'diagnosis', 'vitalSigns', 'prescription', 'labTests', 'notes', 'followUpDate'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(visitSummary, updates);
    await visitSummary.save();

    res.json({ success: true, message: 'Visit summary updated', data: visitSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark appointment as no-show
export const markNoShow = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Cannot mark this appointment as no-show' });
    }

    appointment.status = 'no-show';
    await appointment.save();

    res.json({ success: true, message: 'Appointment marked as no-show', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointments history
export const getAppointmentsHistory = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    const { page = 1, limit = 20 } = req.query;

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      status: { $in: ['completed', 'no-show', 'cancelled'] }
    })
      .populate('patientId', 'firstName lastName phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    const count = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: { $in: ['completed', 'no-show', 'cancelled'] }
    });

    res.json({
      success: true,
      data: appointments,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};