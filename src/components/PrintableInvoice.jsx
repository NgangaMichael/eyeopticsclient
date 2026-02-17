import React from 'react';
import logo from '../assets/eyeopticslogo.jpeg'; 

const PrintableInvoice = React.forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  // 1. Financial Logic
  const discountAmount = Number(sale.discount || 0);
  const netTotal = Number(sale.total || 0);
  // Gross total is what the price was before the discount
  const grossTotal = netTotal + discountAmount;

  return (
    <div ref={ref} className="p-12 bg-white text-slate-800 font-sans min-h-[1050px] flex flex-col">
      {/* Top Decoration Bar - Matching Job Card Style */}
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
            <p className="text-sm font-bold text-slate-700">Ref: <span className="text-indigo-600">#S-{sale.id.toString().padStart(4, '0')}</span></p>
            <p className="text-sm text-slate-500">Date: {new Date(sale.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-16 mb-12">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest">Bill To:</h3>
          <p className="text-xl font-bold text-slate-900">{sale.customer?.name || "Walk-in Customer"}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600 font-medium">
            <p className="flex items-center gap-2"><span>📞</span> {sale.customer?.phone || 'N/A'}</p>
            {sale.customer?.email && <p className="flex items-center gap-2"><span>✉️</span> {sale.customer?.email}</p>}
            <p className="flex items-center gap-2"><span>📍</span> {sale.customer?.address || 'Nairobi, Kenya'}</p>
          </div>
        </div>
        
        <div className="border border-slate-100 p-6 rounded-3xl flex flex-col justify-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest text-right">Payment Info</h3>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700 uppercase">Status: <span className="text-emerald-600">Paid in Full</span></p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Method: Cash / Mobile Money</p>
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
          <tbody className="text-sm divide-y divide-slate-50">
            {sale.saleitem?.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-6">
                  <p className="font-bold text-slate-800">{item.stock?.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{item.stock?.code} | {item.stock?.type}</p>
                </td>
                <td className="py-6 text-center text-slate-600">{Number(item.price).toLocaleString()}</td>
                <td className="py-6 text-center text-slate-600">{item.quantity}</td>
                <td className="py-6 text-right font-bold text-slate-700">
                  {(item.quantity * item.price).toLocaleString()}
                </td>
              </tr>
            ))}
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

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs font-bold text-rose-500">
              <span>DISCOUNT</span>
              <span>- Ksh {discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="border-t border-slate-200 my-2"></div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase text-[10px] tracking-tight">Net Total</span>
            <span className="font-black text-slate-900 text-2xl">
              Ksh {netTotal.toLocaleString()}
            </span>
          </div>
          
          <div className="bg-emerald-500 text-white text-[10px] font-black uppercase text-center py-2 rounded-xl mt-4 tracking-[0.2em]">
            Official Receipt
          </div>
        </div>
      </div>

      {/* Terms & Footer - Replicating Job Card Footer */}
      <div className="mt-12 pt-12 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-12 text-[10px] text-slate-400">
          <div>
            <h4 className="font-black text-slate-600 uppercase mb-2 tracking-widest">Notice</h4>
            <p className="leading-relaxed">
              Lenses once processed cannot be returned or exchanged. Frames are covered by a 12-month manufacturer warranty. Please keep this receipt for any future adjustments or maintenance.
            </p>
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

export default PrintableInvoice;