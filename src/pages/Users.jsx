import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Eye, Edit3, Trash2, ShieldCheck, PhoneCall, Search, UserCircle, Filter } from 'lucide-react';
import UserModal from '../components/UserModal';
import { userService } from "../api/services/userService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [designationFilter, setDesignationFilter] = useState('all');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load system users");
      toast.error("Failed to load user records");
    }
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesName = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPhone = user.phone ? user.phone.includes(phoneSearch) : true;
      
      const matchesDesignation = designationFilter === 'all' || 
        (user.designation || 'Staff').toLowerCase() === designationFilter.toLowerCase();

      return matchesName && matchesPhone && matchesDesignation;
    });
  }, [users, searchTerm, phoneSearch, designationFilter]);

  // Extract unique designations for the filter dropdown
  const uniqueDesignations = useMemo(() => {
    const roles = users.map(u => u.designation || 'Staff');
    return [...new Set(roles)];
  }, [users]);

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await userService.updateUser(modalState.data.id, formData);
        toast.success(`User updated successfully`);
      } else {
        await userService.createUser(formData);
        toast.success(`User created successfully`);
      }
      closeModal();
      loadUsers();
    } catch (err) {
      toast.error("Failed to save/update user");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (window.confirm("Remove this user's access? This action cannot be undone.")) {
      try {
        await userService.deleteUser(id);
        loadUsers();
        toast.success("User deleted successfully");
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Users</h2>
          <p className="text-slate-500">Manage staff accounts and administrative permissions.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm items-center">
        
        {/* Name / Email Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search name or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Phone Search */}
        <div className="relative">
          <PhoneCall className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
          />
        </div>

        {/* Designation Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none transition-all"
          >
            <option value="all">All Designations</option>
            {uniqueDesignations.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">Role</span>
        </div>

        {/* Reset */}
        <div className="flex justify-center md:justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setPhoneSearch('');
              setDesignationFilter('all');
            }}
            className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-tight"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{user.username}</span>
                        <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-indigo-50 rounded-lg">
                        <ShieldCheck size={14} className="text-indigo-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{user.designation || 'Staff'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <PhoneCall size={14} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">{user.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal('view', user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openModal('edit', user)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserModal 
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