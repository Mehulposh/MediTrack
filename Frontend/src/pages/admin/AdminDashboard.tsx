import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Overview from './Overview';
import Doctors from './Doctor';
import Appointments from './Appontment';
import Patients from './Patients';
import { LayoutDashboard, Users, Calendar, UserCheck } from 'lucide-react';

const adminMenuItems = [
  { path: '', icon: LayoutDashboard, label: 'Dashboard' },
  { path: 'doctors', icon: UserCheck, label: 'Manage Doctors' },
  { path: 'appointments', icon: Calendar, label: 'Appointments' },
  { path: 'patients', icon: Users, label: 'Patients' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar menuItems={adminMenuItems} basePath="/admin" />
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}