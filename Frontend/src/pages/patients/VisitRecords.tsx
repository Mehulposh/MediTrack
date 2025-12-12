import { useEffect, useState } from 'react';
import { FileText, Calendar, User, Pill } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { patientService } from '../../services/patientservice.ts';
import type { VisitSummary } from '../../types/index.ts';
import Card from '../../components/Card.tsx';
import Loading from '../../components/Loader.tsx';
import Modal from '../../components/Modal.tsx';

export default function VisitRecords() {
  const [visitSummaries, setVisitSummaries] = useState<VisitSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<VisitSummary | null>(null);

  useEffect(() => {
    loadVisitSummaries();
  }, []);

  const loadVisitSummaries = async () => {
    try {
      const response = await patientService.getVisitSummaries();
      setVisitSummaries(response.data);
    } catch (error) {
      toast.error('Failed to load visit records');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
        <p className="text-gray-600 mt-2">View your visit history and prescriptions</p>
      </div>

      {visitSummaries.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No medical records found</p>
            <p className="text-sm text-gray-400 mt-2">
              Your visit summaries will appear here after your appointments
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {visitSummaries.map((visit) => {
            const doctor = visit.doctorId as any;
            // const appointment = visit.appointmentId as string;
            
            return (
              <Card
                key={visit._id}
                className="hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedVisit(visit)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`}
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{format(new Date(visit.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Diagnosis:</span> {visit.diagnosis}
                      </div>
                      <div>
                        <span className="font-medium">Medicines:</span> {visit.prescription.length} prescribed
                      </div>
                    </div>
                  </div>

                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    View Details →
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={selectedVisit !== null}
        onClose={() => setSelectedVisit(null)}
        title="Visit Summary"
        size="lg"
      >
        {selectedVisit && (
          <div className="space-y-6">
            <div className="pb-4 border-b">
              {(() => {
                const doctor = selectedVisit.doctorId as any;
                return (
                  <>
                    <h3 className="font-bold text-lg text-gray-800">
                      {doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`}
                    </h3>
                    <p className="text-blue-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(selectedVisit.createdAt), 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </>
                );
              })()}
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Symptoms</h4>
              <p className="text-gray-700">{selectedVisit.symptoms}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
              <p className="text-gray-700">{selectedVisit.diagnosis}</p>
            </div>

            {selectedVisit.vitalSigns && Object.keys(selectedVisit.vitalSigns).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedVisit.vitalSigns.bloodPressure && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Blood Pressure</p>
                      <p className="font-semibold text-gray-800">{selectedVisit.vitalSigns.bloodPressure}</p>
                    </div>
                  )}
                  {selectedVisit.vitalSigns.temperature && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Temperature</p>
                      <p className="font-semibold text-gray-800">{selectedVisit.vitalSigns.temperature}°F</p>
                    </div>
                  )}
                  {selectedVisit.vitalSigns.heartRate && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Heart Rate</p>
                      <p className="font-semibold text-gray-800">{selectedVisit.vitalSigns.heartRate} bpm</p>
                    </div>
                  )}
                  {selectedVisit.vitalSigns.weight && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Weight</p>
                      <p className="font-semibold text-gray-800">{selectedVisit.vitalSigns.weight} kg</p>
                    </div>
                  )}
                  {selectedVisit.vitalSigns.height && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Height</p>
                      <p className="font-semibold text-gray-800">{selectedVisit.vitalSigns.height} cm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                Prescription
              </h4>
              {selectedVisit.prescription.length === 0 ? (
                <p className="text-gray-500 text-sm">No medicines prescribed</p>
              ) : (
                <div className="space-y-3">
                  {selectedVisit.prescription.map((med, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-800">{med.medicineName}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-700">
                        <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                        <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                        <p><span className="font-medium">Duration:</span> {med.duration}</p>
                      </div>
                      {med.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Instructions:</span> {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedVisit.labTests && selectedVisit.labTests.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Lab Tests</h4>
                <div className="space-y-2">
                  {selectedVisit.labTests.map((test, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-800">{test.testName}</p>
                      {test.notes && <p className="text-sm text-gray-600 mt-1">{test.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedVisit.notes && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Additional Notes</h4>
                <p className="text-gray-700">{selectedVisit.notes}</p>
              </div>
            )}

            {selectedVisit.followUpDate && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-1">Follow-up Required</h4>
                <p className="text-gray-700">
                  Next visit: {format(new Date(selectedVisit.followUpDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}