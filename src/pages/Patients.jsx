import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit3, Trash2, UserCircle } from 'lucide-react';
import PatientModal from '../components/PatientModal';
import { patientService } from "../api/services/patientService";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error("Failed to load patient records");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await patientService.updatePatient(modalState.data.id, formData);
      } else {
        await patientService.createPatient(formData);
      }
      closeModal();
      loadPatients();
    } catch (err) {
      alert("Error saving patient data.");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      try {
        await patientService.deletePatient(id);
        loadPatients();
      } catch (err) { console.error("Delete failed", err); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patients</h2>
          <p className="text-slate-500">Manage clinical records and contact information.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> Register Patient
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{patient.firstName} {patient.lastName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {patient.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-700">{patient.phone}</div>
                  <div className="text-xs text-slate-400 italic">{patient.email || 'No email provided'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                    {patient.gender || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal('view', patient)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                    <button onClick={() => openModal('edit', patient)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(patient.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatientModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        onSubmit={handleSubmit} 
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}