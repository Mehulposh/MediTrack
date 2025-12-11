import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { doctorService } from '../../services/doctorservice.ts';
import type { Appointment } from '../../types/index.ts';
import Card from '../../components/Card.tsx';
import Loading from '../../components/Loader.tsx';
import { format } from 'date-fns';

export default function Overview() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    completed: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const todayRes = await doctorService.getTodaySchedule();
      setTodayAppointments(todayRes.data);
      
      const allRes = await doctorService.getAppointments();
      const completed = allRes.data.filter(a => a.status === 'completed').length;
      
      setStats({
        today: todayRes.data.length,
        completed,
        total: allRes.data.length,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Appointments</p>
              <p className="text-3xl font-bold mt-1">{stats.today}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Next Patient</p>
              <p className="text-lg font-bold mt-1">
                {todayAppointments[0]?.appointmentTime || 'None'}
              </p>
            </div>
            <Clock className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Today's Schedule</h2>
        {todayAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => {
              const patient = appointment.patientId as any;
              return (
                <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {patient.age} years • {patient.gender}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">
                        {appointment.appointmentTime}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(appointment.appointmentDate), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}