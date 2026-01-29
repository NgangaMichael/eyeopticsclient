import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from "../api/services/authService";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../assets/eyeopticslogo.jpeg";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    await authService.login({ email, password });

    // ✅ Show success toast
    toast.success("Login successful!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });

    // Navigate after short delay so toast is visible
    setTimeout(() => {
      navigate("/dashboard/overview");
    }, 500);
    
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";

      // ✅ Show error toast
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row items-center gap-12 p-6">
        
        {/* Left Side: Brand Story */}
        <div className="w-full md:w-1/2 text-white space-y-6">
          <div className="">
          <img
            src={Logo}
            alt="EyeOptics Logo"
            className="w-32 h-32 object-contain"
          />
        </div>
     
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Personal Eye, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Optics.
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-md">
            The all-in-one workspace for EyeOptics specialists. Seamlessly manage diagnostics, style consultations, and inventory.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-md">
            <Sparkles size={14} />
            <span>Next-Gen Optical Management</span>
          </div>
        </div>

        {/* Right Side: Glass Login Card */}
        <div className="w-full md:w-[450px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Staff Portal</h2>
              <p className="text-slate-400 text-sm mt-1">Authenticate to access Dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    placeholder="name@eyeoptics.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* <div className="flex justify-end">
                <button type="button" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </button>
              </div> */}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-slate-500 text-sm text-center mt-4">
                &copy; {new Date().getFullYear()} Powered by{' '}
                <a
                  href="https://aptech.co.ke/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:underline"
                >
                  AP tech Kenya
                </a>
                . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;