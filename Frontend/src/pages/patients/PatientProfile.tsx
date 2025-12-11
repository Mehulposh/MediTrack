import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';
import { patientService } from '../../services/patientservice.ts';
import { useAuthStore } from '../../store/authstore.ts';
import type { Patient } from '../../types/index.ts';
import Card from '../../components/Card.tsx';
import Loading from '../../components/Loader.tsx';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
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
      const response = await patientService.getProfile();
      setPatient(response.data);
      
      reset({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        phoneNumber: response.data.phoneNumber,
        bloodGroup: response.data.bloodGroup || '',
        allergies: response.data.allergies?.join(', ') || '',
        street: response.data.address?.street || '',
        city: response.data.address?.city || '',
        state: response.data.address?.state || '',
        zipCode: response.data.address?.zipCode || '',
        emergencyContactName: response.data.emergencyContact?.name || '',
        emergencyContactRelationship: response.data.emergencyContact?.relationship || '',
        emergencyContactPhone: response.data.emergencyContact?.phoneNumber || '',
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
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        bloodGroup: data.bloodGroup || undefined,
        allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        address: {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
        },
        emergencyContact: {
          name: data.emergencyContactName || '',
          relationship: data.emergencyContactRelationship || '',
          phoneNumber: data.emergencyContactPhone || '',
        },
      };

      const response = await patientService.updateProfile(updateData);
      updateProfile(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-800">{patient?.fullName}</h3>
            <p className="text-gray-600 mt-1">{patient?.age} years old</p>
            <p className="text-sm text-gray-500 mt-2">{patient?.gender}</p>
            
            <div className="mt-6 space-y-2 text-left">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-800">
                  {patient?.dateOfBirth && new Date(patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              {patient?.bloodGroup && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Blood Group</p>
                  <p className="font-semibold text-red-800">{patient.bloodGroup}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    {...register('bloodGroup')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select blood group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies (comma separated)
              </label>
              <textarea
                {...register('allergies')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Penicillin, Peanuts, Shellfish"
              />
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Address</h3>
              <div className="space-y-4">
                <input
                  {...register('street')}
                  type="text"
                  placeholder="Street Address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    {...register('city')}
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <input
                    {...register('state')}
                    type="text"
                    placeholder="State"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <input
                    {...register('zipCode')}
                    type="text"
                    placeholder="ZIP Code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  {...register('emergencyContactName')}
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <input
                  {...register('emergencyContactRelationship')}
                  type="text"
                  placeholder="Relationship"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <input
                  {...register('emergencyContactPhone')}
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}