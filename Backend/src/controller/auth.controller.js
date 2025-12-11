import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';


// Register Patient
export const registerPatient = async (req, res) => {
  console.log(req.body);
  
  try {
    const { email, password, firstName, lastName, dateOfBirth, gender, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      email,
      password,
      role: 'patient'
    });

    const patient = await Patient.create({
      userId: user._id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber
    });

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        patient: {
          id: patient._id,
          fullName: patient.fullName
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password }); // raw input

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } 

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    let profileData = null;
    if (user.role === 'patient') {
      profileData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        profile: profileData,
        token,
        refreshToken
      }
    });
  } catch (error) {
     console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    let profileData = null;
    if (user.role === 'patient') {
      profileData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        profile: profileData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};