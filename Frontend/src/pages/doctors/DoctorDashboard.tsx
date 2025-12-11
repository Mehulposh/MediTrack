import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Overview from './Overview';
import Schedule from './Schedule';
import Patients from './Patients.tsx';
import Profile from './Profile.tsx';
import { Calendar, Users, User, Clock } from 'lucide-react';

const doctorMenuItems = [
  { path: '', icon: Calendar, label: 'Dashboard' },
  { path: 'schedule', icon: Clock, label: 'Today\'s Schedule' },
  { path: 'patients', icon: Users, label: 'Patients' },
  { path: 'profile', icon: User, label: 'Profile' },
];

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar menuItems={doctorMenuItems} basePath="/doctor" />
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="patients" element={<Patients />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}