import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, TrendingUp } from 'lucide-react';
import { patientService } from '../../services/patientservice';
import type { Appointment } from '../../types/index';
import Card from '../../components/Card';
import Loading from '../../components/Loader';
import { format } from 'date-fns';

export default function Overview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [upcomingRes, allRes] = await Promise.all([
        patientService.getAppointments({ upcoming: true }),
        patientService.getAppointments(),
      ]);

      setAppointments(upcomingRes.data.slice(0, 3));
      
      const completed = allRes.data.filter(a => a.status === 'completed').length;
      setStats({
        upcoming: upcomingRes.data.length,
        completed,
        total: allRes.data.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your health overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Upcoming</p>
              <p className="text-3xl font-bold mt-1">{stats.upcoming}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1">{stats.completed}</p>
            </div>
            <FileText className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Visits</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card 
          className="bg-linear-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate('/patient/doctors')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Book Now</p>
              <p className="text-lg font-bold mt-1">Find Doctors</p>
            </div>
            <Clock className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            View All
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming appointments</p>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const doctor = appointment.doctorId as any;
              return (
                <div
                  key={appointment._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate('/patient/appointments')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.appointmentTime}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/patient/doctors')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg hover:shadow-md transition"
            >
              📅 Book New Appointment
            </button>
            <button
              onClick={() => navigate('/patient/records')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg hover:shadow-md transition"
            >
              📋 View Medical Records
            </button>
            <button
              onClick={() => navigate('/patient/profile')}
              className="w-full text-left px-4 py-3 bg-white rounded-lg hover:shadow-md transition"
            >
              👤 Update Profile
            </button>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <h3 className="font-semibold text-gray-800 mb-3">Health Tips</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>💧 Stay hydrated - Drink at least 8 glasses of water daily</p>
            <p>🏃 Exercise regularly - 30 minutes of activity per day</p>
            <p>😴 Get adequate sleep - 7-9 hours each night</p>
            <p>🥗 Eat balanced meals - Include fruits and vegetables</p>
          </div>
        </Card>
      </div>
    </div>
  );
}