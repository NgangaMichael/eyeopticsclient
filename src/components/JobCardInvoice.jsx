import React from 'react';
import logo from '../assets/eyeopticslogo.jpeg'; 

const JobCardInvoice = React.forwardRef(({ card, patient }, ref) => {
  if (!card || !patient) return null;

  // Convert to numbers safely for calculations
  const consultation = Number(card.consultation || 0);
  const lPrice = Number(card.lensPrice || 0);
  const lQty = Number(card.lensQty || 0);
  const fPrice = Number(card.framePrice || 0);
  const fQty = Number(card.frameQty || 0);

  return (
    <div ref={ref} className="p-12 bg-white text-slate-800 font-sans min-h-[1050px] flex flex-col">
      {/* Top Decoration */}
      <div className="h-2 bg-indigo-600 mb-8 -mx-12 -mt-12" />

      {/* Header Section */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-4">
          <img 
            src={logo} 
            alt="Eye Optics Logo" 
            className="h-20 w-20 object-contain rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Eye Optics</h1>
            <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Vision Care Excellence</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-light text-slate-200 uppercase tracking-tighter mb-2">Invoice</h2>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">Job Card: <span className="text-indigo-600">#{card.jobCardNumber}</span></p>
            <p className="text-sm text-slate-500">Date: {new Date(card.date).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-16 mb-12">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest">Bill To:</h3>
          <p className="text-xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600 font-medium">
            <p className="flex items-center gap-2"><span>📞</span> {patient.phone}</p>
            {patient.email && <p className="flex items-center gap-2"><span>✉️</span> {patient.email}</p>}
            {patient.address && <p className="flex items-center gap-2"><span>📍</span> {patient.address}</p>}
          </div>
        </div>
        
        <div className="border border-slate-100 p-6 rounded-3xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest text-right">Prescription (RX)</h3>
          <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
            <div className="bg-white p-2 rounded-lg border border-slate-50">
              <p className="font-bold text-indigo-600 border-b mb-1">RIGHT (OD)</p>
              <p>SPH: {card.rSph || '0.00'}</p>
              <p>CYL: {card.rCyl || '0.00'}</p>
              <p>AXIS: {card.rAxis || '0'}°</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-50">
              <p className="font-bold text-indigo-600 border-b mb-1">LEFT (OS)</p>
              <p>SPH: {card.lSph || '0.00'}</p>
              <p>CYL: {card.lCyl || '0.00'}</p>
              <p>AXIS: {card.lAxis || '0'}°</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="flex-grow">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
              <th className="py-4 text-left">Description</th>
              <th className="py-4 text-center">Unit Price</th>
              <th className="py-4 text-center">Qty</th>
              <th className="py-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {/* 1. Consultation */}
            {consultation > 0 && (
              <tr className="border-b border-slate-50">
                <td className="py-6">
                  <p className="font-bold text-slate-800">Professional Consultation</p>
                  <p className="text-xs text-slate-500">Optometric examination & refraction</p>
                </td>
                <td className="py-6 text-center text-slate-600">{consultation.toLocaleString()}</td>
                <td className="py-6 text-center text-slate-600">1</td>
                <td className="py-6 text-right font-bold text-slate-700">{consultation.toLocaleString()}</td>
              </tr>
            )}

            {/* 2. Lenses */}
            {card.lenses && (
              <tr className="border-b border-slate-50">
                <td className="py-6">
                  <p className="font-bold text-slate-800">Lens: {card.lenses}</p>
                  <p className="text-xs text-slate-500">Custom optical lenses as per prescription</p>
                </td>
                <td className="py-6 text-center text-slate-600">{lPrice.toLocaleString()}</td>
                <td className="py-6 text-center text-slate-600">{lQty}</td>
                <td className="py-6 text-right font-bold text-slate-700">{(lPrice * lQty).toLocaleString()}</td>
              </tr>
            )}

            {/* 3. Frames */}
            {card.frame && (
              <tr className="border-b border-slate-50">
                <td className="py-6">
                  <p className="font-bold text-slate-800">Frame: {card.frame}</p>
                  <p className="text-xs text-slate-500">Selected optical frame</p>
                </td>
                <td className="py-6 text-center text-slate-600">{fPrice.toLocaleString()}</td>
                <td className="py-6 text-center text-slate-600">{fQty}</td>
                <td className="py-6 text-right font-bold text-slate-700">{(fPrice * fQty).toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end mt-8">
        <div className="w-80 space-y-3 bg-slate-50 p-8 rounded-[2rem]">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-slate-500 uppercase tracking-tight">Grand Total</span>
            <span className="font-black text-slate-900 text-lg">Ksh {Number(card.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-600 border-t border-slate-200 pt-3">
            <span className="font-bold uppercase tracking-tight">Amount Paid</span>
            <span className="font-black">Ksh {Number(card.advance).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg text-white bg-rose-500 p-4 rounded-2xl shadow-lg shadow-rose-200">
            <span className="font-black uppercase text-xs self-center">Balance Due</span>
            <span className="font-black">Ksh {Number(card.balance).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms & Footer */}
      <div className="mt-12 pt-12 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-12 text-[10px] text-slate-400">
          <div>
            <h4 className="font-black text-slate-600 uppercase mb-2 tracking-widest">Terms & Conditions</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Lenses once processed cannot be returned or exchanged.</li>
              <li>Warranty covers manufacturing defects only.</li>
              <li>Balance must be cleared upon collection.</li>
            </ul>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-slate-900 font-bold text-sm mb-1">Authorized Official Signature</p>
            <div className="h-10 w-48 border-b-2 border-slate-200 ml-auto mb-2"></div>
            <p className="italic font-serif text-slate-500">Eye Optics & Contact Lens Center</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
            Quality Eye Care &bull; Nairobi &bull; Kenya
          </p>
        </div>
      </div>
    </div>
  );
});

export default JobCardInvoice;