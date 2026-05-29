import { useState, useEffect } from 'react';
import { initializeStorage, getCurrentUser, setCurrentUser } from './lib/storage';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CustomerPortal } from './components/CustomerPortal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Sparkles, ShoppingBag, CheckCircle, ArrowRight, ShieldCheck, PhoneCall, Heart } from 'lucide-react';

function App() {
  const [currentTab, setTab] = useState<string>('home');
  const [currentUser, setSessionUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Order Success Screen State
  const [showOrderSuccess, setShowOrderSuccess] = useState<boolean>(false);

  // Initialize storage and load current user session on mount
  useEffect(() => {
    initializeStorage();
    const user = getCurrentUser();
    if (user) {
      setSessionUser(user);
    }

    const adminSession = localStorage.getItem('venky_studio_admin_session');
    if (adminSession === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Customer Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setSessionUser(null);
    setTab('home');
  };

  // Customer Login Success
  const handleAuthSuccess = (user: User) => {
    setSessionUser(user);
    setTab('order'); // Take them directly to the order wizard
  };

  // Admin Login Success
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('venky_studio_admin_session', 'true');
    setTab('admin'); // Take them to admin dashboard
  };

  // Admin Logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('venky_studio_admin_session');
    if (currentTab === 'admin') {
      setTab('home');
    }
  };

  // Handle successful order creation
  const handleOrderSuccess = () => {
    setShowOrderSuccess(true);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Navbar Component */}
      <Navbar
        currentTab={currentTab}
        setTab={(tab) => {
          setTab(tab);
          setShowOrderSuccess(false); // Reset success screen on tab change
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Main Content Render */}
      <main className="flex-1">
        {showOrderSuccess ? (
          /* GORGEOUS CONGRATULATIONS / ORDER SUCCESS SCREEN */
          <div className="max-w-xl mx-auto py-20 px-4 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Order Confirmed!
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed">
              Thank you for choosing <strong className="text-white">Venky Digital Studio</strong>! Your payment was processed successfully via Razorpay. We are already preparing your premium prints.
            </p>

            <div className="mt-8 p-6 bg-slate-900/60 border border-slate-850 rounded-2xl text-left space-y-4 max-w-md mx-auto">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">Next Steps</span>
              
              <div className="flex gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 bg-slate-850 rounded-full flex items-center justify-center font-bold text-cyan-400 shrink-0">1</div>
                <p>Track your order status and details anytime in your personal dashboard.</p>
              </div>

              <div className="flex gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 bg-slate-850 rounded-full flex items-center justify-center font-bold text-cyan-400 shrink-0">2</div>
                <p>Our expert designers will perform professional color-correction on your uploaded photo before printing.</p>
              </div>

              <div className="flex gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 bg-slate-850 rounded-full flex items-center justify-center font-bold text-cyan-400 shrink-0">3</div>
                <p>You will receive a confirmation message from our studio team on WhatsApp shortly.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={() => {
                  setShowOrderSuccess(false);
                  setTab('dashboard');
                }}
                className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg transition"
              >
                Go to My Dashboard
              </button>
              <button
                onClick={() => {
                  setShowOrderSuccess(false);
                  setTab('order');
                }}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold rounded-xl text-sm transition"
              >
                Order Another Print
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR TABS RENDER */
          <>
            {currentTab === 'home' && (
              <Hero
                onStartOrder={() => setTab('order')}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {currentTab === 'order' && currentUser && (
              <CustomerPortal
                currentUser={currentUser}
                onOrderSuccess={handleOrderSuccess}
                setTab={setTab}
              />
            )}

            {currentTab === 'dashboard' && currentUser && (
              <CustomerDashboard
                currentUser={currentUser}
                setTab={setTab}
              />
            )}

            {currentTab === 'admin' && isAdminLoggedIn && (
              <AdminPortal
                onLogout={handleAdminLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-slate-400 font-semibold">
            <span>Venky Digital Studio</span>
            <span>•</span>
            <span>Est. 2012</span>
          </div>
          <p>© {new Date().getFullYear()} Venky Digital Studio. All Rights Reserved. Crafted with passion for premium photography.</p>
          <p className="text-[10px] text-slate-600">Secure Payments via Razorpay • Handcrafted Wooden Frames • Ultra HD Giclée Prints</p>
        </div>
      </footer>

      {/* Floating WhatsApp Widget */}
      <WhatsAppButton />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

    </div>
  );
}

export default App;
