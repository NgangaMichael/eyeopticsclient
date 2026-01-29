import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Eye, Edit3, Trash2, Search, Calendar, Users } from 'lucide-react';
import PatientModal from '../components/PatientModal';
import { patientService } from "../api/services/patientService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error("Failed to load patient records");
      toast.error("Failed to load patients");
    }
  };

  // Filter Logic
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Name or Phone Search
      const matchesSearch = 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone && p.phone.includes(searchTerm));

      // Date Range (using createdAt)
      const createdAt = new Date(p.createdAt).getTime();
      const fromOk = dateFrom ? createdAt >= new Date(dateFrom).getTime() : true;
      const toOk = dateTo ? createdAt <= new Date(dateTo).setHours(23, 59, 59, 999) : true;

      // Gender
      const matchesGender = genderFilter === 'all' || p.gender?.toLowerCase() === genderFilter.toLowerCase();

      return matchesSearch && fromOk && toOk && matchesGender;
    });
  }, [patients, searchTerm, dateFrom, dateTo, genderFilter]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await patientService.updatePatient(modalState.data.id, formData);
        toast.success(`Patient updated successfully`);
      } else {
        await patientService.createPatient(formData);
        toast.success(`Patient registered successfully`);
      }
      closeModal();
      loadPatients();
    } catch (err) {
      toast.error("Failed to save/update Patient");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      try {
        await patientService.deletePatient(id);
        loadPatients();
        toast.success("Patient deleted successfully");
      } catch (err) { 
        toast.error("Failed to delete patient");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patients</h2>
          <p className="text-slate-500">Manage clinical records and contact information.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={16} /> Register Patient
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm items-center">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Name or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date From */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">From</span>
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">To</span>
        </div>

        {/* Gender Filter */}
        <div className="relative">
          <Users className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none transition-all"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">Gender</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setSearchTerm('');
            setDateFrom('');
            setDateTo('');
            setGenderFilter('all');
          }}
          className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-tight text-center"
        >
          Reset
        </button>
      </div>

      {/* Table Section */}
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
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{patient.firstName} {patient.lastName}</span>
                        {patient.dob && (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            Age: {calculateAge(patient.dob)} yrs
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700">{patient.phone}</div>
                    <div className="text-xs text-slate-400 italic">{patient.email || 'No email provided'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      patient.gender?.toLowerCase() === 'male' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      patient.gender?.toLowerCase() === 'female' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {patient.gender || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal('view', patient)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                      <button onClick={() => openModal('edit', patient)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(patient.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No patient records found matching your criteria.
                </td>
              </tr>
            )}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}