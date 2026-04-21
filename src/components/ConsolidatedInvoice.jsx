// components/ConsolidatedInvoice.jsx
import React from 'react';
import logo from '../assets/eyeopticslogo.jpeg';

const ConsolidatedInvoice = React.forwardRef(({ sales, customerName }, ref) => {
  if (!sales || sales.length === 0) return null;

  // 1. Flatten all items for the main table
  const allItems = sales.flatMap(sale => 
    sale.saleitem.map(item => ({
      ...item,
      parentInvoice: `#INV-${sale.id.toString().padStart(4, '0')}`,
      date: new Date(sale.createdAt).toLocaleDateString('en-GB')
    }))
  );

  // 2. Financial Calculations
  const totalNet = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount || 0), 0);
  const totalGross = totalNet + totalDiscount;

  // 3. Aggregate eTIMS Data
  const etimsReceipts = [...new Set(sales.map(s => s.etimsReceipt).filter(Boolean))];
  const totalEtimsAmount = sales.reduce((sum, s) => sum + Number(s.etimsAmount || 0), 0);

  return (
    <div ref={ref} className="p-12 bg-white text-slate-800 font-sans min-h-[1050px] flex flex-col">
      <div className="h-2 bg-indigo-600 mb-8 -mx-12 -mt-12" />

      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-20 w-20 object-contain rounded-lg" />
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Eye Optics</h1>
            <p className="text-indigo-600 font-bold text-xs tracking-widest uppercase">Statement of Account</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-light text-slate-200 uppercase tracking-tighter mb-2">Statement</h2>
          <div className="space-y-1">
             <p className="text-sm font-bold text-slate-700">Date: {new Date().toLocaleDateString('en-GB')}</p>
             <p className="text-[10px] text-slate-400 uppercase tracking-widest">{sales.length} Invoices Included</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-2 gap-16 mb-12">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest">Client Name:</h3>
          <p className="text-xl font-bold text-slate-900">{customerName}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-semibold">Consolidated Financial Summary</p>
        </div>
        <div className="border border-slate-100 p-6 rounded-3xl flex flex-col justify-center text-right">
          <p className="text-sm font-bold text-slate-700 uppercase">Payment Status</p>
          <span className="text-emerald-600 font-black text-xl uppercase">Reconciled</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
              <th className="py-4 text-left">Ref / Date</th>
              <th className="py-4 text-left">Description</th>
              <th className="py-4 text-center">Price</th>
              <th className="py-4 text-center">Qty</th>
              <th className="py-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-50">
            {allItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4">
                  <p className="font-bold text-indigo-600 text-xs">{item.parentInvoice}</p>
                  <p className="text-[10px] text-slate-400">{item.date}</p>
                </td>
                <td className="py-4">
                  <p className="font-bold text-slate-800">{item.stock?.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{item.stock?.code}</p>
                </td>
                <td className="py-4 text-center text-slate-600">{Number(item.price).toLocaleString()}</td>
                <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                <td className="py-4 text-right font-bold text-slate-700">{(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary and eTIMS Area */}
      <div className="mt-8 flex flex-col items-end gap-4">
        {/* Totals Box */}
        <div className="w-80 space-y-3 bg-slate-50 p-8 rounded-[2rem]">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>GROSS TOTAL</span>
            <span>Ksh {totalGross.toLocaleString()}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-xs font-bold text-rose-500">
              <span>TOTAL DISCOUNT</span>
              <span>- Ksh {totalDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-slate-200 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Net Total</span>
            <span className="font-black text-slate-900 text-2xl">Ksh {totalNet.toLocaleString()}</span>
          </div>
        </div>

        {/* eTIMS Consolidated Section */}
        {(etimsReceipts.length > 0 || totalEtimsAmount > 0) && (
          <div className="w-full mt-4 p-4 border-2 border-emerald-100 bg-emerald-50/30 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              Consolidated Fiscal Data
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter mb-1">eTIMS Receipts Reference</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {etimsReceipts.length > 0 ? etimsReceipts.map((rcpt, i) => (
                    <span key={i} className="font-mono text-[11px] font-bold text-slate-700">
                      {rcpt}{i !== etimsReceipts.length - 1 ? ',' : ''}
                    </span>
                  )) : <span className="text-slate-400 italic text-xs">Pending Update</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Total Reported Fiscal Amount</p>
                <p className="font-bold text-slate-700 text-lg">Ksh {totalEtimsAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-12 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-12 text-[10px] text-slate-400">
          <div>
            <h4 className="font-black text-slate-600 uppercase mb-2 tracking-widest">Statement Notice</h4>
            <p className="leading-relaxed">
              This document serves as a consolidated statement of transactions. All eTIMS data listed has been transmitted to the tax authority. Please verify individual invoice numbers for specific item warranties.
            </p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-slate-900 font-bold text-sm mb-1">Accounts Department Signature</p>
            <div className="h-10 w-48 border-b-2 border-slate-200 ml-auto mb-2"></div>
            <p className="italic font-serif text-slate-500">Eye Optics & Contact Lens Center</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ConsolidatedInvoice;