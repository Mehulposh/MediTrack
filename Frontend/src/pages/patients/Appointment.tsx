import { useEffect, useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { patientService } from '../../services/patientservice';
import type { Appointment } from '../../types/index';
import Card from '../../components/Card';
import Loading from '../../components/Loader';
import Modal from '../../components/Modal';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [cancelModal, setCancelModal] = useState<{ show: boolean; appointmentId: string | null }>({
    show: false,
    appointmentId: null,
  });
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter((a) => a.status === filter));
    }
  }, [filter, appointments]);

  const loadAppointments = async () => {
    try {
      const response = await patientService.getAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelModal.appointmentId || !cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await patientService.cancelAppointment(cancelModal.appointmentId, cancellationReason);
      toast.success('Appointment cancelled successfully');
      setCancelModal({ show: false, appointmentId: null });
      setCancellationReason('');
      loadAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelAppointment = (appointment: Appointment) => {
    if (appointment.status !== 'scheduled') return false;
    
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const [hours, minutes] = appointment.appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const hoursUntilAppointment = (appointmentDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilAppointment >= 2;
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
        <p className="text-gray-600 mt-2">View and manage your appointments</p>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {filteredAppointments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} appointments found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const doctor = appointment.doctorId as any;
            return (
              <Card key={appointment._id} className="hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{doctor.specialization}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      )}
                    </div>

                    {appointment.status === 'cancelled' && appointment.cancellationReason && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Cancellation Reason:</span> {appointment.cancellationReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {canCancelAppointment(appointment) && (
                    <button
                      onClick={() => setCancelModal({ show: true, appointmentId: appointment._id })}
                      className="ml-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={cancelModal.show}
        onClose={() => {
          setCancelModal({ show: false, appointmentId: null });
          setCancellationReason('');
        }}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for cancelling this appointment. Note that you can only cancel appointments at least 2 hours before the scheduled time.
          </p>
          
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            rows={4}
            placeholder="Enter reason for cancellation..."
          />

          <div className="flex gap-3">
            <button
              onClick={handleCancelAppointment}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Confirm Cancellation
            </button>
            <button
              onClick={() => {
                setCancelModal({ show: false, appointmentId: null });
                setCancellationReason('');
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            >
              Keep Appointment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}