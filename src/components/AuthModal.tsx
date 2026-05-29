import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, X, AlertCircle, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '../lib/storage';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = loginUser(email, password);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full Name is required');
      return;
    }

    if (!phone.trim()) {
      setError('Phone Number is required');
      return;
    }

    // Basic phone validation
    if (!/^\+?[0-9]{10,14}$/.test(phone.replace(/[\s-]/g, ''))) {
      setError('Please enter a valid phone number (min 10 digits)');
      return;
    }

    const newUser: User = {
      email: email.toLowerCase(),
      name,
      phone,
      password,
    };

    const res = registerUser(newUser);
    if (res.success) {
      onSuccess(newUser);
      onClose();
    } else {
      setError(res.error || 'Signup failed.');
    }
  };

  // Mock Google Sign-In
  const handleGoogleSignIn = () => {
    setError('');
    setIsGoogleLoading(true);

    setTimeout(() => {
      const mockGoogleEmail = 'venky.customer@gmail.com';
      const res = loginUser(mockGoogleEmail, undefined, true); // true indicates Google login
      setIsGoogleLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError('Google login failed.');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950">
          <span className="text-sm font-extrabold tracking-widest text-cyan-400 uppercase">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-850 rounded-xl">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'login' 
                  ? 'bg-slate-800 text-cyan-400 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'signup' 
                  ? 'bg-slate-800 text-cyan-400 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/40 text-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-slate-200 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-slate-200 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/10 transition duration-200"
              >
                Sign In
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Rohan Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-slate-200 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="rohan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-slate-200 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Phone Number (For WhatsApp Updates)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-slate-200 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-slate-200 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/10 transition duration-200"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Social Sign In Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-[1px] bg-slate-800 flex-1" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Or Continue With</span>
            <div className="h-[1px] bg-slate-800 flex-1" />
          </div>

          {/* Gmail Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-200 hover:text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 transition"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.76 1.85-1.61 2.42v2.83h2.61c1.64-1.51 2.58-3.74 2.58-6.39a11.9 11.9 0 0 0-.06-1.87Z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.61-2.83c-.72.48-1.64.77-2.67.77-2.06 0-3.8-1.39-4.42-3.26H1.81v2.93A11.99 11.99 0 0 0 12 23Z"
                />
                <path
                  fill="currentColor"
                  d="M7.58 15.02a7.18 7.18 0 0 1 0-2.28V9.81H1.81a11.97 11.99 0 0 0 0 11.19l5.77-2.93a7.17 7.17 0 0 1 0-3.05Z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11.99 11.99 0 0 0 1.81 9.81l5.77 2.93c.62-1.87 2.36-3.26 4.42-3.26Z"
                />
              </svg>
            )}
            <span>Sign In with Gmail / Google</span>
          </button>

        </div>
      </div>
    </div>
  );
};
