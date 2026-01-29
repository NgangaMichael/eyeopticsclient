import React, { useEffect, useState } from 'react';
import { X, UserPlus, MapPin } from 'lucide-react';

const PatientModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', gender: 'Other', address: ''
  });

  useEffect(() => {
    if (initialData) {
      // Format date for the input field (YYYY-MM-DD)
      const formattedData = { ...initialData };
      if (initialData.dob) formattedData.dob = initialData.dob.split('T')[0];
      setFormData(formattedData);
    } else {
      setFormData({ firstName: '', lastName: '', email: '', phone: '', dob: '', gender: 'Other', address: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-150">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-600" />
            {mode === 'edit' ? 'Update Patient' : mode === 'view' ? 'Patient Profile' : 'Register New Patient'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full shadow-sm transition-all"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name</label>
              <input required disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
              <input required disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
              <input required disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
              <select disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={formData.dob || ''}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>
            <div className="">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input type="email" disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <MapPin size={12} /> Address
              </label>
              <textarea rows="2" disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 resize-none"
                value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          {!isReadOnly && (
            <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2">
              {mode === 'edit' ? 'Update Profile' : 'Save Patient Record'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PatientModal;