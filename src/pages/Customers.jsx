import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit3, Trash2, Search, Calendar, Users } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import { customerService } from "../api/services/customerService";
import { ToastContainer, toast } from "react-toastify";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  // Filter Logic
  useEffect(() => {
    let result = customers;

    // Search by Name or Phone
    if (searchTerm) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
      );
    }

    // Date Range Filter
    if (dateFrom) {
      result = result.filter(c => new Date(c.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(c => new Date(c.createdAt) <= endOfDay);
    }

    setFilteredCustomers(result);
  }, [searchTerm, dateFrom, dateTo, customers]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err) { toast.error("Failed to load customers"); }
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      if (modalState.mode === 'edit') {
        await customerService.updateCustomer(modalState.data.id, payload);
        toast.success("Customer updated");
      } else {
        await customerService.createCustomer(payload);
        toast.success("Customer created");
      }
      setModalState({ ...modalState, isOpen: false });
      loadCustomers();
    } catch (err) { toast.error("Action failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this customer?")) {
      try {
        await customerService.deleteCustomer(id);
        loadCustomers();
        toast.success("Customer deleted");
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customers</h2>
          <p className="text-slate-500">Manage patients and business entities</p>
        </div>
        <button 
          onClick={() => setModalState({ isOpen: true, mode: 'add', data: null })} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-indigo-700 transition-all"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or phone..."
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
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {c.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{c.name}</span>
                        <span className="text-xs text-slate-400">{c.email || 'No Email'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      c.type === 'patient' ? 'bg-blue-100 text-blue-600' : 
                      c.type === 'company' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalState({ isOpen: true, mode: 'view', data: c })} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                      <button onClick={() => setModalState({ isOpen: true, mode: 'edit', data: c })} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No customers found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomerModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ ...modalState, isOpen: false })} 
        onSubmit={handleSubmit} 
        initialData={modalState.data}
        mode={modalState.mode}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}