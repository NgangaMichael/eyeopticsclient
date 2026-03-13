import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ContainerModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    name: '',
    createdBy: storedUser.username || '',
    supplierName: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        createdBy: initialData.createdBy || storedUser.username || '',
        supplierName: initialData.supplierName || '',
      });
    } else {
      setFormData({ name: '', createdBy: storedUser.username || '', supplierName: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">
            {mode === 'edit' ? 'Edit Container' : 'New Container'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Container Name</label>
            <input
              required
              disabled={isReadOnly}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              placeholder="e.g. January Shipment"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Supplier Name</label>
            <input
              required
              disabled={isReadOnly}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              placeholder="e.g. Nikon Essilor"
              value={formData.supplierName}
              onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Created By</label>
            <input
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-500 bg-slate-50"
              value={formData.createdBy}
            />
          </div>

          {!isReadOnly && (
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition-all mt-2"
            >
              {mode === 'edit' ? 'Save Changes' : 'Create Container'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContainerModal;