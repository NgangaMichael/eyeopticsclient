import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, FileUp, Plus, Package, Trash2, CheckCircle2, BoxesIcon } from 'lucide-react';
import Papa from 'papaparse';
import { containerService } from '../api/services/containerService';
import ContainerItemModal from '../components/ContainerItemModal';

export default function ContainerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [container, setContainer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiving, setIsReceiving] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  const loadContainer = async () => {
    try {
      const data = await containerService.getContainerById(id);
      setContainer(data);
    } catch (err) {
      toast.error("Failed to load container");
      navigate('/dashboard/containers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadContainer(); }, [id]);

  const handleAddItem = async (formData) => {
    try {
      await containerService.addItem(id, formData);
      toast.success("Item added successfully");
      setItemModalOpen(false);
      loadContainer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Remove this item from the container?")) {
      try {
        await containerService.deleteItem(id, itemId);
        toast.success("Item removed");
        loadContainer();
      } catch (err) {
        toast.error("Failed to remove item");
      }
    }
  };

  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const items = results.data
          .filter(row => row.name && row.code)
          .map(row => ({
            name: row.name?.trim(),
            code: row.code?.trim(),
            type: row.type?.trim() || 'Lens',
            index: row.index?.trim() || null,
            lensCategory: row.lensCategory?.trim() || 'Stock',
            sph: row.sph ? parseFloat(row.sph) : null,
            cyl: row.cyl ? parseFloat(row.cyl) : null,
            axis: row.axis ? parseInt(row.axis) : null,
            nearAdd: row.nearAdd ? parseFloat(row.nearAdd) : null,
            quantityOrdered: parseFloat(row.quantityOrdered) || 1,
            landedCost: parseFloat(row.landedCost) || 0,
            priceKsh: parseFloat(row.priceKsh) || 0,
            priceUsd: parseFloat(row.priceUsd) || 0,
            wholesalePrice: row.wholesalePrice ? parseFloat(row.wholesalePrice) : null,
          }));

        if (items.length === 0) {
          toast.error("No valid rows found. Check your CSV has 'name' and 'code' columns.");
          e.target.value = null;
          return;
        }

        try {
          await containerService.bulkAddItems(id, items);
          toast.success(`${items.length} items imported successfully!`);
          loadContainer();
        } catch (err) {
          toast.error(err.response?.data?.message || "CSV import failed");
        } finally {
          e.target.value = null;
        }
      },
    });
  };

  const handleReceive = async () => {
    if (!window.confirm(`Receive all ${container.items.length} items into stock? This cannot be undone.`)) return;
    setIsReceiving(true);
    try {
      await containerService.receiveContainer(id);
      toast.success("All items received into stock!");
      loadContainer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Receive failed");
    } finally {
      setIsReceiving(false);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-slate-400">Loading container...</div>;
  if (!container) return null;

  const isReceived = container.status === 'received';
  const hasItems = container.items?.length > 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/containers')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{container.name}</h2>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                isReceived ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {container.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {container.supplierName} · {container.code} · By {container.createdBy}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvImport}
            accept=".csv"
            className="hidden"
          />
          
          {/* These two only show when pending */}
          {!isReceived && (
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              <FileUp size={16} /> Import CSV
            </button>
          )}

          {/* Add Item always visible */}
          <button
            onClick={() => setItemModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Item
          </button>

          {/* Receive button only when pending */}
          {!isReceived && (
            <button
              onClick={handleReceive}
              disabled={!hasItems || isReceiving}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-1.5 ${
                !hasItems || isReceiving
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 size={16} />
              {isReceiving ? 'Receiving...' : 'Receive All Into Stock'}
            </button>
          )}
        </div>
      </div>

      {/* CSV Format Hint */}
      {!isReceived && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-600 font-medium">
          <span className="font-bold">CSV columns:</span> name, code, type, quantityOrdered, landedCost, priceKsh, priceUsd, index, lensCategory, sph, cyl, axis, nearAdd
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {!hasItems ? (
          <div className="text-center py-20 text-slate-400">
            <BoxesIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">Container is empty</p>
            <p className="text-sm">Import a CSV or add items manually to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Powers</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Qty</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cost</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Price</th>
                  {!isReceived && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {container.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-xs font-mono text-slate-400">{item.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.type === 'Lens' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type}
                      </span>
                      {item.lensCategory && (
                        <div className="text-[10px] text-slate-400 mt-1">{item.lensCategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.sph != null ? (
                        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-indigo-100 w-fit">
                          <span>S: {item.sph}</span>
                          {item.cyl != null && <><span className="text-indigo-200">|</span><span>C: {item.cyl}</span></>}
                          {item.axis != null && <><span className="text-indigo-200">|</span><span>A: {item.axis}°</span></>}
                          {item.nearAdd != null && <><span className="text-indigo-200">|</span><span>Add: {item.nearAdd}</span></>}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{Number(item.quantityOrdered)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="text-xs text-slate-400 mr-1">KSh</span>
                      {Number(item.landedCost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      <span className="text-xs text-slate-400 mr-1">KSh</span>
                      {Number(item.priceKsh).toLocaleString()}
                    </td>
                    {!isReceived && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {hasItems && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-slate-400">Total Items</span>
            <p className="font-extrabold text-slate-800 text-lg">{container.items.length}</p>
          </div>
          <div>
            <span className="text-slate-400">Total Quantity</span>
            <p className="font-extrabold text-slate-800 text-lg">
              {container.items.reduce((sum, i) => sum + Number(i.quantityOrdered), 0)}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Total Landed Cost</span>
            <p className="font-extrabold text-slate-800 text-lg">
              KSh {container.items.reduce((sum, i) => sum + Number(i.landedCost), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <ContainerItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
}