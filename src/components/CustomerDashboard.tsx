import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, Download, Calendar, Tag, CreditCard, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Order, User } from '../types';
import { getOrders, getAdminConfig } from '../lib/storage';

interface CustomerDashboardProps {
  currentUser: User;
  setTab: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ currentUser, setTab }) => {
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Processing' | 'Completed' | 'Cancelled'>('all');
  
  const allOrders = getOrders();
  const adminConfig = getAdminConfig();

  // Filter orders for current logged-in customer
  const customerOrders = allOrders.filter(
    (order) => order.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const filteredOrders = filter === 'all' 
    ? customerOrders 
    : customerOrders.filter(order => order.orderStatus === filter);

  const handleDownload = (photoUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = fileName || 'venky_studio_photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppLink = (order: Order) => {
    const adminPhone = adminConfig.adminPhone.replace(/[^0-9]/g, '');
    const text = `Hi Venky Digital Studio! I have a question about my Order *${order.id}*.\n\n*Order Details:*\n- Size: ${order.sizeLabel}\n- Type: ${order.type === 'frame' ? 'Photo + Frame' : 'Photo Print Only'}\n- Quantity: ${order.quantity}\n- Total: ₹${order.totalAmount}\n- Payment: ${order.paymentStatus}\n- Current Status: ${order.orderStatus}\n\nPlease help me check the status. Thank you!`;
    return `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    if (status === 'Paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          PAID
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/20">
        PENDING
      </span>
    );
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              My Orders & Status
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track your prints and frames, check payment status, and chat directly with the studio.
            </p>
          </div>
          <button
            onClick={() => setTab('order')}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-sm shadow transition flex items-center gap-2 w-fit"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Prints & Frames</span>
          </button>
        </div>

        {customerOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 px-4 bg-slate-900/30 border border-slate-800/80 rounded-3xl max-w-xl mx-auto">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mx-auto mb-6 shadow-xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">No Orders Placed Yet</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              You haven't ordered any custom prints or wooden frames yet. Upload your favorite photo and customise it now!
            </p>
            <button
              onClick={() => setTab('order')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-sm shadow-lg transition"
            >
              Order Prints & Frames Now
            </button>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-850">
              {(['all', 'Pending', 'Processing', 'Completed', 'Cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                    filter === tab
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  {tab === 'all' ? 'All Orders' : tab} ({
                    tab === 'all' 
                      ? customerOrders.length 
                      : customerOrders.filter(o => o.orderStatus === tab).length
                  })
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-semibold text-sm">
                No orders match the selected filter.
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row gap-6 hover:border-slate-700/60 transition duration-200"
                  >
                    {/* Left: Image Thumbnail */}
                    <div className="w-full md:w-40 h-40 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden relative flex items-center justify-center shrink-0">
                      {order.type === 'frame' && (
                        <div className="absolute inset-0 border-8 border-amber-900 pointer-events-none rounded-xl" />
                      )}
                      <img
                        src={order.photoUrl}
                        alt="Uploaded Photo"
                        className={`max-h-full max-w-full object-contain ${
                          order.type === 'frame' ? 'scale-[0.8] border border-white' : ''
                        }`}
                      />
                    </div>

                    {/* Right: Order details */}
                    <div className="flex-1 flex flex-col justify-between space-y-4 md:space-y-0">
                      
                      {/* Top row details */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-base sm:text-lg">{order.id}</span>
                            {getPaymentBadge(order.paymentStatus)}
                          </div>
                          <div>{getStatusBadge(order.orderStatus)}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                          <div>
                            <span className="text-slate-500 font-medium block">Size & Type:</span>
                            <span className="font-bold text-slate-200 block mt-0.5">{order.sizeLabel}</span>
                            <span className="text-slate-400 mt-0.5 block capitalize">{order.type === 'frame' ? 'Framed Photo' : 'Photo Print Only'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">Date Ordered:</span>
                            <span className="font-semibold text-slate-200 block mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">Price Details:</span>
                            <span className="font-extrabold text-cyan-400 font-mono text-sm block mt-0.5">
                              ₹{order.totalAmount}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Qty: {order.quantity} • Free Shipping</span>
                          </div>
                        </div>

                        {/* Shipping Address summary */}
                        <div className="bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/60 text-xs">
                          <span className="text-slate-500 font-medium block mb-0.5">Shipping Address:</span>
                          <p className="text-slate-300 truncate" title={`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}`}>
                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row actions */}
                      <div className="flex flex-wrap gap-2.5 pt-3 border-t border-slate-850/60 justify-end">
                        <button
                          onClick={() => handleDownload(order.photoUrl, order.fileName)}
                          className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Photo</span>
                        </button>

                        <a
                          href={getWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat with Admin (WhatsApp)</span>
                        </a>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
