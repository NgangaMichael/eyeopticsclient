import React, { useEffect, useState } from 'react';
import { X, UserCheck, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify'; // <-- Add this line

const UserModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', designation: '', password: '' // Added phone
  });

  useEffect(() => {
    // Reset or populate data including phone
    if (initialData) setFormData({ ...initialData, password: '' });
    else setFormData({ username: '', email: '', phone: '', designation: '', password: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck size={20} className="text-indigo-600" />
            {mode === 'edit' ? 'Update Staff Account' : mode === 'view' ? 'User Details' : 'Register New Staff'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if ((mode === 'add' || (mode === 'edit' && formData.password)) && formData.password.length < 6) {
              toast.error("Password must be at least 6 characters long");
              return;
            }
            onSubmit(formData);
          }}
          className="p-6 space-y-5"
        >
          {/* Row 1: Username */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Username</label>
            <input required disabled={isReadOnly} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>

          {/* Row 2: Email and Phone Number (Flexible Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="email" required disabled={isReadOnly} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Phone Number</label>
              <input 
                type="tel" 
                required 
                disabled={isReadOnly} 
                placeholder="e.g. +254..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                value={formData.phone || ''} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>

          {/* Row 3: Designation */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Designation</label>
            <select
              disabled={isReadOnly}
              required
              value={formData.designation || ''}
              onChange={e => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-slate-50"
            >
              <option value="" disabled>Select designation</option>
              <option value="Optician">Optician</option>
              <option value="Accountant">Accountant</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Row 4: Password (Optional in Edit) */}
          {(mode === 'add' || mode === 'edit') && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                {mode === 'edit' ? 'New Password (Leave blank to keep current)' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            </div>
          )}

          {!isReadOnly && (
            <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              {mode === 'edit' ? 'Save Changes' : 'Create Account'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserModal;