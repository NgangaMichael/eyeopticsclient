import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, MapPin, Tag } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    name: '', type: 'patient', email: '', phone: '', address: ''
  });

  useEffect(() => {
    if (initialData) setFormData({ ...initialData });
    else setFormData({ name: '', type: 'patient', email: '', phone: '', address: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User size={20} className="text-indigo-600" />
            {mode === 'edit' ? 'Update Customer' : mode === 'view' ? 'Customer Details' : 'Add New Customer'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
               <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Full Name / Entity</label>
               <input required disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Customer Type</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 text-slate-400" size={16} />
                <select disabled={isReadOnly} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-slate-50"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="patient">Patient</option>
                  <option value="company">Company</option>
                  <option value="outlet">Outlet</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="email" disabled={isReadOnly} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                  value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="tel" required disabled={isReadOnly} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                  value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
              <textarea disabled={isReadOnly} rows={2} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          {!isReadOnly && (
            <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
              {mode === 'edit' ? 'Save Changes' : 'Register Customer'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;