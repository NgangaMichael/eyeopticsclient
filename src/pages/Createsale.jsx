import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Eye, Search, Filter, Box } from 'lucide-react';
import StockModal from '../components/StockModal';
import { stockService } from "../api/services/stockService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Createsale() {
  const [stocks, setStocks] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => { loadStocks(); }, []);

  const loadStocks = async () => {
    try {
      const data = await stockService.getAllStocks();
      setStocks(data);
    } catch {
      toast.error("Failed to load inventory data");
    }
  };

  // Filter Logic
  const filteredStocks = useMemo(() => {
    return stocks.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [stocks, searchTerm, typeFilter]);

  // Unique types for the dropdown
  const categories = useMemo(() => {
    const types = stocks.map(s => s.type).filter(Boolean);
    return [...new Set(types)];
  }, [stocks]);

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await stockService.updateStock(modalState.data.id, formData);
        toast.success(`Item updated successfully`);
      } else {
        await stockService.createStock(formData);
        toast.success(`Item added successfully`);
      }
      closeModal();
      loadStocks();
    } catch {
      toast.error("Failed to save/update Stock Item");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Sale</h2>
          <p className="text-slate-500">Search and add items to the current transaction.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm items-center">
        
        {/* Search by Name or Code */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or item code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter by Type */}
        <div className="relative">
          <Box className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none transition-all"
          >
            <option value="all">All Types / Categories</option>
            {categories.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">Item Type</span>
        </div>

        {/* Reset Filters */}
        <div className="flex justify-center md:justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
            }}
            className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-tight"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name / Code</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Qty</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price (USD / KSh)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStocks.length > 0 ? (
              filteredStocks.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-xs font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded inline-block">
                      {item.code}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${item.qty <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                      {item.qty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-slate-900 font-bold">
                      {Number(item.priceKsh || 0).toLocaleString()} <span className="text-[10px] text-slate-400">KSH</span>
                    </div>
                    <div className="text-slate-400 text-xs">
                      ${Number(item.priceUsd || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openModal('view', item)} 
                      className="bg-indigo-50 text-indigo-600 p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-2 font-bold text-xs"
                    >
                      <Plus size={16} /> Add to Cart
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No items found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StockModal
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