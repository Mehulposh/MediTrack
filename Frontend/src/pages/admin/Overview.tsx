import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/adminservice';
import Card from '../../components/Card';
import Loading from '../../components/Loader';

export default function Overview() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    monthAppointments: 0,
    totalAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your clinic operations from here</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          className="bg-linear-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-xl transition"
          onClick={() => navigate('/admin/patients')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold mt-1">{stats.totalPatients}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card 
          className="bg-linear-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-xl transition"
          onClick={() => navigate('/admin/doctors')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Doctors</p>
              <p className="text-3xl font-bold mt-1">{stats.totalDoctors}</p>
            </div>
            <UserCheck className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card 
          className="bg-linear-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-xl transition"
          onClick={() => navigate('/admin/appointments')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Today's Appointments</p>
              <p className="text-3xl font-bold mt-1">{stats.todayAppointments}</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">This Month</p>
              <p className="text-3xl font-bold mt-1">{stats.monthAppointments}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Appointment Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">Total Appointments</span>
              <span className="font-bold text-xl text-gray-800">{stats.totalAppointments}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">Today</span>
              <span className="font-bold text-xl text-purple-600">{stats.todayAppointments}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">Upcoming</span>
              <span className="font-bold text-xl text-blue-600">{stats.upcomingAppointments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">This Month</span>
              <span className="font-bold text-xl text-green-600">{stats.monthAppointments}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/doctors')}
              className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition font-medium"
            >
              👨‍⚕️ Add New Doctor
            </button>
            <button
              onClick={() => navigate('/admin/appointments')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition font-medium"
            >
              📅 View All Appointments
            </button>
            <button
              onClick={() => navigate('/admin/patients')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition font-medium"
            >
              👥 View All Patients
            </button>
            <button
              onClick={() => navigate('/admin/doctors')}
              className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition font-medium"
            >
              ⚙️ Manage Doctor Schedules
            </button>
          </div>
        </Card>
      </div>

      <Card className="bg-linear-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
            <p className="text-sm text-gray-600 mt-1">Registered Patients</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.totalDoctors}</p>
            <p className="text-sm text-gray-600 mt-1">Medical Staff</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{stats.totalAppointments}</p>
            <p className="text-sm text-gray-600 mt-1">Total Visits</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">{stats.upcomingAppointments}</p>
            <p className="text-sm text-gray-600 mt-1">Scheduled</p>
          </div>
        </div>
      </Card>
    </div>
  );
}