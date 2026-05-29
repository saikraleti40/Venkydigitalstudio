import React, { useState } from 'react';
import { Shield, LayoutDashboard, Settings, DollarSign, ShoppingBag, Clock, CheckCircle2, Search, MessageSquare, Download, Eye, Edit2, Check, X, ShieldAlert, Key, User, Instagram, Phone, Mail, Trash2 } from 'lucide-react';
import { Order, SizePrice, AdminConfig } from '../types';
import { getOrders, updateOrderStatus, getAdminConfig, updateAdminConfig, getAdminPassword, updateAdminPassword, getSizes, updateSizes } from '../lib/storage';

interface AdminPortalProps {
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'prices' | 'settings'>('dashboard');
  
  // Data State
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [sizes, setSizes] = useState<SizePrice[]>(getSizes());
  const [config, setConfig] = useState<AdminConfig>(getAdminConfig());

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Admin Config State
  const [emailInput, setEmailInput] = useState(config.adminEmail);
  const [phoneInput, setPhoneInput] = useState(config.adminPhone);
  const [instaInput, setInstaInput] = useState(config.adminInstagram);
  const [rzpKeyInput, setRzpKeyInput] = useState(config.razorpayKeyId);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Editing Prices State
   const [editingSizeId, setEditingSizeId] = useState<string | null>(null);
  const [editSizeLabel, setEditSizeLabel] = useState<string>('');
  const [editSizeDimensions, setEditSizeDimensions] = useState<string>('');
  const [editPhotoPrice, setEditPhotoPrice] = useState<number>(0);
  const [editFramePrice, setEditFramePrice] = useState<number>(0);

   // Adding New Size State
  const [showAddSizeForm, setShowAddSizeForm] = useState<boolean>(false);
  const [newSizeLabel, setNewSizeLabel] = useState<string>('');
  const [newSizeDimensions, setNewSizeDimensions] = useState<string>('');
  const [newSizePhotoPrice, setNewSizePhotoPrice] = useState<number>(100);
  const [newSizeFramePrice, setNewSizeFramePrice] = useState<number>(300);

  // Refresh orders from storage
  const refreshOrders = () => {
    setOrders(getOrders());
  };

  // Calculate Metrics
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'Completed').length;

  // Handle Order Status Change
  const handleStatusChange = (orderId: string, newStatus: Order['orderStatus']) => {
    const success = updateOrderStatus(orderId, newStatus);
    if (success) {
      refreshOrders();
    }
  };

  // Direct Admin-to-Customer WhatsApp Link
  const getCustomerWhatsAppLink = (order: Order) => {
    // Strip non-numeric characters for phone link (e.g. +91 98765 43210 -> 919876543210)
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const text = `Hi ${order.customerName}! This is Venky Digital Studio. We are reaching out regarding your Order *${order.id}*.\n\n*Order Details:*\n- Size: ${order.sizeLabel}\n- Type: ${order.type === 'frame' ? 'Framed Photo' : 'Photo Print Only'}\n- Grand Total: ₹${order.totalAmount}\n- Payment: ${order.paymentStatus}\n\nWe have received your photo and we are working on it. Let us know if you have any questions!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Handle Download Photo
  const handleDownload = (photoUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = fileName || 'customer_photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Password Change
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const savedPassword = getAdminPassword();
    if (currentPassword !== savedPassword) {
      setPasswordError('Current password is incorrect');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    updateAdminPassword(newPassword);
    setPasswordSuccess('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Handle Admin Config Submit
  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess(false);

    const updatedConfig: AdminConfig = {
      adminEmail: emailInput,
      adminPhone: phoneInput,
      adminInstagram: instaInput,
      razorpayKeyId: rzpKeyInput,
    };

    updateAdminConfig(updatedConfig);
    setConfig(updatedConfig);
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  // Edit Prices
   const startEditingSize = (size: SizePrice) => {
    setEditingSizeId(size.id);
    setEditSizeLabel(size.label);
    setEditSizeDimensions(size.dimensions);
    setEditPhotoPrice(size.photoPrice);
    setEditFramePrice(size.framePrice);
  };

  const saveSizeEdit = (id: string) => {
    if (!editSizeLabel.trim() || !editSizeDimensions.trim()) return;

    const updatedSizes = sizes.map(size => {
      if (size.id === id) {
        return {
          ...size,
          label: editSizeLabel,
          dimensions: editSizeDimensions,
          photoPrice: editPhotoPrice,
          framePrice: editFramePrice,
        };
      }
      return size;
    });

    updateSizes(updatedSizes);
    setSizes(updatedSizes);
    setEditingSizeId(null);
  };

  const handleAddSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeLabel.trim() || !newSizeDimensions.trim()) return;

    const newSize: SizePrice = {
      id: `size-${Date.now()}`,
      label: newSizeLabel,
      dimensions: newSizeDimensions,
      photoPrice: newSizePhotoPrice,
      framePrice: newSizeFramePrice,
    };

    const updatedSizes = [...sizes, newSize];
    updateSizes(updatedSizes);
    setSizes(updatedSizes);
    // Reset Form
    setNewSizeLabel('');
    setNewSizeDimensions('');
    setNewSizePhotoPrice(100);
    setNewSizeFramePrice(300);
    setShowAddSizeForm(false);
  };

  const handleDeleteSize = (id: string) => {
    if (confirm('Are you sure you want to delete this size option? This cannot be undone.')) {
      const updatedSizes = sizes.filter(size => size.id !== id);
      updateSizes(updatedSizes);
      setSizes(updatedSizes);
    }
  };

  // Filter and Search Orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">Venky Digital Studio Management Portal</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-red-950/40 hover:border-red-900/40 text-slate-300 hover:text-red-400 font-bold rounded-xl text-sm transition"
          >
            Logout Admin Portal
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-850 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Stats</span>
          </button>

          <button
            onClick={() => { setActiveTab('orders'); refreshOrders(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Queue ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prices')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'prices'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Manage Sizes & Prices</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Studio Contacts & Security</span>
          </button>
        </div>

        {/* ==================================== */}
        {/* TAB 1: DASHBOARD STATS */}
        {/* ==================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Sales (Paid)</span>
                  <p className="text-3xl font-black text-emerald-400 font-mono mt-1">₹{totalSales}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
                  <p className="text-3xl font-black text-slate-200 mt-1">{orders.length}</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Queue</span>
                  <p className="text-3xl font-black text-amber-400 mt-1">{pendingOrdersCount}</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Orders</span>
                  <p className="text-3xl font-black text-cyan-400 mt-1">{completedOrdersCount}</p>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Orders List */}
              <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center justify-between">
                  <span>Recent Orders Overview</span>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-emerald-400 font-bold hover:underline">
                    View Full Queue →
                  </button>
                </h3>

                <div className="space-y-4">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 truncate">
                        <img 
                          src={order.photoUrl} 
                          alt="Thumbnail" 
                          className="w-10 h-10 rounded object-cover border border-slate-800"
                        />
                        <div className="truncate">
                          <span className="font-bold text-xs sm:text-sm text-slate-200">{order.customerName}</span>
                          <span className="text-[10px] text-slate-500 block">ID: {order.id} • {order.sizeLabel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-emerald-400">₹{order.totalAmount}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          order.orderStatus === 'Completed' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : order.orderStatus === 'Processing'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-slate-500 text-xs py-8">No orders in queue yet.</p>
                  )}
                </div>
              </div>

              {/* Quick Config Card */}
              <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Active Contacts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  These details are displayed on the customer dashboard and hero section. Edit them in the settings tab.
                </p>

                <div className="space-y-3.5 text-xs text-slate-300 pt-2">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span className="truncate">{config.adminEmail}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{config.adminPhone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Instagram className="w-4 h-4 text-emerald-400" />
                    <span>@{config.adminInstagram}</span>
                  </div>
                  <div className="flex items-center gap-2.5 border-t border-slate-850 pt-3 text-[10px] text-slate-500">
                    <Key className="w-4 h-4 text-slate-500" />
                    <span className="truncate">Razorpay ID: {config.razorpayKeyId}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 2: ORDERS QUEUE */}
        {/* ==================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-slate-900/20 border border-slate-800 p-4 rounded-xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by Name, Email, Phone, Order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs font-bold text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      <th className="py-4 px-5">Photo / ID</th>
                      <th className="py-4 px-5">Customer Info</th>
                      <th className="py-4 px-5">Size & Type</th>
                      <th className="py-4 px-5">Payment</th>
                      <th className="py-4 px-5">Order Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs sm:text-sm">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-900/20 transition">
                        
                        {/* ID and Image */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 bg-slate-950 border border-slate-850 rounded overflow-hidden shrink-0 flex items-center justify-center">
                              {order.type === 'frame' && (
                                <div className="absolute inset-0 border-[3px] border-amber-900 pointer-events-none rounded" />
                              )}
                              <img
                                src={order.photoUrl}
                                alt="Mini Preview"
                                className={`max-h-full max-w-full object-contain ${
                                  order.type === 'frame' ? 'scale-[0.8]' : ''
                                }`}
                              />
                            </div>
                            <div>
                              <span className="font-extrabold text-white block">{order.id}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {new Date(order.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="py-4 px-5">
                          <div>
                            <span className="font-bold text-slate-200 block">{order.customerName}</span>
                            <span className="text-[10px] text-slate-400 block">{order.customerEmail}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{order.customerPhone}</span>
                          </div>
                        </td>

                        {/* Size and Type */}
                        <td className="py-4 px-5">
                          <div>
                            <span className="font-semibold text-slate-200 block">{order.sizeLabel}</span>
                            <span className="text-[10px] text-slate-400 block capitalize">{order.type} Print</span>
                            <span className="text-[10px] text-slate-500 block">Qty: {order.quantity}</span>
                          </div>
                        </td>

                        {/* Payment Details */}
                        <td className="py-4 px-5">
                          <div>
                            <span className="font-mono font-bold text-emerald-400 text-sm block">₹{order.totalAmount}</span>
                            <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-extrabold mt-1 ${
                              order.paymentStatus === 'Paid' 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>

                        {/* Order Status Select */}
                        <td className="py-4 px-5">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                            className={`px-2 py-1 rounded text-xs font-bold outline-none border ${
                              order.orderStatus === 'Completed'
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                                : order.orderStatus === 'Processing'
                                  ? 'bg-blue-950/40 border-blue-800 text-blue-400'
                                  : order.orderStatus === 'Cancelled'
                                    ? 'bg-red-950/40 border-red-800 text-red-400'
                                    : 'bg-amber-950/40 border-amber-800 text-amber-400'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setLightboxImage({ url: order.photoUrl, title: `${order.customerName} - ${order.sizeLabel}` })}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                              title="View Full Quality"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDownload(order.photoUrl, order.fileName)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                              title="Download Original"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <a
                              href={getCustomerWhatsAppLink(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded border border-emerald-500/20"
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          </div>
                        </td>

                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold text-sm">
                          No orders found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================== */}
        {/* TAB 3: MANAGE SIZES & PRICES */}
        {/* ==================================== */}
        {activeTab === 'prices' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-1">Manage Sizes & Prices</h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Add, edit, or remove the photo print sizes, dimensions, and frame costs in INR (₹). Updates apply dynamically to the order wizard.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSizeForm(!showAddSizeForm)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition"
                >
                  {showAddSizeForm ? 'Cancel New Size' : '+ Add New Size Option'}
                </button>
              </div>

              {/* Add New Size Form */}
              {showAddSizeForm && (
                <form onSubmit={handleAddSizeSubmit} className="bg-slate-950/60 border border-emerald-500/20 p-5 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs animate-in slide-in-from-top-4 duration-200">
                  <div className="sm:col-span-12 border-b border-slate-850 pb-2 mb-1">
                    <span className="font-extrabold text-emerald-400 uppercase tracking-wider">Create New Size Option</span>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-400 font-semibold mb-1">Size Label / Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10x12 Portrait"
                      value={newSizeLabel}
                      onChange={(e) => setNewSizeLabel(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-400 font-semibold mb-1">Dimensions (Inches / CM)</label>
                    <input
                      type="text"
                      required
                      placeholder='e.g. 10" x 12" (25 x 30 cm)'
                      value={newSizeDimensions}
                      onChange={(e) => setNewSizeDimensions(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Photo Print Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newSizePhotoPrice}
                      onChange={(e) => setNewSizePhotoPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Photo + Frame Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newSizeFramePrice}
                      onChange={(e) => setNewSizeFramePrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition"
                    >
                      Save Size
                    </button>
                  </div>
                </form>
              )}

              {/* Sizes Table */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850">
                      <th className="py-4 px-5">Size Name</th>
                      <th className="py-4 px-5">Dimensions</th>
                      <th className="py-4 px-5">Photo Print Price (INR)</th>
                      <th className="py-4 px-5">Photo + Frame Price (INR)</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs sm:text-sm">
                    {sizes.map((size) => (
                      <tr key={size.id} className="hover:bg-slate-900/10">
                        
                        {/* Size Label */}
                        <td className="py-4 px-5">
                          {editingSizeId === size.id ? (
                            <input
                              type="text"
                              value={editSizeLabel}
                              onChange={(e) => setEditSizeLabel(e.target.value)}
                              className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          ) : (
                            <span className="font-bold text-slate-200">{size.label}</span>
                          )}
                        </td>

                        {/* Dimensions */}
                        <td className="py-4 px-5">
                          {editingSizeId === size.id ? (
                            <input
                              type="text"
                              value={editSizeDimensions}
                              onChange={(e) => setEditSizeDimensions(e.target.value)}
                              className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          ) : (
                            <span className="text-slate-400 font-medium">{size.dimensions}</span>
                          )}
                        </td>
                        
                        {/* Photo Print Price */}
                        <td className="py-4 px-5">
                          {editingSizeId === size.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 font-bold">₹</span>
                              <input
                                type="number"
                                value={editPhotoPrice}
                                onChange={(e) => setEditPhotoPrice(Number(e.target.value))}
                                className="w-20 p-1 bg-slate-900 border border-slate-700 rounded text-sm font-bold text-cyan-400 outline-none focus:ring-1 focus:ring-cyan-500"
                              />
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-cyan-400">₹{size.photoPrice}</span>
                          )}
                        </td>

                        {/* Frame Price */}
                        <td className="py-4 px-5">
                          {editingSizeId === size.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 font-bold">₹</span>
                              <input
                                type="number"
                                value={editFramePrice}
                                onChange={(e) => setEditFramePrice(Number(e.target.value))}
                                className="w-20 p-1 bg-slate-900 border border-slate-700 rounded text-sm font-bold text-emerald-400 outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-emerald-400">₹{size.framePrice}</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          {editingSizeId === size.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => saveSizeEdit(size.id)}
                                className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-4 h-4 stroke-[3px]" />
                              </button>
                              <button
                                onClick={() => setEditingSizeId(null)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditingSize(size)}
                                className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteSize(size.id)}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900/20 border border-red-900/20 hover:border-red-900/40 text-red-400 hover:text-red-300 rounded transition"
                                title="Delete Size Option"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 4: CONTACTS & SECURITY */}
        {/* ==================================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
            
            {/* Admin Configuration Form */}
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 mb-2">Studio Contact Config</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Configure the admin contact details and Razorpay Key ID. These inputs dynamically update your customer-facing portal links.
              </p>

              <form onSubmit={handleConfigSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Admin Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Admin WhatsApp / Phone</label>
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instagram Username</label>
                  <input
                    type="text"
                    required
                    value={instaInput}
                    onChange={(e) => setInstaInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Razorpay Key ID (Demo/Live)</label>
                  <input
                    type="text"
                    required
                    value={rzpKeyInput}
                    onChange={(e) => setRzpKeyInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {configSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-lg text-xs font-bold text-center">
                    Settings Saved Successfully!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition"
                >
                  Save Studio Configuration
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 mb-2">Change Admin Password</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Update your administrator credentials. Choose a secure password to protect customer order details.
              </p>

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs font-bold text-center">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-lg text-xs font-bold text-center">
                    {passwordSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold rounded-lg transition"
                >
                  Change Password
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* Lightbox / Full Image Viewer Overlay */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center gap-4">
            <img
              src={lightboxImage.url}
              alt="Lightbox Fullsize"
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-200">{lightboxImage.title}</p>
              <p className="text-xs text-slate-500 mt-1">Click anywhere to close full screen view</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
