import mongoose from 'mongoose';

const visitSummarySchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms are required'],
    trim: true
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  vitalSigns: {
    bloodPressure: String,
    temperature: Number,
    heartRate: Number,
    weight: Number,
    height: Number
  },
  prescription: [{
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    instructions: String
  }],
  labTests: [{
    testName: String,
    notes: String
  }],
  notes: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
visitSummarySchema.index({ patientId: 1, createdAt: -1 });
visitSummarySchema.index({ doctorId: 1, createdAt: -1 });

const VisitSummary = mongoose.model('VisitSummary', visitSummarySchema);
export default VisitSummary;