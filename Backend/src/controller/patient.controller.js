import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import VisitSummary from '../models/VisitSummary.js';

// Get patient profile
export const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update patient profile
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'address', 'bloodGroup', 'allergies', 'emergencyContact'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Profile updated', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Browse doctors
export const getDoctors = async (req, res) => {
  try {
    const { specialization, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1 });

    const count = await Doctor.countDocuments(query);

    res.json({
      success: true,
      data: doctors,
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

// Get doctor details
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'email');
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const { doctorId, appointmentDate, appointmentTime, reason, notes } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: 'scheduled'
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'firstName lastName phoneNumber')
      .populate('doctorId', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient appointments
export const getAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const { status, upcoming } = req.query;
    
    const query = { patientId: patient._id };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.appointmentDate = { $gte: new Date() };
      query.status = 'scheduled';
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'firstName lastName specialization consultationFee')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });
    }

    // Check if cancellation is at least 2 hours before appointment
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel appointment less than 2 hours before scheduled time' 
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = 'patient';
    appointment.cancellationReason = cancellationReason;
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get visit summaries
export const getVisitSummaries = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const visitSummaries = await VisitSummary.find({ patientId: patient._id })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId', 'appointmentDate appointmentTime')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: visitSummaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single visit summary
export const getVisitSummary = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });

    const visitSummary = await VisitSummary.findOne({
      _id: req.params.id,
      patientId: patient._id
    })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId', 'appointmentDate appointmentTime');

    if (!visitSummary) {
      return res.status(404).json({ success: false, message: 'Visit summary not found' });
    }

    res.json({ success: true, data: visitSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};