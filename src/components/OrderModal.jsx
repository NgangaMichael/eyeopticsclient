import React, { useEffect, useState, useMemo, useRef } from 'react';
import { X, Search, CheckCircle2, ChevronDown } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, onSubmit, initialData, mode, existingStocks = [] }) => {
  const [isNewItem, setIsNewItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '', code: '', type: 'Lens', quantityOrdered: '',
    priceUsd: '0', priceKsh: '', landedCost: '', 
    supplierName: '', status: 'pending', sph: '', cyl: '',
    axis: '',
    nearAdd: '',
    lensCategory: 'Stock',
    index: ''
  });

  const isReadOnly = mode === 'view' || formData.status === 'received';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsNewItem(initialData.code === 'AUTO');
      setSearchTerm(initialData.name || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '', code: '', type: 'Lens', quantityOrdered: '',
      priceUsd: '0', priceKsh: '', landedCost: '', 
      supplierName: '', status: 'pending', sph: '', cyl: ''
    });
    setSearchTerm('');
    setIsNewItem(false);
    setShowDropdown(false);
  };

  // Filter stocks based on search term
  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return existingStocks.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, existingStocks]);

  const selectExisting = (stock) => {
    // Create a fresh object with the stock's actual type
    const newFormData = {
      name: stock.name,
      code: stock.code,
      type: stock.type, // Use the actual type from the stock item
      priceUsd: '0',
      priceKsh: stock.priceKsh || '',
      quantityOrdered: formData.quantityOrdered || '',
      landedCost: formData.landedCost || '',
      supplierName: formData.supplierName || '',
      status: formData.status || 'pending'
    };
    
    setFormData(newFormData);
    setSearchTerm(stock.name);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Clear only name and code when user starts typing a new search
    // Keep type, prices, and other fields as they might be pre-filled
    if (!isNewItem && value.length === 1 && !formData.code) {
      // Only clear on first character if nothing is selected yet
      setFormData({
        ...formData,
        name: '',
        code: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold">
            {isReadOnly ? 'Order Details' : mode === 'edit' ? 'Edit Order' : 'Create Supply Order'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Toggle buttons */}
          {!isReadOnly && mode !== 'edit' && (
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-2">
              <button 
                type="button"
                onClick={() => { setIsNewItem(false); resetForm(); }}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${!isNewItem ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >Existing Stock Item</button>
              <button 
                type="button"
                onClick={() => { 
                  setIsNewItem(true); 
                  setFormData({...formData, code: 'AUTO', name: ''}); 
                  setSearchTerm(''); 
                  setShowDropdown(false);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isNewItem ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >New Stock Item</button>
            </div>
          )}

          {/* SEARCH BAR & DROPDOWN */}
          {!isNewItem && !isReadOnly && mode !== 'edit' && (
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/30 outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900"
                  placeholder="Search item name from inventory..."
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={handleSearchChange}
                />
              </div>

              {/* DROPDOWN MENU */}
              {showDropdown && filteredStocks.length > 0 && (
                <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto">
                  {filteredStocks.map(stock => (
                    <div 
                      key={stock.id} 
                      onClick={() => selectExisting(stock)}
                      className="p-4 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{stock.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{stock.code}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">{stock.type}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown && searchTerm.trim() && filteredStocks.length === 0 && (
                <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4">
                  <p className="text-sm text-slate-400 text-center">No items found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Item Name - Only editable if New Item */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Item Name</label>
              <input 
                required
                disabled={!isNewItem || isReadOnly}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
              <div className="relative">
                <select 
                  required
                  disabled={isReadOnly || !isNewItem}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none appearance-none font-bold disabled:bg-slate-50 disabled:text-slate-500"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Lens">Lens</option>
                  <option value="Frames">Frames</option>
                </select>
                <ChevronDown className="absolute right-3 top-4.5 text-slate-400" size={18} />
              </div>
            </div>

            {/* Lens Specific Fields */}
              {formData.type === 'Lens' && (
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100">
                  
                  {/* Lens Category Dropdown */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold text-indigo-500 uppercase">Category</label>
                    <select 
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                      value={formData.lensCategory}
                      onChange={e => setFormData({...formData, lensCategory: e.target.value})}
                    >
                      <option value="Stock">Stock Lens</option>
                      <option value="Custom">Custom Lens</option>
                    </select>
                  </div>

                  {/* Index Field*/}
                  <div>
                    <label className="text-[10px] font-bold text-indigo-500 uppercase">Index</label>
                    <input
                      type="text"
                      placeholder="1.61"
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                      value={formData.cyl}
                      onChange={e => setFormData({ ...formData, cyl: e.target.value })}
                    />
                  </div>

                  {/* AXIS - New */}
                  <div>
                    <label className="text-[10px] font-bold text-indigo-500 uppercase">Axis (°)</label>
                    <input
                      type="number" min="0" max="180" placeholder="0"
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                      value={formData.axis}
                      onChange={e => setFormData({ ...formData, axis: e.target.value })}
                    />
                  </div>

                  {/* NEAR ADD - New */}
                  <div>
                    <label className="text-[10px] font-bold text-indigo-500 uppercase">Near Add</label>
                    <input
                      type="number" step="0.25" placeholder="0.00"
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 mt-1 outline-none font-bold text-sm"
                      value={formData.nearAdd}
                      onChange={e => setFormData({ ...formData, nearAdd: e.target.value })}
                    />
                  </div>
                </div>
              )}

            {/* Numeric Fields - All Required */}
            {['quantityOrdered', 'landedCost', 'priceKsh'].map((field) => (
              <div key={field}>
                <label className="text-[10px] font-bold text-slate-500 uppercase">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="number"
                  step="0.5"
                  required={field !== 'landedCost'}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold text-slate-900"
                  value={formData[field]}
                  onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Supplier</label>
              <input 
                required
                disabled={isReadOnly}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 mt-1 outline-none font-bold"
                value={formData.supplierName}
                onChange={e => setFormData({...formData, supplierName: e.target.value})}
              />
            </div>
          </div>

          {!isReadOnly && (
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition-all">
              Confirm Supply Order
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrderModal;