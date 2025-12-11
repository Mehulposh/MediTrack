import { useEffect, useState } from 'react';
import { Search, Star, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { patientService } from '../../services/patientservice';
import type { Doctor } from '../../types/index';
import Card from '../../components/Card';
import Loading from '../../components/Loader';
import Modal from '../../components/Modal';

const bookingSchema = z.object({
  appointmentDate: z.string().min(1, 'Date is required'),
  appointmentTime: z.string().min(1, 'Time is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState<{ show: boolean; doctor: Doctor | null }>({
    show: false,
    doctor: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    loadDoctors();
  }, [specialization]);

  const loadDoctors = async () => {
    try {
      const response = await patientService.getDoctors({
        specialization: specialization || undefined,
      });
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookAppointment = async (data: BookingFormData) => {
    if (!bookingModal.doctor) return;

    try {
      await patientService.bookAppointment({
        doctorId: bookingModal.doctor._id,
        ...data,
      });
      toast.success('Appointment booked successfully!');
      setBookingModal({ show: false, doctor: null });
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const specializations = [
    'All Specializations',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'General Medicine',
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Doctors</h1>
        <p className="text-gray-600 mt-2">Browse and book appointments with our specialists</p>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value === 'All Specializations' ? '' : e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filteredDoctors.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No doctors found matching your criteria</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor._id} className="hover:shadow-xl transition">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    {doctor.firstName[0]}{doctor.lastName[0]}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-800">{doctor.fullName}</h3>
                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Qualification:</span> {doctor.qualification}
                </p>
                <p>
                  <span className="font-medium">Experience:</span> {doctor.experience} years
                </p>
                <p>
                  <span className="font-medium">Consultation Fee:</span> ₹{doctor.consultationFee}
                </p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({doctor.totalReviews} reviews)</span>
                </div>
              </div>

              {doctor.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doctor.bio}</p>
              )}

              <button
                onClick={() => setBookingModal({ show: true, doctor })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={bookingModal.show}
        onClose={() => {
          setBookingModal({ show: false, doctor: null });
          reset();
        }}
        title="Book Appointment"
      >
        {bookingModal.doctor && (
          <div>
            <div className="mb-6 pb-4 border-b">
              <h3 className="font-bold text-lg text-gray-800">{bookingModal.doctor.fullName}</h3>
              <p className="text-blue-600">{bookingModal.doctor.specialization}</p>
              <p className="text-sm text-gray-600 mt-1">
                Consultation Fee: ₹{bookingModal.doctor.consultationFee}
              </p>
            </div>

            <form onSubmit={handleSubmit(handleBookAppointment)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date
                </label>
                <input
                  {...register('appointmentDate')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {errors.appointmentDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time
                </label>
                <input
                  {...register('appointmentTime')}
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {errors.appointmentTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  {...register('reason')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Describe your symptoms or reason for visit..."
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingModal({ show: false, doctor: null });
                    reset();
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}