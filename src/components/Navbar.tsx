import React from 'react';
import { Camera, LogOut, User as UserIcon, ShieldAlert, ShoppingBag, Grid, Home } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onOpenAuth,
  isAdminLoggedIn,
  onAdminLogout,
  onOpenAdminLogin,
}) => {
  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => setTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Venky Digital Studio
              </span>
              <p className="text-[10px] text-cyan-400 tracking-widest uppercase font-bold">Premium Prints & Frames</p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentTab === 'home'
                  ? 'bg-slate-800 text-cyan-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                if (currentUser) {
                  setTab('order');
                } else {
                  onOpenAuth();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentTab === 'order'
                  ? 'bg-slate-800 text-cyan-400 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Prints & Frames</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'dashboard'
                    ? 'bg-slate-800 text-cyan-400 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>My Orders</span>
              </button>
            )}

            {isAdminLoggedIn ? (
              <button
                onClick={() => setTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'admin'
                    ? 'bg-slate-800 text-emerald-400 shadow-inner'
                    : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs text-slate-400">Welcome,</span>
                  <span className="text-sm font-bold text-slate-200">{currentUser.name}</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-full border border-slate-700 text-cyan-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/40 text-slate-400 hover:text-red-400 rounded-lg text-xs font-bold transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}

            {isAdminLoggedIn && (
              <button
                onClick={onAdminLogout}
                className="md:hidden flex items-center gap-1 px-2 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded text-xs font-semibold"
                title="Admin Logout"
              >
                <LogOut className="w-3 h-3" />
                <span>Admin Signout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar - Bottom Bar for better usability */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-850 py-2 px-4 flex justify-around items-center z-40 shadow-2xl backdrop-blur-lg">
        <button
          onClick={() => setTab('home')}
          className={`flex flex-col items-center gap-1 p-1 text-xs ${
            currentTab === 'home' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              setTab('order');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center gap-1 p-1 text-xs ${
            currentTab === 'order' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Order</span>
        </button>

        {currentUser && (
          <button
            onClick={() => setTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-1 text-xs ${
              currentTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Orders</span>
          </button>
        )}

        {isAdminLoggedIn && (
          <button
            onClick={() => setTab('admin')}
            className={`flex flex-col items-center gap-1 p-1 text-xs ${
              currentTab === 'admin' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
};
