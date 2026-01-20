import React, { useEffect, useState } from 'react';
import { X, Wallet, Tag, AlignLeft } from 'lucide-react';

const ExpenseModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    amount: '', 
    category: 'General', 
    note: '' 
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: '', amount: '', category: 'General', note: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">
            {mode === 'edit' ? 'Update Expense' : mode === 'view' ? 'Expense Review' : 'New Expense'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all shadow-sm"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          {/* Title Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
              <Tag size={14} className="text-indigo-500" /> Item Title
            </label>
            <input 
              disabled={isReadOnly}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Clinical Supplies"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                Amount (KSh)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">KSh</span>
                <input 
                  disabled={isReadOnly}
                  required type="number"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select 
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 appearance-none bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Inventory">Inventory</option>
                <option value="Rent">Rent</option>
                <option value="Salaries">Salaries</option>
                <option value="Utilities">Utilities</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
              <AlignLeft size={14} className="text-indigo-500" /> Additional Notes
            </label>
            <textarea 
              disabled={isReadOnly}
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 resize-none"
              value={formData.note || ''}
              onChange={e => setFormData({...formData, note: e.target.value})}
              placeholder="Add details about this transaction..."
            />
          </div>

          {!isReadOnly && (
            <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-2">
              <Wallet size={18} />
              {mode === 'edit' ? 'Confirm Update' : 'Record Expense'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;