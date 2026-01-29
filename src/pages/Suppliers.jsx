import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit3, Trash2, Search, Calendar } from 'lucide-react';
import SupplierModal from '../components/supplierModal';
import { supplierService } from "../api/services/supplierService";
import { ToastContainer, toast } from "react-toastify";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadSuppliers(); }, []);

  // Filter Logic: Runs whenever searchTerm, date range, or the raw suppliers list changes
  useEffect(() => {
    let result = suppliers;

    // Search by Name
    if (searchTerm) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date Range Filter
    if (dateFrom) {
      result = result.filter(s => new Date(s.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      // Set to end of day to include the specific "To" date
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(s => new Date(s.createdAt) <= endOfDay);
    }

    setFilteredSuppliers(result);
  }, [searchTerm, dateFrom, dateTo, suppliers]);

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
    } catch (err) {
      toast.error("Failed to load suppliers");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Data Sanitization: Prevent sending metadata to the backend
      const { id, createdAt, updatedAt, ...payload } = formData;
      
      if (modalState.mode === 'edit') {
        await supplierService.updateSupplier(modalState.data.id, payload);
        toast.success(`Supplier updated successfully`);
      } else {
        await supplierService.createSupplier(payload);
        toast.success(`Supplier created successfully`);
      }
      closeModal();
      loadSuppliers();
    } catch (err) {
      toast.error("Error saving supplier data");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await supplierService.deleteSupplier(id);
        loadSuppliers();
        toast.success("Supplier removed");
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suppliers</h2>
          <p className="text-slate-500">Manage and filter your supplier list</p>
        </div>
        <button onClick={() => openModal('add')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md hover:bg-indigo-700 transition-all">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search supplier name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date From */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">From</span>
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">To</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Supplier</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contact Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {s.name[0]}
                      </div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{s.email || '—'}</div>
                    <div className="text-xs text-slate-400 font-medium">{s.phone || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal('view', s)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                      <button onClick={() => openModal('edit', s)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No suppliers found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SupplierModal 
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