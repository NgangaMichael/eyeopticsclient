import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit3, Trash2 } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';
import { expenseService } from "../api/services/expenseService";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  useEffect(() => { loadExpenses(); }, []);

  // Inside your component...
  const loadExpenses = async () => {
    try {
      const data = await expenseService.getAllExpenses();
      setExpenses(data);
    } catch (err) {
      // Show a nice toast or notification here
      console.error("Failed to load dashboard data");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await expenseService.updateExpense(modalState.data.id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      closeModal();
      loadExpenses(); // Refresh list
    } catch (err) {
      alert("Could not save expense. Check server connection.");
    }
  };

  const openModal = (mode, data = null) => {
    setModalState({ isOpen: true, mode, data });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense permanently?")) {
      try {
        await expenseService.deleteExpense(id);
        loadExpenses();
      } catch (err) { console.error("Delete failed", err); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Expenses</h2>
          <p className="text-slate-500">Manage and view all company expenses here.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Title</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{expense.title}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                      {expense.category || 'General'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400 mr-1">KSh</span>
                    <span className="font-extrabold text-slate-700">
                      {Number(expense.amount).toLocaleString()}
                    </span>
                  </td>
                  {/* ... rest of the rows (Actions) */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openModal('view', expense)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openModal('edit', expense)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(expense.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <ExpenseModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        onSubmit={handleSubmit} 
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}