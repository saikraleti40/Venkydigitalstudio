import React from 'react';
import { Sparkles, ShieldCheck, Image, Heart, Instagram, Mail, Phone, MessageCircle } from 'lucide-react';
import { SizePrice, AdminConfig, User } from '../types';
import { getAdminConfig, getSizes } from '../lib/storage';

interface HeroProps {
  onStartOrder: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartOrder, currentUser, onOpenAuth }) => {
  const sizes: SizePrice[] = getSizes();
  const config: AdminConfig = getAdminConfig();

  const handleCTAClick = () => {
    if (currentUser) {
      onStartOrder();
    } else {
      onOpenAuth();
    }
  };

  return (
    <div className="relative bg-slate-950 text-white min-h-screen pb-16">
      
      {/* Background Banner */}
      <div className="relative h-[480px] sm:h-[560px] md:h-[620px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 transform hover:scale-105" style={{ backgroundImage: "url('/images/studio-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Photo Studio & Framing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Preserve Your Memories in <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Stunning High Definition
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed font-medium">
            At <strong className="text-white font-bold">Venky Digital Studio</strong>, we transform your digital photos into premium gallery-quality prints and elegant handcrafted wooden frames.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
            <button
              onClick={handleCTAClick}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold rounded-xl shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-[1.03] text-base"
            >
              Order Prints & Frames Now
            </button>
            {!currentUser && (
              <button
                onClick={onOpenAuth}
                className="px-8 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold rounded-xl transition-all duration-300 text-base"
              >
                Sign In to Get Started
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        
        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl h-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1.5">Premium Quality</h4>
              <p className="text-sm text-slate-400 leading-relaxed">We use ultra-premium 300 GSM glossy/matte photo paper and durable premium wood frames designed to last a lifetime.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl h-fit">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1.5">Custom Sizing</h4>
              <p className="text-sm text-slate-400 leading-relaxed">From compact passport size to massive exhibition posters, we offer a wide range of custom sizes to fit your walls perfectly.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl h-fit">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1.5">Handcrafted Frames</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Every frame is custom-tailored and assembled by our experienced artisans to complement and protect your photograph.</p>
            </div>
          </div>
        </div>

        {/* Sizes and Pricing Table */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-3">
              Standard Sizes & Direct Pricing
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Explore our standard sizes. We offer standalone high-definition photo prints as well as professional framing services in Indian Rupees (INR).
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Photo Size</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Dimensions (Inches / CM)</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Photo Print Only</th>
                    <th className="py-4.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Photo + Premium Frame</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sizes.map((size) => (
                    <tr key={size.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-5 px-6">
                        <span className="font-bold text-slate-200 block text-sm sm:text-base">{size.label}</span>
                      </td>
                      <td className="py-5 px-6 text-sm text-slate-400 font-medium">
                        {size.dimensions}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="font-mono font-bold text-cyan-400 text-base">₹{size.photoPrice}</span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="font-mono font-bold text-emerald-400 text-base">₹{size.framePrice}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 bg-slate-900/30 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                All prices are inclusive of professional color correction and mounting.
              </span>
              <button
                onClick={handleCTAClick}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
              >
                Upload & Customise Now →
              </button>
            </div>
          </div>
        </div>

        {/* Contact Admin Info Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-extrabold text-white mb-3">Need Custom Sizing or Bulk Orders?</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Our support desk is always active. If you have unique requirements, bespoke frame designs, or bulk corporate printing requests, please contact our administrator directly. We are happy to help!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`mailto:${config.adminEmail}`}
                  className="flex items-center gap-3 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl hover:bg-slate-850 transition group"
                >
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg group-hover:bg-cyan-500/20 transition">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Email Admin</span>
                    <span className="text-xs font-semibold text-slate-300 truncate block">{config.adminEmail}</span>
                  </div>
                </a>

                <a
                  href={`https://instagram.com/${config.adminInstagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-pink-500/40 rounded-xl hover:bg-slate-850 transition group"
                >
                  <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg group-hover:bg-pink-500/20 transition">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Instagram</span>
                    <span className="text-xs font-semibold text-slate-300 block">@{config.adminInstagram}</span>
                  </div>
                </a>

                <a
                  href={`tel:${config.adminPhone}`}
                  className="flex items-center gap-3 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-xl hover:bg-slate-850 transition group"
                >
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-50/20 transition">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Phone Call</span>
                    <span className="text-xs font-semibold text-slate-300 block">{config.adminPhone}</span>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${config.adminPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl hover:bg-slate-850 transition group"
                >
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-50/20 transition">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">WhatsApp Chat</span>
                    <span className="text-xs font-semibold text-slate-300 block">{config.adminPhone}</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-[260px] sm:h-[320px] shadow-2xl">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80')" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Featured Frame</span>
                <h4 className="text-lg font-bold text-white mt-2">Venky Premium Oak Wood Frames</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">Hand-crafted, glass-protected, and ready to hang. Made with sustainable materials.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
