import { useEffect, useState } from 'react';
import { Search, Users, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { doctorService } from '../../services/doctorservice.ts';
import type { Appointment, Patient, VisitSummary } from '../../types/index.ts';
import Card from '../../components/Card';
import Loading from '../../components/Loader';
import Modal from '../../components/Modal';

export default function Patients() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [patientModal, setPatientModal] = useState<{
    show: boolean;
    patient: Patient | null;
    visitHistory: VisitSummary[];
  }>({
    show: false,
    patient: null,
    visitHistory: [],
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = appointments.filter((appt) => {
        const patient = appt.patientId as any;
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [searchTerm, appointments]);

  const loadAppointments = async () => {
    try {
      const response = await doctorService.getAppointments();
      // Get unique patients from appointments
      const uniqueAppointments = response.data.reduce((acc: Appointment[], current) => {
        const patient = current.patientId as any;
        const exists = acc.find(appt => {
          const p = appt.patientId as any;
          return p._id === patient._id;
        });
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      setAppointments(uniqueAppointments);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPatient = async (patientId: string) => {
    try {
      const response = await doctorService.getPatientDetails(patientId);
      setPatientModal({
        show: true,
        patient: response.data.patient,
        visitHistory: response.data.visitHistory,
      });
    } catch (error) {
      toast.error('Failed to load patient details');
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
        <p className="text-gray-600 mt-2">View patient information and history</p>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </Card>

      {filteredAppointments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No patients found matching your search' : 'No patients yet'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => {
            const patient = appointment.patientId as any;
            return (
              <Card 
                key={appointment._id} 
                className="hover:shadow-xl transition cursor-pointer"
                onClick={() => handleViewPatient(patient._id)}
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
                    <span className="font-medium">Phone:</span>
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
                    <span>Last Visit: {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Allergies: {patient.allergies.join(', ')}
                    </p>
                  </div>
                )}

                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition text-sm font-semibold">
                  View Full History
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={patientModal.show}
        onClose={() => setPatientModal({ show: false, patient: null, visitHistory: [] })}
        title="Patient Details & History"
        size="xl"
      >
        {patientModal.patient && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">
                    {patientModal.patient.fullName}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {patientModal.patient.age} years • {patientModal.patient.gender}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{patientModal.patient.phoneNumber}</p>
                </div>
                {patientModal.patient.bloodGroup && (
                  <div className="bg-red-100 px-4 py-2 rounded-lg">
                    <p className="text-xs text-red-600">Blood Group</p>
                    <p className="text-xl font-bold text-red-800">{patientModal.patient.bloodGroup}</p>
                  </div>
                )}
              </div>
            </div>

            {patientModal.patient.allergies && patientModal.patient.allergies.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold text-red-800 mb-2">⚠️ Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {patientModal.patient.allergies.map((allergy, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visit History */}
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Visit History ({patientModal.visitHistory.length})
              </h4>

              {patientModal.visitHistory.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No previous visits</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {patientModal.visitHistory.map((visit) => (
                    <div key={visit._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {format(new Date(visit.createdAt), 'MMMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Diagnosis:</span> {visit.diagnosis}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Symptoms:</span> {visit.symptoms}
                        </p>

                        {visit.prescription.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Prescription:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                              {visit.prescription.map((med, index) => (
                                <li key={index}>
                                  {med.medicineName} - {med.dosage} ({med.frequency})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {visit.notes && (
                          <p className="text-gray-700">
                            <span className="font-medium">Notes:</span> {visit.notes}
                          </p>
                        )}

                        {visit.followUpDate && (
                          <p className="text-blue-600">
                            <span className="font-medium">Follow-up:</span>{' '}
                            {format(new Date(visit.followUpDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}