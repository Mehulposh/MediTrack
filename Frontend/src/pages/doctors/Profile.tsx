import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Save, Star } from 'lucide-react';
import { doctorService } from '../../services/doctorservice.ts';
import { useAuthStore } from '../../store/authstore.ts';
import type { Doctor } from '../../types/index.ts';
import Card from '../../components/Card.tsx';
import Loading from '../../components/Loader.tsx';

const profileSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  consultationFee: z.string().min(1, 'Consultation fee is required'),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const { updateProfile } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await doctorService.getProfile();
      setDoctor(response.data);
      
      reset({
        phoneNumber: response.data.phoneNumber,
        consultationFee: response.data.consultationFee.toString(),
        bio: response.data.bio || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const updateData = {
        phoneNumber: data.phoneNumber,
        consultationFee: parseFloat(data.consultationFee),
        bio: data.bio || '',
      };

      const response = await doctorService.updateProfile(updateData);
      updateProfile(response.data);
      setDoctor(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!doctor) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your professional information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-800">{doctor.fullName}</h3>
            <p className="text-green-600 font-medium mt-1">{doctor.specialization}</p>
            
            <div className="mt-4 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg">{doctor.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({doctor.totalReviews} reviews)</span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg text-left">
                <p className="text-xs text-gray-600">Qualification</p>
                <p className="font-semibold text-gray-800">{doctor.qualification}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-left">
                <p className="text-xs text-gray-600">Experience</p>
                <p className="font-semibold text-gray-800">{doctor.experience} years</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-left">
                <p className="text-xs text-gray-600">License Number</p>
                <p className="font-semibold text-gray-800 text-sm">{doctor.licenseNumber}</p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-left">
                <p className="text-xs text-gray-600">Consultation Fee</p>
                <p className="font-semibold text-green-800 text-lg">₹{doctor.consultationFee}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Professional Information</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={doctor.firstName}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={doctor.lastName}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={doctor.specialization}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={doctor.qualification}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic mb-4">
                * Contact administrator to update name, specialization, or qualification
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Editable Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee (₹)
                  </label>
                  <input
                    {...register('consultationFee')}
                    type="number"
                    min="0"
                    step="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                  {errors.consultationFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / About
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Write a brief introduction about yourself and your practice..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Card>
      </div>

      {doctor.availability && doctor.availability.length > 0 && (
        <Card className="mt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Availability Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctor.availability.map((avail, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-800 capitalize mb-2">{avail.day}</p>
                {avail.slots.length > 0 ? (
                  <div className="space-y-1">
                    {avail.slots.map((slot, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                        {!slot.isAvailable && ' (Unavailable)'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not available</p>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Contact administrator to update your availability schedule
          </p>
        </Card>
      )}
    </div>
  );
}