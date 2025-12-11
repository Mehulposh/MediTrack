import { useEffect, useState } from 'react';
import { Calendar, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminservice';
import type { Appointment } from '../../types/index';
import Card from '../../components/Card';
import Loading from '../../components/Loader';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    loadAppointments();
    
    
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [filterStatus, filterDate, appointments]);

  const loadAppointments = async () => {
    try {
      const response = await adminService.getAppointments();
      console.log(response);
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(appt => appt.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter(appt => {
        const apptDate = format(new Date(appt.appointmentDate), 'yyyy-MM-dd');
        return apptDate === filterDate;
      });
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">All Appointments</h1>
        <p className="text-gray-600 mt-2">View and manage all clinic appointments</p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterDate('');
              }}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
        </Card>
        <Card className="bg-green-50">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'completed').length}
          </p>
        </Card>
        <Card className="bg-purple-50">
          <p className="text-sm text-gray-600">Scheduled</p>
          <p className="text-2xl font-bold text-purple-600">
            {appointments.filter(a => a.status === 'scheduled').length}
          </p>
        </Card>
        <Card className="bg-red-50">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">
            {appointments.filter(a => a.status === 'cancelled').length}
          </p>
        </Card>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const patient = appointment.patientId as any;
            const doctor = appointment.doctorId as any;
            
            return (
              <Card key={appointment._id} className="hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        ID: {appointment._id.slice(-8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Patient</p>
                        <p className="font-semibold text-gray-800">
                          {patient.fullName ||`${patient.firstName} ${patient.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600">{patient.phoneNumber}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Doctor</p>
                        <p className="font-semibold text-gray-800">
                          {doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      )}
                    </div>

                    {appointment.status === 'cancelled' && appointment.cancellationReason && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Cancellation Reason:</span> {appointment.cancellationReason}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Cancelled by: {appointment.cancelledBy}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}