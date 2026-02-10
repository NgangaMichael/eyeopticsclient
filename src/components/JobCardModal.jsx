import React, { useState, useEffect, useMemo } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { jobCardService } from "../api/services/jobCardService";
import { stockService } from "../api/services/stockService";
import { toast } from "react-toastify";

// Kenyan Insurance List
const KENYAN_INSURANCES = [
  "Cash / Private", "SHA / NHIF", "AAR Insurance", "APA Insurance", "Britam",
  "CIC Insurance", "First Assurance", "GA Insurance", "Heritage", "ICEA Lion",
  "Jubilee Insurance", "Kenindia", "Kenya Alliance", "Madison Insurance",
  "Minet", "Old Mutual / UAP", "Pacis Insurance", "Sanlam", "Takaful",
];

const JobCardModal = ({ isOpen, onClose, onJobCardAdded, initialPatientId, editingCard }) => {
  const initialState = {
    jobCardNumber: "",
    patientId: initialPatientId || "",
    insuranceCompany: "",
    date: new Date().toISOString().split("T")[0],
    rSph: "", rCyl: "", rAxis: "", rPrism: "", rBase: "",
    lSph: "", lCyl: "", lAxis: "", lPrism: "", lBase: "",
    nearAdd: "", distPd: "", nearPd: "", heights: "",
    lenses: "", 
    lensQty: 1, // Default to 1 lens
    frame: "", 
    frameQty: 1, // Default to 1 frame
    total: 0, advance: 0, jobDelDate: "",
    consultation: 0
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const loadInventory = async () => {
        try {
          const data = await stockService.getAllStocks();
          setStocks(data);
        } catch (err) {
          console.error("Failed to fetch inventory", err);
        }
      };
      loadInventory();
    }
  }, [isOpen]);

  const lensOptions = useMemo(() => stocks.filter(s => s.type?.toLowerCase() === 'lens'), [stocks]);
  const frameOptions = useMemo(() => stocks.filter(s => s.type?.toLowerCase() === 'frames'), [stocks]);

  useEffect(() => {
    if (isOpen) {
      if (editingCard) {
        setFormData({
          ...initialState,
          ...editingCard,
          date: editingCard.date ? new Date(editingCard.date).toISOString().split("T")[0] : "",
          jobDelDate: editingCard.jobDelDate ? new Date(editingCard.jobDelDate).toISOString().split("T")[0] : "",
          insuranceCompany: editingCard.insuranceCompany || "",
          lenses: editingCard.lenses || "",
          lensQty: editingCard.lensQty || 1,
          frame: editingCard.frame || "",
          frameQty: editingCard.frameQty || 1
        });
      } else {
        setFormData({ ...initialState, patientId: initialPatientId });
      }
    }
  }, [isOpen, editingCard, initialPatientId]);

  const balance = Number(formData.total || 0) - Number(formData.advance || 0);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "lenses") {
    const selectedLens = lensOptions.find((l) => l.name === value);
    setFormData((prev) => ({
      ...prev,
      lenses: value,
      lensStockId: selectedLens ? selectedLens.id : null,
      lensPrice: selectedLens ? selectedLens.priceKsh : 0, // Capture Price
    }));
  } else if (name === "frame") {
    const selectedFrame = frameOptions.find((f) => f.name === value);
    setFormData((prev) => ({
      ...prev,
      frame: value,
      frameStockId: selectedFrame ? selectedFrame.id : null,
      framePrice: selectedFrame ? selectedFrame.priceKsh : 0, // Capture Price
    }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const submissionData = { 
      ...formData, 
      patientId: parseInt(formData.patientId), 
      lensQty: parseFloat(formData.lensQty),
      frameQty: parseInt(formData.frameQty),
      // Ensure IDs are numbers
      lensStockId: formData.lensStockId ? parseInt(formData.lensStockId) : null,
      frameStockId: formData.frameStockId ? parseInt(formData.frameStockId) : null,
      balance 
    };

    if (editingCard) {
      await jobCardService.updateJobCard(editingCard.id, submissionData);
      toast.success("Job Card updated!");
    } else {
      await jobCardService.createJobCard(submissionData);
      toast.success("Job Card created!");
    }
    onJobCardAdded(); 
    onClose();
  } catch (error) {
    toast.error("Operation failed.");
  } finally {
    setLoading(false);
  }
};

  // Auto-calculate Total using useMemo
  const calculatedTotal = useMemo(() => {
    const lp = (formData.lensPrice || 0) * (formData.lensQty || 0);
    const fp = (formData.framePrice || 0) * (formData.frameQty || 0);
    const cons = Number(formData.consultation || 0);
    return lp + fp + cons;
  }, [formData.lensPrice, formData.lensQty, formData.framePrice, formData.frameQty, formData.consultation]);

  useEffect(() => {
      setFormData(prev => ({ ...prev, total: calculatedTotal }));
  }, [calculatedTotal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {editingCard ? `Update Job Card #${editingCard.jobCardNumber}` : "New Job Card"}
            </h2>
            <p className="text-slate-500 text-sm font-medium">Patient ID: #{initialPatientId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Job Card #</label>
              <input type="text" name="jobCardNumber" value={formData.jobCardNumber} onChange={handleChange} required 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Insurance Company</label>
              <select name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Insurance</option>
                {KENYAN_INSURANCES.map(ins => <option key={ins} value={ins}>{ins}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
            </div>
          </div>

          {/* Section 2: Prescription Table */}
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <h3 className="text-xs font-black text-indigo-600 uppercase mb-4 tracking-widest flex items-center gap-2">
              <AlertCircle size={14} /> Clinical Prescription
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-2">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase">
                    <th className="text-left pl-2">Eye</th>
                    <th>Sph</th><th>Cyl</th><th>Axis</th><th>Prism</th><th>Base</th>
                  </tr>
                </thead>
                <tbody>
                  {[{ label: 'Right (OD)', prefix: 'r' }, { label: 'Left (OS)', prefix: 'l' }].map((eye) => (
                    <tr key={eye.prefix}>
                      <td className="text-xs font-bold text-slate-600">{eye.label}</td>
                      {['Sph', 'Cyl', 'Axis', 'Prism', 'Base'].map((field) => (
                        <td key={field}>
                          <input type="text" name={`${eye.prefix}${field}`} value={formData[`${eye.prefix}${field}`] || ""} onChange={handleChange}
                            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-center text-sm font-medium" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Inventory Dropdowns & Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LENSES */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Lens Selection</label>
                <select name="lenses" value={formData.lenses} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Select Lens --</option>
                  {lensOptions.map(l => (
                    <option key={l.id} value={l.name}>{l.name} (Stock: {l.qty})</option>
                  ))}
                </select>
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Qty</label>
                <select name="lensQty" value={formData.lensQty} onChange={handleChange}
                  className="w-full px-2 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-bold text-indigo-700 outline-none">
                  <option value="0">0</option>
                  <option value="0.5">0.5</option>
                  <option value="1">1.0</option>
                  <option value="1.5">1.5</option>
                  <option value="2">2.0</option>
                  <option value="2.5">2.5</option>
                  <option value="3">3.0</option>

                </select>
              </div>
            </div>

            {/* FRAMES */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Frame Selection</label>
                <select name="frame" value={formData.frame} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Select Frame --</option>
                  {frameOptions.map(f => (
                    <option key={f.id} value={f.name}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Qty</label>
                <select name="frameQty" value={formData.frameQty} onChange={handleChange}
                  className="w-full px-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 outline-none">
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>

                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Other Measurements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['nearAdd', 'distPd', 'nearPd', 'heights'].map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{field}</label>
                <input type="text" name={field} value={formData[field] || ""} onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Consultation</label>
            <input type="number" name="consultation" value={formData.consultation} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
          </div>

          {/* Section 5: Financials */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-indigo-600">Total (Ksh)</label>
              <input type="number" name="total" value={formData.total} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-indigo-700 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-emerald-600">Advance</label>
              <input type="number" name="advance" value={formData.advance} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-emerald-700 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-rose-500">Balance</label>
              <div className="w-full px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl font-bold text-rose-600">
                Ksh {balance.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Promise Date</label>
              <input type="date" name="jobDelDate" value={formData.jobDelDate} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg flex items-center gap-2 transition-all ${
                editingCard ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              }`}>
              {loading ? "Saving..." : <><Save size={18}/> {editingCard ? "Update Card" : "Save Job Card"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobCardModal;