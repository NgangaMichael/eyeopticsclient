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
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [customers, setCustomers] = useState([]);

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
    setCart([...cart, { ...item, cartQty: 1, cartPrice: item.priceKsh }]);
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
    if (cart.length === 0) return toast.error("Cart is empty");

    try {
      const saleData = {
        customerId,
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
      setDiscount(0); // Reset discount
      setCustomerId('');
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
      return matchesSearch && matchesType;
    });
  }, [stocks, searchTerm, typeFilter]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text" placeholder="Search item..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Price</th>
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
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${item.qty <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {parseFloat(item.qty).toString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {Number(item.priceKsh).toLocaleString()} <span className="text-[10px] text-slate-400">KSH</span>
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
            
            {/* 1. Header & Customer Selection (Fixed Top) */}
            <div className="p-6 border-b border-slate-800 flex-none">
              <div className="flex items-center gap-3 text-white mb-6">
                <ShoppingCart className="text-indigo-400" />
                <h3 className="text-xl font-bold">Current Sale</h3>
              </div>
              
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={18} />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer text-sm"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} {c.phone ? `(${c.phone})` : ''} — {c.type}
                    </option>
                  ))}
                </select>
                {/* Custom arrow for the select dropdown */}
                <div className="absolute right-4 top-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* 2. Scrollable Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/50">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                  <Box size={48} className="text-slate-400 mb-2" />
                  <p className="text-slate-400 text-center text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                    <div className="flex-1 pr-2 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                      <p className="text-indigo-400 text-[10px] font-mono">{item.code}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <input 
                          type="number"
                          // step="0.5"
                          step={item.type?.toLowerCase() === 'lens' ? "0.5" : "1"}
                          min="0.5"
                          value={item.cartQty}
                          onChange={(e) => updateCartQty(item.id, e.target.value, item.qty, item.type)}
                          className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 text-white text-center text-xs outline-none focus:border-indigo-500"
                        />
                        <span className="text-[9px] text-slate-500 mt-1">Stock: {item.qty}</span>
                      </div>
                      <div className="text-right min-w-[70px]">
                        <p className="text-white font-bold text-xs">{(item.cartQty * item.cartPrice).toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. Footer / Totals (Fixed Bottom) */}
              <div className="p-6 bg-slate-800/80 border-t border-slate-700 flex-none">
                <div className="space-y-3 mb-4">
                  
                  {/* Subtotal Display */}
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span>SUBTOTAL</span>
                    <span>{calculateSubtotal().toLocaleString()} KSH</span>
                  </div>

                  {/* Discount Input */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Discount</span>
                    <div className="relative">
                      <input 
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-right text-sm outline-none focus:border-indigo-500"
                        placeholder="0"
                      />
                      <span className="absolute -right-2 top-1 text-[10px] text-slate-500"></span>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 my-2"></div>

                  {/* Final Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-white">
                      {(calculateSubtotal() - discount).toLocaleString()} 
                      <small className="ml-1 text-[10px] text-indigo-400 uppercase">Ksh</small>
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleFinalSubmit}
                  disabled={cart.length === 0 || !customerId}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-bold transition-all shadow-lg"
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