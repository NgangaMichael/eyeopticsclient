import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit3, Trash2, ShieldCheck } from 'lucide-react';
import UserModal from '../components/UserModal';
import { userService } from "../api/services/userService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load system users");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await userService.updateUser(modalState.data.id, formData);
          toast.success(`User "${formData.username}" updated successfully`);
      } else {
        await userService.createUser(formData);
                  toast.success(`User "${formData.username}" Created successfully`);
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
         console.error("Delete failed", err); 
              toast.error("Failed to delete user");}
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Users</h2>
          <p className="text-slate-500">Manage staff accounts and administrative permissions.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{user.username}</div>
                  <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700">{user.designation || 'Staff'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                 <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openModal('view', user)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => openModal('edit', user)}
                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                </td>
              </tr>
            ))}
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