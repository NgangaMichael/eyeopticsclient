import React, { useState, useEffect, useMemo } from "react";
import { X, Save, AlertCircle, Banknote, Calculator } from "lucide-react";
import { jobCardService } from "../api/services/jobCardService";
import { stockService } from "../api/services/stockService";
import { toast } from "react-toastify";

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
    rSph: "", 
    rCyl: "", 
    rAxis: "", 
    rPrism: "", 
    rBase: "",
    lSph: "", 
    lCyl: "", 
    lAxis: "", 
    lPrism: "", 
    lBase: "",
    nearAdd: "", 
    distPd: "", 
    nearPd: "", 
    heights: "",
    lenses: "", 
    rLens: "", rLensStockId: null, rLensPrice: 0,
    lLens: "", lLensStockId: null, lLensPrice: 0,
    lensQty: 0.5, 
    frame: "", 
    frameQty: 1,
    advance: 0, 
    jobDelDate: "", 
    notes: "",
    discount: 0, 
    consultation: 0,
    lensPrice: 0, 
    framePrice: 0,
    
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
        } catch (err) { console.error("Failed to fetch inventory", err); }
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
          lensPrice: editingCard.lensPrice || 0,
          framePrice: editingCard.framePrice || 0,
          date: editingCard.date ? new Date(editingCard.date).toISOString().split("T")[0] : "",
          jobDelDate: editingCard.jobDelDate ? new Date(editingCard.jobDelDate).toISOString().split("T")[0] : "",
        });
      } else {
        setFormData({ ...initialState, patientId: initialPatientId });
      }
    }
  }, [isOpen, editingCard, initialPatientId]);

  // --- AUTO CALCULATIONS ---
  const calculatedTotal = useMemo(() => {
    const rp = Number(formData.rLensPrice || 0);
    const lp = Number(formData.lLensPrice || 0);
    const fp = (Number(formData.framePrice) || 0) * (Number(formData.frameQty) || 0);
    const cons = Number(formData.consultation || 0);
    const disc = Number(formData.discount || 0);
    
    // Total = (Sum of both lenses + frames + consultation) - discount
    return (rp + lp + fp + cons) - disc;
  }, [formData.rLensPrice, formData.lLensPrice, formData.framePrice, formData.frameQty, formData.consultation, formData.discount]);

  const balance = calculatedTotal - Number(formData.advance || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lenses") {
      const selectedLens = lensOptions.find((l) => l.name === value);
      setFormData((prev) => ({
        ...prev, lenses: value,
        lensStockId: selectedLens ? selectedLens.id : null,
        lensPrice: selectedLens ? selectedLens.priceKsh : 0,
      }));
    } else if (name === "frame") {
      const selectedFrame = frameOptions.find((f) => f.name === value);
      setFormData((prev) => ({
        ...prev, frame: value,
        frameStockId: selectedFrame ? selectedFrame.id : null,
        framePrice: selectedFrame ? selectedFrame.priceKsh : 0,
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
      total: calculatedTotal,
      balance: balance,
      patientId: parseInt(formData.patientId), 

      rLensQty: formData.rLens ? 0.5 : 0,
      lLensQty: formData.lLens ? 0.5 : 0,
      // Ensure specific lens prices are numbers
      rLensPrice: Number(formData.rLensPrice),
      lLensPrice: Number(formData.lLensPrice),

      framePrice: Number(formData.framePrice),
      consultation: Number(formData.consultation),
      discount: Number(formData.discount),
      advance: Number(formData.advance),
      // IDs
      rLensStockId: formData.rLensStockId ? parseInt(formData.rLensStockId) : null,
      lLensStockId: formData.lLensStockId ? parseInt(formData.lLensStockId) : null,
      frameStockId: formData.frameStockId ? parseInt(formData.frameStockId) : null,
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

          {/* Section 3: Detailed Inventory Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LENS SELECTION (SPLIT) */}
              <div className="space-y-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Lens Configuration</h4>
                
                {/* Right Eye Lens */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Right Eye (OD) Lens</label>
                  <select 
                    name="rLens" 
                    value={formData.rLens} 
                    onChange={(e) => {
                      const selected = lensOptions.find(l => l.name === e.target.value);
                      setFormData(prev => ({
                        ...prev, 
                        rLens: e.target.value,
                        rLensStockId: selected?.id || null,
                        rLensPrice: selected?.priceKsh || 0
                      }));
                    }}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="">-- Select Right Lens --</option>
                    {lensOptions.map(l => <option key={l.id} value={l.name}>{l.name} (Ksh {l.priceKsh})</option>)}
                  </select>
                </div>

                {/* Left Eye Lens */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Left Eye (OS) Lens</label>
                  <select 
                    name="lLens" 
                    value={formData.lLens} 
                    onChange={(e) => {
                      const selected = lensOptions.find(l => l.name === e.target.value);
                      setFormData(prev => ({
                        ...prev, 
                        lLens: e.target.value,
                        lLensStockId: selected?.id || null,
                        lLensPrice: selected?.priceKsh || 0
                      }));
                    }}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="">-- Select Left Lens --</option>
                    {lensOptions.map(l => <option key={l.id} value={l.name}>{l.name} (Ksh {l.priceKsh})</option>)}
                  </select>
                </div>
              </div>

              {/* FRAME SELECTION (REMAINS SAME) */}
              <div className="space-y-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Frame Configuration</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Frame Selection</label>
                  <select name="frame" value={formData.frame} onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold">
                    <option value="">-- Select Frame --</option>
                    {frameOptions.map(f => <option key={f.id} value={f.name}>{f.name} ({f.code})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Frame Qty</label>
                  <input type="number" name="frameQty" value={formData.frameQty} onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold" />
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

          {/* Section 5: Financial Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-indigo-600">Consultation Fee</label>
              <input type="number" name="consultation" value={formData.consultation} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-rose-500">Discount Given</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-emerald-600">Amount Paid (Ksh)</label>
              <input type="number" name="advance" value={formData.advance} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Clinical Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange}
              placeholder="Instructions or observations..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[80px]" />
          </div>

          {/* Section 6: Detailed Financial Summary & Breakdown */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Left Side: Line Item Breakdown */}
                {/* Section 6: Revised Invoice Breakdown */}
                  <div className="space-y-3">
                    {/* Right Lens */}
                    {formData.rLens && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Right Lens ({formData.rLens})</span>
                        <span className="font-mono font-bold">Ksh {Number(formData.rLensPrice).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Left Lens */}
                    {formData.lLens && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Left Lens ({formData.lLens})</span>
                        <span className="font-mono font-bold">Ksh {Number(formData.lLensPrice).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Frame Calculation */}
                    {formData.frame && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Frame ({formData.frameQty} units)</span>
                        <span className="font-mono font-bold">Ksh {(Number(formData.framePrice) * Number(formData.frameQty)).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Consultation */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Consultation Fee</span>
                      <span className="font-mono font-bold">Ksh {Number(formData.consultation).toLocaleString()}</span>
                    </div>

                    {/* Discount */}
                    {Number(formData.discount) > 0 && (
                      <div className="flex justify-between items-center text-sm text-rose-400">
                        <span>Discount</span>
                        <span className="font-mono font-bold">- Ksh {Number(formData.discount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                {/* Right Side: Final Totals & Actions */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Payable</p>
                      <p className="text-4xl font-black text-white tracking-tighter">
                        <span className="text-lg font-normal text-slate-500 mr-1">Ksh</span>
                        {calculatedTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="border-l border-slate-800 pl-4">
                      <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Balance Due</p>
                      <p className="text-4xl font-black text-rose-500 tracking-tighter">
                        <span className="text-lg font-normal text-rose-800 mr-1">Ksh</span>
                        {balance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                      <label>Promise Date:</label>
                      <input 
                        type="date" 
                        name="jobDelDate" 
                        value={formData.jobDelDate} 
                        onChange={handleChange}
                        className="bg-transparent border-b border-slate-700 text-indigo-400 focus:outline-none focus:border-indigo-500 pb-1"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-all border border-slate-800"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className={`flex-[2] py-3 rounded-2xl text-sm font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all ${
                          editingCard ? "bg-amber-500 hover:bg-amber-600 shadow-amber-900/20" : "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-900/20"
                        }`}
                      >
                        {loading ? "Processing..." : <><Save size={18}/> {editingCard ? "Update Record" : "Confirm & Save"}</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/* Actions */}
          {/* <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg flex items-center gap-2 transition-all ${
                editingCard ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
              }`}>
              {loading ? "Saving..." : <><Save size={18}/> {editingCard ? "Update Card" : "Save Job Card"}</>}
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default JobCardModal;