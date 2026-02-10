import React from 'react';

export const InvoicePrintout = React.forwardRef(({ patient, card }, ref) => {
  if (!card || !patient) return null;

  return (
    <div ref={ref} className="p-16 bg-white text-slate-800 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black text-indigo-600 tracking-tighter">EYE OPTICS</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Clinical Receipt & Invoice</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">Invoice #{card.jobCardNumber}</p>
          <p className="text-sm text-slate-500">Date: {new Date(card.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Patient & Provider Info */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase mb-2">Patient Details</h3>
          <p className="text-xl font-bold">{patient.firstName} {patient.lastName}</p>
          <p className="text-sm">Phone: {patient.phone}</p>
          <p className="text-sm">Email: {patient.email}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-2">Insurance Info</h3>
          <p className="text-lg font-semibold">{card.insuranceCompany || "Private Pay"}</p>
        </div>
      </div>

      {/* Prescription Grid */}
      <div className="mb-10">
        <h3 className="text-xs font-black text-indigo-600 uppercase mb-3 tracking-widest text-center">Clinical Prescription</h3>
        <table className="w-full border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 p-2 text-xs uppercase">Eye</th>
              <th className="border border-slate-200 p-2 text-xs uppercase">Sph</th>
              <th className="border border-slate-200 p-2 text-xs uppercase">Cyl</th>
              <th className="border border-slate-200 p-2 text-xs uppercase">Axis</th>
              <th className="border border-slate-200 p-2 text-xs uppercase">Prism</th>
              <th className="border border-slate-200 p-2 text-xs uppercase">Base</th>
            </tr>
          </thead>
          <tbody className="text-center font-mono">
            <tr>
              <td className="border border-slate-200 p-3 font-sans font-bold text-left">Right (OD)</td>
              <td className="border border-slate-200 p-3">{card.rSph}</td>
              <td className="border border-slate-200 p-3">{card.rCyl}</td>
              <td className="border border-slate-200 p-3">{card.rAxis}</td>
              <td className="border border-slate-200 p-3">{card.rPrism}</td>
              <td className="border border-slate-200 p-3">{card.rBase}</td>
            </tr>
            <tr>
              <td className="border border-slate-200 p-3 font-sans font-bold text-left">Left (OS)</td>
              <td className="border border-slate-200 p-3">{card.lSph}</td>
              <td className="border border-slate-200 p-3">{card.lCyl}</td>
              <td className="border border-slate-200 p-3">{card.lAxis}</td>
              <td className="border border-slate-200 p-3">{card.lPrism}</td>
              <td className="border border-slate-200 p-3">{card.lBase}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-bold">Ksh {Number(card.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Advance Paid:</span>
            <span className="font-bold text-emerald-600">- Ksh {Number(card.advance).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-3 bg-slate-50 px-2 rounded-lg">
            <span className="font-black uppercase text-xs text-slate-400">Balance Due:</span>
            <span className="font-black text-rose-600 text-lg">Ksh {Number(card.balance).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs">
        <p>This is a computer-generated invoice. No signature required.</p>
        <p className="mt-1 font-bold">Thank you for choosing Eye Optics</p>
      </div>
    </div>
  );
});