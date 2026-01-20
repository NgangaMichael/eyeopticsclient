import React, { useEffect, useState } from 'react';
import { X, Box, Tag, DollarSign } from 'lucide-react';

const StockModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    itemType: 'frame', brand: '', model: '', material: '',
    color: '', size: '', type: '', coating: '', quantity: 0, price: 0
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ itemType: 'frame', brand: '', model: '', material: '', color: '', size: '', type: '', coating: '', quantity: 0, price: 0 });
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';
  const isFrame = formData.itemType === 'frame';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Box size={20} className="text-indigo-600" />
            {mode === 'edit' ? 'Update Item' : mode === 'view' ? 'Item Specifications' : 'Add New Inventory'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full shadow-sm transition-all"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Category Toggle */}
            <div className="col-span-2 flex p-1 bg-slate-100 rounded-xl mb-2">
              <button type="button" disabled={isReadOnly} onClick={() => setFormData({...formData, itemType: 'frame'})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isFrame ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>FRAME</button>
              <button type="button" disabled={isReadOnly} onClick={() => setFormData({...formData, itemType: 'lens'})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isFrame ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>LENS</button>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Brand Name</label>
              <input required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Ray-Ban or Essilor" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{isFrame ? 'Model' : 'Lens Sub-Type'}</label>
              <input disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} placeholder={isFrame ? "AVIATOR" : "Single Vision"} />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Material</label>
              <input required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} placeholder="Acetate / Polycarbonate" />
            </div>

            {isFrame ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Frame Type</label>
                  <select disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="">Select Type</option>
                    <option value="Full-Rim">Full-Rim</option>
                    <option value="Semi-Rimless">Semi-Rimless</option>
                    <option value="Rimless">Rimless</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color/Size</label>
                  <input disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    value={`${formData.color || ''} ${formData.size || ''}`} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="Black / 52-18" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Coating</label>
                  <input disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    value={formData.coating || ''} onChange={e => setFormData({...formData, coating: e.target.value})} placeholder="Anti-Blue / AR" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lens Design</label>
                  <select disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Single Vision">Single Vision</option>
                    <option value="Progressive">Progressive</option>
                    <option value="Bifocal">Bifocal</option>
                  </select>
                </div>
              </>
            )}

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">In Stock (Qty)</label>
              <input type="number" required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-indigo-50/30"
                value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit Price (KSh)</label>
              <input type="number" required disabled={isReadOnly} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-emerald-50/30"
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          {!isReadOnly && (
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-slate-200">
              <Tag size={18} /> {mode === 'edit' ? 'Update Inventory' : 'Add to Stock'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default StockModal;