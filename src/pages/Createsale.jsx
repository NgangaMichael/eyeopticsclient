import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Box, Trash2, ShoppingCart, User } from 'lucide-react';
import { stockService } from "../api/services/stockService";
import { saleService } from "../api/services/saleService";
import { customerService } from "../api/services/customerService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Createsale() {
  const [stocks, setStocks] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [sphSearch, setSphSearch] = useState('');
  const [cylSearch, setCylSearch] = useState('');
  const [indexSearch, setIndexSearch] = useState('');

  useEffect(() => { 
    loadStocks();
    loadCustomers(); // New fetch
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error("Failed to load customer list");
    }
  };

  useEffect(() => { loadStocks(); }, []);

  const loadStocks = async () => {
    try {
      const data = await stockService.getAllStocks();
      setStocks(data);
    } catch {
      toast.error("Failed to load inventory data");
    }
  };

  // Add item to cart logic
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      toast.info("Item already in cart. Adjust quantity on the right.");
      return;
    }
    if (item.qty <= 0) {
      toast.error("Item out of stock");
      return;
    }
    setCart([...cart, { ...item, cartQty: 1, cartPrice: item.wholesalePrice }]);
  };

  const updateCartQty = (id, newQty, maxQty, type) => {
    const isLens = type?.toLowerCase() === 'lens';
    const parsedQty = parseFloat(newQty) || 0;
    
    // 1. Determine the increment step based on type
    // If it's a frame, we force it to a whole number (Integer)
    // If it's a lens, we allow the decimal provided
    let val = parsedQty;
    
    if (!isLens) {
      val = Math.round(parsedQty); // Force frames to 1, 2, 3...
    }

    // 2. Keep the bounds between 0 and stock max
    const finalVal = Math.max(0, Math.min(val, maxQty));
    
    if (parsedQty > maxQty) toast.warning(`Only ${maxQty} units available`);
    
    setCart(cart.map(item => item.id === id ? { ...item, cartQty: finalVal } : item));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.cartQty * item.cartPrice), 0);
  };

  const handleFinalSubmit = async () => {
    if (!customerId) return toast.error("Please enter a Customer ID");
    if (!referenceNumber) return toast.error("Please enter a Reference Number");
    if (cart.length === 0) return toast.error("Cart is empty");

    try {
      const saleData = {
        customerId,
        referenceNumber,
        discount: parseFloat(discount) || 0,
        items: cart.map(item => ({
          stockId: item.id,
          quantity: item.cartQty,
          price: item.cartPrice
        }))
      };
      await saleService.createSale(saleData);
      toast.success("Sale completed successfully!");
      setCart([]);
      setDiscount(0);
      setCustomerId('');
      setReferenceNumber('');
      loadStocks();
    } catch (err) {
      toast.error("Failed to process sale");
    }
  };

  // Filter Logic
  const filteredStocks = useMemo(() => {
    return stocks.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      // SPH & CYL Filter Logic (matching your Stocks page)
      const matchesSph = sphSearch === '' || parseFloat(item.sph) === parseFloat(sphSearch);
      const matchesCyl = cylSearch === '' || parseFloat(item.cyl) === parseFloat(cylSearch);

      const matchesIndex = indexSearch === '' || 
      (item.index && item.index.toLowerCase().includes(indexSearch.toLowerCase()));

      return matchesSearch && matchesType && matchesSph && matchesCyl && matchesIndex;
    });
  }, [stocks, searchTerm, typeFilter, sphSearch, cylSearch, indexSearch]);

  const categories = useMemo(() => {
    const types = stocks.map(s => s.type).filter(Boolean);
    return [...new Set(types)];
  }, [stocks]);

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDE: Inventory Browser (60% width) */}
        <div className="lg:w-3/5 space-y-6">
          <header>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Sale</h2>
            <p className="text-slate-500">Select items from inventory</p>
          </header>

          {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text" placeholder="Search item..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* SPH Search */}
              <div className="relative">
                <input
                  type="number" step="0.25" placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                  value={sphSearch}
                  onChange={(e) => setSphSearch(e.target.value)}
                />
                <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-blue-500 uppercase">SPH</span>
              </div>

              {/* CYL Search */}
              <div className="relative">
                <input
                  type="number" step="0.25" placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
                  value={cylSearch}
                  onChange={(e) => setCylSearch(e.target.value)}
                />
                <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-emerald-500 uppercase">CYL</span>
              </div>

              {/* Index Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="1.56"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold"
                  value={indexSearch}
                  onChange={(e) => setIndexSearch(e.target.value)}
                />
                <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-purple-500 uppercase">Index</span>
              </div>

              {/* Category */}
              <div className="relative">
                <Box className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <select
                  value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
          {/* Items Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Wholesale Price</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStocks.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-[10px] font-mono text-indigo-500">{item.code}</div>
                      {/* Logic for Lens specific SPH and CYL */}
                      {item.type?.toLowerCase() === 'lens' && (item.sph !== null || item.cyl !== null) && (
                        <div className="flex items-center gap-1 bg-slate-800 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
                          <span className="text-slate-400">SPH:</span> 
                          <span>{item.sph > 0 ? `+${item.sph}` : item.sph}</span>
                          <span className="mx-1 text-slate-600">|</span>
                          <span className="text-slate-400">CYL:</span> 
                          <span>{item.cyl > 0 ? `+${item.cyl}` : item.cyl}</span>
                          <span className="mx-1 text-slate-600">|</span>
                          <span className="text-slate-400">AX:</span>
                          <span>{item.axis}°</span>
                          <span className="mx-1 text-slate-600">|</span>
                          <span className="text-slate-400">ADD:</span>
                          <span>{item.nearAdd > 0 ? `+${item.nearAdd}` : item.nearAdd}</span>
                          <span className="mx-1 text-slate-600">|</span>
                          <span className="text-slate-400">INDEX:</span>
                          <span>{item.index}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${item.qty <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {parseFloat(item.qty).toString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {Number(item.wholesalePrice).toLocaleString()} <span className="text-[10px] text-slate-400">KSH</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => addToCart(item)}
                        disabled={item.qty <= 0}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white disabled:opacity-50 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE: Cart / Checkout (40% width) */}
        <div className="lg:w-2/5">
          <div className="bg-slate-900 rounded-3xl shadow-xl flex flex-col sticky top-6 h-[calc(100vh-120px)] border border-slate-800 overflow-hidden">
            
            {/* 1. COMPACT Header: Customer & Ref on one line */}
            <div className="p-4 border-b border-slate-800 flex-none space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <ShoppingCart className="text-indigo-400" size={18} />
                  <h3 className="text-lg font-bold">Current Sale</h3>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {cart.length} Items
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Reference Number */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Reference</label>
                  <input 
                    type="text"
                    placeholder="REF-001"
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono placeholder:text-slate-600"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>

                {/* Customer Select */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Customer</label>
                  <div className="relative">
                    <select 
                      className="w-full pl-2 pr-6 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-indigo-500 appearance-none text-xs cursor-pointer"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                    >
                      <option value="">Select...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-2 pointer-events-none text-slate-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. COMPACT Scrollable Cart Items */}
            <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-900/50">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
                  <Box size={40} className="text-slate-400 mb-2" />
                  <p className="text-slate-400 text-xs">Empty Cart</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-slate-800/30 p-2 rounded-xl border border-slate-700/30">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-xs truncate leading-tight">{item.name}</h4>
                      <p className="text-indigo-400 text-[9px] font-mono">{item.code}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <input 
                          type="number"
                          step={item.type?.toLowerCase() === 'lens' ? "0.5" : "1"}
                          value={item.cartQty}
                          onChange={(e) => updateCartQty(item.id, e.target.value, item.qty, item.type)}
                          className="w-11 bg-slate-900 border border-slate-700 rounded-lg py-0.5 text-white text-center text-[11px] outline-none"
                        />
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="text-white font-bold text-[11px]">{(item.cartQty * item.cartPrice).toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. CONDENSED Footer */}
            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex-none">
              <div className="grid grid-cols-2 gap-4 items-center mb-3">
                {/* Discount Mini-Input */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-tighter">Discount:</span>
                  <input 
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full max-w-[80px] bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-right text-xs outline-none"
                  />
                </div>

                {/* Total Price display */}
                <div className="text-right">
                  <span className="block text-slate-500 text-[8px] font-bold uppercase">Final Total</span>
                  <span className="text-xl font-black text-white">
                    {(calculateSubtotal() - discount).toLocaleString()} 
                    <small className="ml-0.5 text-[9px] text-indigo-400">KSH</small>
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleFinalSubmit}
                disabled={cart.length === 0 || !customerId || !referenceNumber}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-[0.98]"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}