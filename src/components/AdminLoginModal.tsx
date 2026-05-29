import React, { useState } from 'react';
import { ShieldAlert, Lock, User as UserIcon, X, AlertCircle } from 'lucide-react';
import { getAdminPassword } from '../lib/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const savedPassword = getAdminPassword();

    if (username.trim().toLowerCase() !== 'admin') {
      setError('Invalid admin username. Default is "admin".');
      return;
    }

    if (password !== savedPassword) {
      setError('Invalid admin password. Default is "password".');
      return;
    }

    // Success
    onLoginSuccess();
    onClose();
    setUsername('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-[380px] rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-extrabold tracking-wider uppercase">Admin Portal Auth</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-400 text-xs leading-relaxed mb-2">
            Access restricted to authorized personnel. Use default username <strong className="text-slate-200 font-bold">"admin"</strong> and password <strong className="text-slate-200 font-bold">"password"</strong> if logging in for the first time.
          </p>

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/40 text-red-200 rounded-xl text-xs flex items-center gap-2 animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">Admin Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-200 transition"
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-200 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition duration-200 mt-2"
          >
            Sign In to Admin Panel
          </button>
        </form>

      </div>
    </div>
  );
};
