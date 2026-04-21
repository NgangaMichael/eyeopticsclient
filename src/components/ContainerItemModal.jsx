import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

const ContainerItemModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '', 
    code: '', 
    type: 'Lens',
    lensCategory: 'Stock', 
    index: '',
    sph: '', 
    cyl: '', 
    axis: '', 
    nearAdd: '',
    quantityOrdered: '', 
    costKsh: '', 
    landedCost: '',
    priceKsh: '', 
    priceUsd: '', 
    wholesalePrice: '',
  });

  // Handle mode switching (Edit vs Add)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // EDIT MODE: Populate with existing item data
        setFormData({
          ...initialData,
          // Convert nulls/undefined to empty strings for controlled inputs
          sph: initialData.sph ?? '',
          cyl: initialData.cyl ?? '',
          axis: initialData.axis ?? '',
          nearAdd: initialData.nearAdd ?? '',
          index: initialData.index ?? '',
          wholesalePrice: initialData.wholesalePrice ?? '',
          priceUsd: initialData.priceUsd ?? '',
        });
      } else {
        // ADD MODE: Reset to defaults
        setFormData({
          name: '', code: '', type: 'Lens',
          lensCategory: 'Stock', index: '',
          sph: '', cyl: '', axis: '', nearAdd: '',
          quantityOrdered: '', costKsh: '', landedCost: '',
          priceKsh: '', priceUsd: '', wholesalePrice: '',
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isLens = formData.type === 'Lens';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Container Item' : 'Add Item to Container'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Item Name */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Item Name</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Nikon 1.61 SV"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
              <div className="relative">
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none appearance-none font-bold focus:ring-2 focus:ring-indigo-500"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Lens">Lens</option>
                  <option value="Frames">Frames</option>
                </select>
                <ChevronDown className="absolute right-3 top-5 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Item Code */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Item Code</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. LNS-001"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Cost Price (KSh)</label>
              <input
                required type="number" step="0.01" min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                value={formData.costKsh}
                onChange={e => setFormData({ ...formData, costKsh: e.target.value })}
              />
            </div>

            {/* Landed Cost */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Landed Cost (KSh)</label>
              <input
                required type="number" step="0.01" min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                value={formData.landedCost}
                onChange={e => setFormData({ ...formData, landedCost: e.target.value })}
              />
            </div>

            {/* Selling/Retail Price */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Selling Price (KSh)</label>
              <input
                required type="number" step="0.01" min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                value={formData.priceKsh}
                onChange={e => setFormData({ ...formData, priceKsh: e.target.value })}
              />
            </div>

            {/* Wholesale Price */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Wholesale Price (KSh)</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                value={formData.wholesalePrice}
                onChange={e => setFormData({ ...formData, wholesalePrice: e.target.value })}
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Quantity</label>
              <input
                required type="number" step="1" min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                value={formData.quantityOrdered}
                onChange={e => setFormData({ ...formData, quantityOrdered: e.target.value })}
              />
            </div>

            {/* Price USD */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Price (USD)</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                value={formData.priceUsd}
                onChange={e => setFormData({ ...formData, priceUsd: e.target.value })}
              />
            </div>

            {/* Lens Specific Fields */}
            {isLens && (
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-6 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                
                {/* Lens Category */}
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase">Category</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                    value={formData.lensCategory}
                    onChange={e => setFormData({ ...formData, lensCategory: e.target.value })}
                  >
                    <option value="Stock">Stock</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Index */}
                <div>
                  <label className="text-[10px] font-bold text-indigo-500 uppercase">Index</label>
                  <input
                    type="text" placeholder="1.61"
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                    value={formData.index}
                    onChange={e => setFormData({ ...formData, index: e.target.value })}
                  />
                </div>

                {/* SPH */}
                <div>
                  <label className="text-[10px] font-bold text-indigo-500 uppercase">SPH</label>
                  <input
                    type="number" step="0.25" placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                    value={formData.sph}
                    onChange={e => setFormData({ ...formData, sph: e.target.value })}
                  />
                </div>

                {/* CYL */}
                <div>
                  <label className="text-[10px] font-bold text-indigo-500 uppercase">CYL</label>
                  <input
                    type="number" step="0.25" placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                    value={formData.cyl}
                    onChange={e => setFormData({ ...formData, cyl: e.target.value })}
                  />
                </div>

                {/* Axis */}
                <div>
                  <label className="text-[10px] font-bold text-indigo-500 uppercase">Axis °</label>
                  <input
                    type="number" min="0" max="180" placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                    value={formData.axis}
                    onChange={e => setFormData({ ...formData, axis: e.target.value })}
                  />
                </div>

                {/* Near Add */}
                <div>
                  <label className="text-[10px] font-bold text-indigo-500 uppercase">Near Add</label>
                  <input
                    type="number" step="0.25" placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                    value={formData.nearAdd}
                    onChange={e => setFormData({ ...formData, nearAdd: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition-all"
          >
            {initialData ? 'Update Item' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContainerItemModal;