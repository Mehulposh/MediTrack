import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../services/adminservice';
import type { Doctor } from '../../types/index.tsx';
import Card from '../../components/Card';
import Loading from '../../components/Loader';
import Modal from '../../components/Modal';

const doctorSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  specialization: z.string().min(2, 'Specialization required'),
  qualification: z.string().min(2, 'Qualification required'),
  experience: z.coerce.number().min(0, 'Experience must be >= 0'),
  licenseNumber: z.string().min(3, 'License number required'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  consultationFee: z.coerce.number().min(0, 'Fee must be >= 0'),
  bio: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema) as Resolver<DoctorFormData, any>,
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = doctors.filter((doc) =>
        doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchTerm, doctors]);

  const loadDoctors = async () => {
    try {
      const response = await adminService.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDoctor: SubmitHandler<DoctorFormData> = async (data) => {
    try {
      await adminService.addDoctor(data);
      toast.success('Doctor added successfully!');
      setAddModal(false);
      reset();
      loadDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      await adminService.deleteDoctor(id);
      toast.success('Doctor deactivated successfully');
      loadDoctors();
    } catch (error) {
      toast.error('Failed to deactivate doctor');
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
          <p className="text-gray-600 mt-2">Add, edit, or remove doctors from the system</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Add Doctor
        </button>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
        </div>
      </Card>

      {filteredDoctors.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No doctors found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor._id} className="hover:shadow-xl transition">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">
                    {doctor.firstName[0]}{doctor.lastName[0]}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-800">{doctor.fullName}</h3>
                <p className="text-green-600 font-medium">{doctor.specialization}</p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">Qualification:</span> {doctor.qualification}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Experience:</span> {doctor.experience} years
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">License:</span> {doctor.licenseNumber}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Fee:</span> ₹{doctor.consultationFee}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {doctor.phoneNumber}
                </p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({doctor.totalReviews})</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDoctor(doctor._id, doctor.fullName)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => {
          setAddModal(false);
          reset();
        }}
        title="Add New Doctor"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleAddDoctor)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                {...register('firstName')}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
              <input
                {...register('specialization')}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.specialization && <p className="text-sm text-red-600 mt-1">{errors.specialization.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualification *</label>
              <input
                {...register('qualification')}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.qualification && <p className="text-sm text-red-600 mt-1">{errors.qualification.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
              <input
                {...register('experience')}
                type="number"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
              <input
                {...register('licenseNumber')}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{errors.licenseNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fee (₹) *</label>
              <input
                {...register('consultationFee')}
                type="number"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.consultationFee && <p className="text-sm text-red-600 mt-1">{errors.consultationFee.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              {...register('phoneNumber')}
              type="tel"
              maxLength={10}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
          >
            Add Doctor
          </button>
        </form>
      </Modal>
    </div>
  );
}