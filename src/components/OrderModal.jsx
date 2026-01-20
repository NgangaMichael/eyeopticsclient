import React, { useEffect, useState } from 'react';
import { X, Truck, Layers } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    supplierName: '', lensType: 'single', material: 'plastic', 
    quantityOrdered: 0, landedCost: 0, status: 'pending'
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ supplierName: '', lensType: 'single', material: 'plastic', quantityOrdered: 0, landedCost: 0, status: 'pending' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck size={20} className="text-indigo-600" />
            {mode === 'edit' ? 'Update Order' : mode === 'view' ? 'Order Details' : 'Place New Order'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplier Name</label>
              <input required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lens Type</label>
              <select disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                value={formData.lensType} onChange={e => setFormData({...formData, lensType: e.target.value})}>
                <option value="single">Single Vision</option>
                <option value="progressive">Progressive</option>
                <option value="bifocal">Bifocal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Material</label>
              <input required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qty Ordered</label>
              <input type="number" required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={formData.quantityOrdered} onChange={e => setFormData({...formData, quantityOrdered: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Landed Cost (KSh)</label>
              <input type="number" required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={formData.landedCost} onChange={e => setFormData({...formData, landedCost: e.target.value})} />
            </div>
          </div>

          {!isReadOnly && (
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Package size={18} /> {mode === 'edit' ? 'Update Order' : 'Submit Order'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrderModal;