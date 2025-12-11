import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import VisitSummary from '../models/VisitSummary.js';


// Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    const upcomingAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today },
      status: 'scheduled'
    });

    // This month's appointments
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: firstDayOfMonth }
    });

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        upcomingAppointments,
        monthAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add doctor
export const addDoctor = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      specialization,
      qualification,
      experience,
      licenseNumber,
      phoneNumber,
      consultationFee,
      bio,
      availability
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check if license number already exists
    const existingLicense = await Doctor.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ success: false, message: 'License number already exists' });
    }

    // Create user account
    const user = await User.create({
      email,
      password,
      role: 'doctor'
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      userId: user._id,
      firstName,
      lastName,
      specialization,
      qualification,
      experience,
      licenseNumber,
      phoneNumber,
      consultationFee,
      bio,
      availability: availability || []
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate('userId', 'email');

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: populatedDoctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization } = req.query;
    
    const query = {};
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'email isActive')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

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

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'email isActive');
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'specialization', 'qualification',
      'experience', 'phoneNumber', 'consultationFee', 'bio', 'availability'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'email');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Doctor updated', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete/Deactivate doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Deactivate user account instead of deleting
    await User.findByIdAndUpdate(doctor.userId, { isActive: false });

    res.json({ success: true, message: 'Doctor deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set doctor availability
export const setDoctorAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Availability updated', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all appointments
export const getAppointments = async (req, res) => {
  try {
    const { date, doctorId, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (date) {
      const searchDate = new Date(date);
      query.appointmentDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59))
      };
    }
    
    if (doctorId) {
      query.doctorId = doctorId;
    }
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName phoneNumber')
      .populate('doctorId', 'firstName lastName specialization')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    const count = await Appointment.countDocuments(query);

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

// Get all patients
export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const patients = await Patient.find(query)
      .populate('userId', 'email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: patients,
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