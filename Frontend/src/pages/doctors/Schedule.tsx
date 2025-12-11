import { useEffect, useState } from 'react';
import { Calendar, User, Plus, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { doctorService } from '../../services/doctorservice';
import type { Appointment , VisitSummary} from '../../types/index.ts';
import Card from '../../components/Card.tsx';
import Loading from '../../components/Loader.tsx';
import Modal from '../../components/Modal.tsx';

export default function Schedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visitModal, setVisitModal] = useState<{ show: boolean; appointment: Appointment | null }>({
    show: false,
    appointment: null,
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await doctorService.getTodaySchedule();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVisitSummary = async (data: any) => {
    if (!visitModal.appointment) return;

    try {
      const visitData = {
        appointmentId: visitModal.appointment._id,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        vitalSigns: {
          bloodPressure: data.bloodPressure,
          temperature: data.temperature ? parseFloat(data.temperature) : undefined,
          heartRate: data.heartRate ? parseInt(data.heartRate) : undefined,
        },
        prescription: data.medicines ? JSON.parse(data.medicines) : [],
        notes: data.notes,
        followUpDate: data.followUpDate || undefined,
      };

      await doctorService.addVisitSummary(visitData);
      toast.success('Visit summary added successfully!');
      setVisitModal({ show: false, appointment: null });
      reset();
      loadSchedule();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add visit summary');
    }
  };

  const handleMarkNoShow = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to mark this appointment as no-show?')) return;

    try {
      await doctorService.markNoShow(appointmentId);
      toast.success('Marked as no-show');
      loadSchedule();
    } catch (error) {
      toast.error('Failed to mark as no-show');
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Today's Schedule</h1>
        <p className="text-gray-600 mt-2">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments for today</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const patient = appointment.patientId as any;
            return (
              <Card key={appointment._id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {patient.age} years • {patient.gender} • {patient.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">
                      {appointment.appointmentTime}
                    </span>
                    <p className={`text-sm mt-1 ${
                      appointment.status === 'scheduled' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {appointment.status}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                  </p>
                  {patient.allergies && patient.allergies.length > 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      <span className="font-medium">Allergies:</span> {patient.allergies.join(', ')}
                    </p>
                  )}
                </div>

                {appointment.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVisitModal({ show: true, appointment })}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Visit Summary
                    </button>
                    <button
                      onClick={() => handleMarkNoShow(appointment._id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      No-Show
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={visitModal.show}
        onClose={() => {
          setVisitModal({ show: false, appointment: null });
          reset();
        }}
        title="Add Visit Summary"
        size="lg"
      >
        {visitModal.appointment && (
          <form onSubmit={handleSubmit(handleAddVisitSummary)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
              <textarea
                {...register('symptoms')}
                required
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe patient's symptoms..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
              <textarea
                {...register('diagnosis')}
                required
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter diagnosis..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                <input
                  {...register('bloodPressure')}
                  type="text"
                  placeholder="120/80"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°F)</label>
                <input
                  {...register('temperature')}
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                <input
                  {...register('heartRate')}
                  type="number"
                  placeholder="72"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription (JSON format)
              </label>
              <textarea
                {...register('medicines')}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder='[{"medicineName":"Paracetamol","dosage":"500mg","frequency":"3 times daily","duration":"5 days"}]'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
              <input
                {...register('followUpDate')}
                type="date"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              Save Visit Summary
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}