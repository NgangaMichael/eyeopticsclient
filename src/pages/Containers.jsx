import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Trash2, Edit3, ChevronRight, BoxesIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { containerService } from '../api/services/containerService';
import ContainerModal from '../components/ContainerModal';

export default function Containers() {
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });
  const navigate = useNavigate();

  const loadContainers = async () => {
    setIsLoading(true);
    try {
      const data = await containerService.getAllContainers();
      setContainers(data);
    } catch (err) {
      toast.error("Failed to load containers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadContainers(); }, []);

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await containerService.updateContainer(modalState.data.id, formData);
        toast.success("Container updated");
      } else {
        await containerService.createContainer(formData);
        toast.success("Container created");
      }
      setModalState({ ...modalState, isOpen: false });
      loadContainers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save container");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this container? This cannot be undone.")) {
      try {
        await containerService.deleteContainer(id);
        toast.success("Container deleted");
        loadContainers();
      } catch (err) {
        toast.error(err.response?.data?.message || "Cannot delete this container");
      }
    }
  };

  const handleEdit = (e, container) => {
    e.stopPropagation();
    setModalState({ isOpen: true, mode: 'edit', data: container });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Containers</h2>
          <p className="text-slate-500">Manage incoming shipments and stock batches.</p>
        </div>
        <button
          onClick={() => setModalState({ isOpen: true, mode: 'add', data: null })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> New Container
        </button>
      </div>

      {/* Container Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : containers.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BoxesIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg">No containers yet</p>
          <p className="text-sm">Create your first container to start tracking shipments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {containers.map((container) => (
            <div
              key={container.id}
              onClick={() => navigate(`/dashboard/containers/${container.id}`)}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all group"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <Package size={22} className="text-indigo-500" />
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                  container.status === 'received'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {container.status}
                </span>
              </div>

              {/* Container Info */}
              <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{container.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{container.supplierName}</p>

              {/* Meta */}
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    <span className="font-bold text-slate-600">{container._count?.items ?? 0}</span> items
                  </p>
                  <p className="text-xs text-slate-400">By <span className="font-semibold">{container.createdBy}</span></p>
                  <p className="text-xs text-slate-400 font-mono">{container.code}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {container.status !== 'received' && (
                    <>
                      <button
                        onClick={(e) => handleEdit(e, container)}
                        className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, container.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContainerModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={handleSubmit}
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}