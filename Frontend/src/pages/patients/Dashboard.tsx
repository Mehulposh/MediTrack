import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Overview from './Overview';
import Appointments from './Appointment';
import Doctors from './Doctor';
import VisitRecords from './VisitRecords';
import Profile from './PatientProfile';
import { Calendar, Users, FileText, User } from 'lucide-react';

const patientMenuItems = [
  { path: '', icon: Calendar, label: 'Dashboard' },
  { path: 'appointments', icon: Calendar, label: 'Appointments' },
  { path: 'doctors', icon: Users, label: 'Find Doctors' },
  { path: 'records', icon: FileText, label: 'Medical Records' },
  { path: 'profile', icon: User, label: 'Profile' },
];

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar menuItems={patientMenuItems} basePath="/patient" />
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="records" element={<VisitRecords />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}