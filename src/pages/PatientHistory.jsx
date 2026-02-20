import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, FileText, Calendar, Wallet, Edit2, Trash2 } from 'lucide-react';
import { jobCardService } from "../api/services/jobCardService";
import { patientService } from "../api/services/patientService";
import JobCardModal from '../components/JobCardModal';
import { toast, ToastContainer } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import JobCardInvoice from '../components/JobCardInvoice';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobCards, setJobCards] = useState([]);
  const [patient, setPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const invoiceRef = React.useRef(null);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const patientData = await patientService.getPatientById(id);
      setPatient(patientData);
    } catch (err) {
      console.error("Patient Service Error:", err);
    }

    try {
      const cardsData = await jobCardService.getJobCardsByPatientId(id);
      setJobCards(cardsData);

      if (cardsData.length > 0 && cardsData[0].patient) {
        setPatient(cardsData[0].patient);
      }
    } catch (err) {
      console.error("JobCard Service Error:", err);
      toast.error("Failed to load job cards");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  const handleDelete = async (cardId) => {
    if (window.confirm("Are you sure you want to delete this job card?")) {
      try {
        await jobCardService.deleteJobCard(cardId);
        toast.success("Job card deleted successfully");
        loadData();
      } catch (err) {
        toast.error("Failed to delete job card");
      }
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice_${selectedCard?.jobCardNumber || 'Patient'}`,
  });

  const triggerInvoice = (card) => {
    setSelectedCard(card);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/patients')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient History'}
            </h2>
            <p className="text-slate-500 font-medium">Job Card Records & Clinical History</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> New Job Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Visits</p>
            <p className="text-xl font-bold text-slate-800">{jobCards.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Calendar size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Last Visit</p>
            <p className="text-xl font-bold text-slate-800">
              {jobCards[0] ? new Date(jobCards[0].date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Wallet size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Outstanding Balance</p>
            <p className="text-xl font-bold text-slate-800">
              Ksh {jobCards.reduce((acc, card) => acc + Number(card.balance), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Card #</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">RX (Right/Left)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Financials</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {jobCards.length > 0 ? (
              jobCards.map((card) => (
                <tr key={card.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-indigo-600">#{card.jobCardNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700">
                      {new Date(card.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-mono text-slate-600">
                      RE: {card.rSph}/{card.rCyl} x {card.rAxis}° <br/>
                      LE: {card.lSph}/{card.lCyl} x {card.lAxis}°
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">Total: {card.total}</div>
                    <div className={`text-xs font-bold ${Number(card.balance) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      Bal: {card.balance}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => triggerInvoice(card)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Generate Invoice"
                      >
                        <FileText size={18}/>
                      </button>
                      <button 
                        onClick={() => handleEdit(card)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Card"
                      >
                        <Edit2 size={18}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  No job cards found for this patient.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <JobCardModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onJobCardAdded={loadData}
        initialPatientId={id} 
        editingCard={editingCard} 
      />

      <div style={{ display: 'none' }}>
        <JobCardInvoice 
          ref={invoiceRef} 
          card={selectedCard} 
          patient={patient} 
        />
      </div>
      
      <ToastContainer />
    </div>
  );
}