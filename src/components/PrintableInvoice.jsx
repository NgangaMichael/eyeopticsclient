import React from 'react';

const PrintableInvoice = React.forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  return (
    <div ref={ref} className="p-10 bg-white text-slate-800 font-sans" style={{ minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-indigo-600 tracking-tight">PERSONAL EYE OPTICS</h1>
          <p className="text-sm text-slate-500 mt-1">Premium Eye Care & Eyewear</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-800">INVOICE</h2>
          <p className="font-mono text-slate-500">#INV-{sale.id.toString().padStart(4, '0')}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mt-10">
        <div>
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Billed To:</h3>
          <p className="font-bold text-lg">{sale.customer?.name || "Walk-in Customer"}</p>
          <p className="text-slate-600">{sale.customer?.phone}</p>
          <p className="text-slate-600">{sale.customer?.email}</p>
          <p className="text-slate-600 w-48">{sale.customer?.address}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Invoice Details:</h3>
          <p className="text-slate-600"><span className="font-semibold">Date:</span> {new Date(sale.createdAt).toLocaleDateString()}</p>
          <p className="text-slate-600"><span className="font-semibold">Currency:</span> KSH</p>
          <p className="text-slate-600"><span className="font-semibold">Status:</span> Paid</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mt-12 text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-y border-slate-200">
            <th className="px-4 py-3 text-sm font-bold uppercase text-slate-600">Item Description</th>
            <th className="px-4 py-3 text-sm font-bold uppercase text-slate-600 text-center">Qty</th>
            <th className="px-4 py-3 text-sm font-bold uppercase text-slate-600 text-right">Unit Price</th>
            <th className="px-4 py-3 text-sm font-bold uppercase text-slate-600 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {/* UPDATED: Changed sale.items to sale.saleitem */}
          {sale.saleitem?.map((item, idx) => (
            <tr key={idx}>
              <td className="px-4 py-5">
                <p className="font-bold text-slate-800">{item.stock?.name}</p>
                <p className="text-xs text-slate-400">{item.stock?.code} | {item.stock?.type}</p>
              </td>
              <td className="px-4 py-5 text-center text-slate-600">{item.quantity}</td>
              <td className="px-4 py-5 text-right text-slate-600">{Number(item.price).toLocaleString()}</td>
              <td className="px-4 py-5 text-right font-bold text-slate-800">
                {(item.quantity * item.price).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-8 flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{Number(sale.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax (0%)</span>
            <span>0.00</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-black text-indigo-600">
            <span>Total</span>
            <span>{Number(sale.total).toLocaleString()} KSH</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 border-t border-slate-100 pt-8 text-center">
        <p className="text-slate-500 text-sm">Thank you for choosing Eye Optics for your vision needs.</p>
        <p className="text-xs text-slate-400 mt-2">This is a computer-generated invoice. No signature required.</p>
      </div>
    </div>
  );
});

export default PrintableInvoice;