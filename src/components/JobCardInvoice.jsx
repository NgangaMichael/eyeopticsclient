import React from 'react';
import logo from '../assets/eyeopticslogo.jpeg'; 

const JobCardInvoice = React.forwardRef(({ card, patient }, ref) => {
  if (!card || !patient) return null;

  // Convert to numbers safely for calculations
  const consultation = Number(card.consultation || 0);
  
  // Lens Prices (Each representing 0.5 of a pair)
  const rLensPrice = Number(card.rLensPrice || 0);
  const lLensPrice = Number(card.lLensPrice || 0);
  
  // Frame Details
  const fPrice = Number(card.framePrice || 0);
  const fQty = Number(card.frameQty || 0);
  
  // Financials
  const discount = Number(card.discount || 0);
  const total = Number(card.total || 0);
  const advance = Number(card.advance || 0);
  const balance = Number(card.balance || 0);

  // Calculate gross total: Sum of lenses + (frame price * qty) + consultation
  const grossTotal = consultation + rLensPrice + lLensPrice + (fPrice * fQty);

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
            <p className="flex items-center gap-2"><span>💳</span> {card.insuranceCompany || "Private Pay"}</p>
          </div>
        </div>
        
        <div className="border border-slate-100 p-6 rounded-3xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest text-right">Prescription (RX)</h3>
          <table className="w-full text-[10px] font-mono border-collapse">
            <thead>
              <tr className="border-b text-slate-400">
                <th className="text-left font-normal pb-1">Eye</th>
                <th className="pb-1">SPH</th>
                <th className="pb-1">CYL</th>
                <th className="pb-1">AXIS</th>
                <th className="pb-1">PRISM</th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr className="border-b border-slate-50">
                <td className="text-left font-bold py-2">OD (R)</td>
                <td>{card.rSph || '0.00'}</td>
                <td>{card.rCyl || '0.00'}</td>
                <td>{card.rAxis ? `${card.rAxis}°` : '-'}</td>
                <td>{card.rPrism || '-'}</td>
              </tr>
              <tr>
                <td className="text-left font-bold py-2">OS (L)</td>
                <td>{card.lSph || '0.00'}</td>
                <td>{card.lCyl || '0.00'}</td>
                <td>{card.lAxis ? `${card.lAxis}°` : '-'}</td>
                <td>{card.lPrism || '-'}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between text-[9px] font-bold text-slate-500 uppercase">
             <span>Near Add: {card.nearAdd || '-'}</span>
             <span>Dist PD: {card.distPd || '-'}</span>
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
                  <p className="text-xs text-slate-500">Eye examination and vision assessment</p>
                </td>
                <td className="py-6 text-center text-slate-600">{consultation.toLocaleString()}</td>
                <td className="py-6 text-center text-slate-600">1</td>
                <td className="py-6 text-right font-bold text-slate-700">{consultation.toLocaleString()}</td>
              </tr>
            )}

            {/* 2. Right Lens */}
            {card.rLens && (
              <tr className="border-b border-slate-50">
                <td className="py-6">
                  <p className="font-bold text-slate-800">Lens (Right): {card.rLens}</p>
                  <p className="text-xs text-slate-500">Individual prescription lens (OD)</p>
                </td>
                <td className="py-6 text-center text-slate-600">{rLensPrice.toLocaleString()}</td>
                <td className="py-6 text-center text-slate-600">0.5</td>
                <td className="py-6 text-right font-bold text-slate-700">{rLensPrice.toLocaleString()}</td>
              </tr>
            )}

            {/* 3. Left Lens */}
            {card.lLens && (
              <tr className="border-b border-slate-50">
                <td className="py-6">
                  <p className="font-bold text-slate-800">Lens (Left): {card.lLens}</p>
                  <p className="text-xs text-slate-500">Individual prescription lens (OS)</p>
                </td>
                <td className="py-6 text-center text-slate-600">{lLensPrice.toLocaleString()}</td>
                <td className="py-6 text-center text-slate-600">0.5</td>
                <td className="py-6 text-right font-bold text-slate-700">{lLensPrice.toLocaleString()}</td>
              </tr>
            )}

            {/* 4. Frames */}
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
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>GROSS TOTAL</span>
            <span>Ksh {grossTotal.toLocaleString()}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-xs font-bold text-rose-500">
              <span>DISCOUNT</span>
              <span>- Ksh {discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-500 uppercase tracking-tight">Net Total</span>
            <span className="font-black text-slate-900 text-lg">Ksh {total.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm text-emerald-600">
            <span className="font-bold uppercase tracking-tight">Amount Paid</span>
            <span className="font-black">Ksh {advance.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-lg text-white bg-rose-500 p-4 rounded-2xl shadow-lg shadow-rose-200 mt-4">
            <span className="font-black uppercase text-xs self-center">Balance Due</span>
            <span className="font-black">Ksh {balance.toLocaleString()}</span>
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
              <li>Balance must be cleared upon collection of eyewear.</li>
              <li>Collection Date: <span className="font-bold text-slate-600">{card.jobDelDate ? new Date(card.jobDelDate).toLocaleDateString('en-GB') : 'To be advised'}</span></li>
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