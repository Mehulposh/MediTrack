import { useEffect, useState } from 'react';
import { Search, Users, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminservice';
import type { Patient } from '../../types/index';
import Card from '../../components/Card';
import Loading from '../../components/Loader';
import Modal from '../../components/Modal';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter((patient) =>
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const response = await adminService.getPatients();
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">All Patients</h1>
        <p className="text-gray-600 mt-2">View registered patient information</p>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </Card>

      <div className="mb-6">
        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registered Patients</p>
              <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>
      </div>

      {filteredPatients.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No patients found matching your search' : 'No patients registered yet'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card 
              key={patient._id} 
              className="hover:shadow-xl transition cursor-pointer"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-800">
                  {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                </h3>
                <p className="text-gray-600 text-sm">{patient.age} years • {patient.gender}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  <span>{patient.phoneNumber}</span>
                </div>
                {patient.bloodGroup && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Blood Group:</span>
                    <span className="text-red-600 font-semibold">{patient.bloodGroup}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {format(new Date(patient.dateOfBirth), 'MMM yyyy')}</span>
                </div>
              </div>

              {patient.allergies && patient.allergies.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ Allergies: {patient.allergies.slice(0, 2).join(', ')}
                    {patient.allergies.length > 2 && ` +${patient.allergies.length - 2} more`}
                  </p>
                </div>
              )}

              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition text-sm font-semibold">
                View Details
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={selectedPatient !== null}
        onClose={() => setSelectedPatient(null)}
        title="Patient Details"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">
                    {selectedPatient.fullName || `${selectedPatient.firstName} ${selectedPatient.lastName}`}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {selectedPatient.age} years • {selectedPatient.gender}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{selectedPatient.phoneNumber}</p>
                </div>
                {selectedPatient.bloodGroup && (
                  <div className="bg-red-100 px-4 py-2 rounded-lg">
                    <p className="text-xs text-red-600">Blood Group</p>
                    <p className="text-xl font-bold text-red-800">{selectedPatient.bloodGroup}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-800">
                  {format(new Date(selectedPatient.dateOfBirth), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-semibold text-gray-800 capitalize">{selectedPatient.gender}</p>
              </div>
            </div>

            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold text-red-800 mb-2">⚠️ Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedPatient.address && (
              <div>
                <p className="text-sm text-gray-600 mb-2 font-semibold">Address</p>
                <p className="text-gray-800">
                  {[
                    selectedPatient.address.street,
                    selectedPatient.address.city,
                    selectedPatient.address.state,
                    selectedPatient.address.zipCode,
                    selectedPatient.address.country
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {selectedPatient.emergencyContact && selectedPatient.emergencyContact.name && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">Emergency Contact</p>
                <p className="text-gray-700 font-medium">{selectedPatient.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedPatient.emergencyContact.relationship}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedPatient.emergencyContact.phoneNumber}
                </p>
              </div>
            )}

            {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2 font-semibold">Medical History</p>
                <div className="space-y-2">
                  {selectedPatient.medicalHistory.map((history, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-800">{history.condition}</p>
                      {history.diagnosedDate && (
                        <p className="text-sm text-gray-600">
                          Diagnosed: {format(new Date(history.diagnosedDate), 'MMM yyyy')}
                        </p>
                      )}
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}