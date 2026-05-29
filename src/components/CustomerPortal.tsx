import React, { useState, useRef, useEffect } from 'react';
import { Upload, HelpCircle, Check, ArrowRight, ArrowLeft, Trash2, ShoppingBag, CreditCard, MapPin, Sparkles, Phone, Instagram, Mail } from 'lucide-react';
import { SizePrice, User, Order, ShippingAddress } from '../types';
import { getSizes, getAdminConfig, createOrder } from '../lib/storage';
import { RazorpayModal } from './RazorpayModal';

interface CustomerPortalProps {
  currentUser: User;
  onOrderSuccess: () => void;
  setTab: (tab: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ currentUser, onOrderSuccess, setTab }) => {
  const sizes = getSizes();
  const adminConfig = getAdminConfig();

  // Step state: 1 = Upload, 2 = Customise, 3 = Shipping, 4 = Review & Pay
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [compressedBase64, setCompressedBase64] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration State
  const [selectedSizeId, setSelectedSizeId] = useState<string>(sizes[1]?.id || '');
  const [orderType, setOrderType] = useState<'photo' | 'frame'>('photo');
  const [quantity, setQuantity] = useState<number>(1);

  // Shipping details (prefilled from user where possible)
  const [shippingName, setShippingName] = useState<string>(currentUser.name || '');
  const [shippingPhone, setShippingPhone] = useState<string>(currentUser.phone || '');
  const [shippingEmail, setShippingEmail] = useState<string>(currentUser.email || '');
  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Razorpay Payment Modal State
  const [isRazorpayOpen, setIsRazorpayOpen] = useState<boolean>(false);

  // Get current selected size object
  const currentSize = sizes.find(s => s.id === selectedSizeId) || sizes[0];

  // Calculate prices
  const unitPrice = orderType === 'photo' ? currentSize.photoPrice : currentSize.framePrice;
  const subtotal = unitPrice * quantity;
  const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  const totalAmount = subtotal + shippingCost;

  // Compress image to fit within localStorage limits (approx 100-200kb max)
  const compressImage = (imageFile: File) => {
    setIsUploading(true);
    setUploadError('');

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimension 800px for thumbnail/preview storage
        const MAX_DIM = 800;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress quality to 0.7
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setCompressedBase64(compressed);
          setPreviewUrl(compressed);
        }
        setIsUploading(false);
      };
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
      setIsUploading(false);
    };
  };

  // Handle Drag & Drop / File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check size limit (10MB = 10 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE_BYTES) {
      setUploadError(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 10 MB.`);
      setFile(null);
      setPreviewUrl('');
      setCompressedBase64('');
      return;
    }

    setFile(selectedFile);
    compressImage(selectedFile);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (droppedFile.size > MAX_SIZE_BYTES) {
      setUploadError(`File is too large (${(droppedFile.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    setFile(droppedFile);
    compressImage(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl('');
    setCompressedBase64('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Validate Shipping Form
  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingName.trim()) errors.name = 'Full Name is required';
    if (!shippingPhone.trim()) errors.phone = 'Phone Number is required';
    if (!shippingEmail.trim()) errors.email = 'Email Address is required';
    if (!address.street.trim()) errors.street = 'Street Address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.state.trim()) errors.state = 'State is required';
    if (!address.zip.trim()) {
      errors.zip = 'Pincode is required';
    } else if (!/^\d{6}$/.test(address.zip.trim())) {
      errors.zip = 'Pincode must be a 6-digit number';
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!file) {
        setUploadError('Please select or drag a photo to continue.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (validateShipping()) {
        setStep(4);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  // Trigger Razorpay Modal
  const handleCheckoutClick = () => {
    setIsRazorpayOpen(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentId: string) => {
    setIsRazorpayOpen(false);

    // Save order details to localStorage
    const orderData = {
      customerEmail: shippingEmail.toLowerCase(),
      customerName: shippingName,
      customerPhone: shippingPhone,
      sizeId: currentSize.id,
      sizeLabel: currentSize.label,
      type: orderType,
      photoUrl: compressedBase64 || previewUrl, // Optimized base64 image
      fileName: file?.name || 'uploaded_photo.jpg',
      fileSize: file?.size || 0,
      quantity,
      totalAmount,
      paymentStatus: 'Paid' as const,
      paymentId: paymentId,
      shippingAddress: address,
    };

    createOrder(orderData);
    onOrderSuccess(); // Triggers parent update and switches to My Orders Dashboard
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Order Custom Prints & Frames
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Upload your picture, choose print or handcrafted frames, select your size, and make secure payments.
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            {/* Background line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
            
            {/* Active line progress */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-cyan-500 transition-all duration-300 z-0"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="z-10 flex flex-col items-center">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step === num 
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20' 
                      : step > num 
                        ? 'bg-cyan-500 text-slate-950' 
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}
                >
                  {step > num ? <Check className="w-4 h-4 stroke-[3px]" /> : num}
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${step >= num ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {num === 1 ? 'Upload' : num === 2 ? 'Customise' : num === 3 ? 'Shipping' : 'Pay'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          {/* STEP 1: FILE UPLOAD */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-200">Step 1: Upload Your Photo</h3>
                <span className="text-xs text-slate-400">Max file size: <strong className="text-cyan-400">10 MB</strong></span>
              </div>

              {uploadError && (
                <div className="p-4 bg-red-950/30 border border-red-900/40 text-red-200 rounded-xl text-sm flex items-start gap-3">
                  <div className="p-1 bg-red-500/10 rounded text-red-400 mt-0.5 font-bold">!</div>
                  <p className="leading-relaxed">{uploadError}</p>
                </div>
              )}

              {!file ? (
                <div
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group transition duration-300 min-h-[300px]"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-slate-400 font-semibold">Processing image quality...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 rounded-2xl text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-850 transition duration-300 w-fit mx-auto shadow-lg">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-200">Drag and drop your image here</p>
                        <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>
                      </div>
                      <div className="pt-2 flex justify-center gap-4 text-[11px] text-slate-500 font-medium">
                        <span>Supports JPG, PNG, WEBP</span>
                        <span>•</span>
                        <span>High resolution recommended</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[360px] flex items-center justify-center p-2">
                    <img
                      src={previewUrl}
                      alt="Uploaded Preview"
                      className="max-h-[340px] rounded-lg object-contain mx-auto shadow-xl"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute top-4 right-4 p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-lg transition duration-200 hover:scale-105"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl flex items-center justify-between text-sm">
                    <div className="truncate pr-4">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • Status: <span className="text-emerald-400 font-bold">Ready</span>
                      </p>
                    </div>
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-full">
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={handleNextStep}
                  disabled={!file || isUploading}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:hover:bg-cyan-50 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 transition"
                >
                  <span>Select Sizes & Customise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOMISE (SIZE & TYPE SELECTION) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-200">Step 2: Choose Size & Framing</h3>
                <span className="text-xs text-slate-400">Live price calculation in INR</span>
              </div>

              {/* Grid Layout: Preview Left, Controls Right */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Visual Preview */}
                <div className="md:col-span-5 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Visual Mockup</span>
                  <div className={`relative rounded-2xl overflow-hidden bg-slate-950 p-6 flex items-center justify-center border transition-all duration-300 ${
                    orderType === 'frame' 
                      ? 'border-amber-700/80 ring-8 ring-amber-900/20 shadow-2xl shadow-amber-900/10' 
                      : 'border-slate-800'
                  }`} style={{ height: '280px' }}>
                    
                    {/* Frame Mockup Overlay */}
                    {orderType === 'frame' && (
                      <div className="absolute inset-0 border-[16px] border-amber-900 rounded-2xl shadow-inner z-10 pointer-events-none" />
                    )}
                    
                    <img
                      src={previewUrl}
                      alt="Mockup Preview"
                      className={`max-h-[200px] object-contain shadow-md transition-transform duration-300 ${
                        orderType === 'frame' ? 'scale-[0.9] border-4 border-white' : ''
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-center text-slate-400 italic">
                    {orderType === 'frame' 
                      ? 'Mockup showing handcrafted wooden frame border.' 
                      : 'Mockup showing borderless standalone photo print.'}
                  </p>
                </div>

                {/* Customisation Controls */}
                <div className="md:col-span-7 space-y-5">
                  {/* Print Type Toggle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderType('photo')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          orderType === 'photo'
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/5'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="block font-bold text-sm">Standalone Print</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Ultra HD Photo Paper only</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('frame')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          orderType === 'frame'
                            ? 'bg-amber-500/10 border-amber-600 text-amber-400 shadow-lg shadow-amber-900/5'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="block font-bold text-sm">Framed Photo</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Includes handcrafted wood frame</span>
                      </button>
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Dimensions</label>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 border border-slate-800/60 p-2 rounded-xl bg-slate-950/30">
                      {sizes.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSizeId(size.id)}
                          className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center transition-all ${
                            selectedSizeId === size.id
                              ? 'bg-slate-800 border-cyan-500 text-cyan-400'
                              : 'bg-transparent border-transparent hover:bg-slate-900/50 text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-xs sm:text-sm block">{size.label}</span>
                            <span className="text-[10px] text-slate-400 block">{size.dimensions}</span>
                          </div>
                          <span className="font-mono font-bold text-sm">
                            ₹{orderType === 'photo' ? size.photoPrice : size.framePrice}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-slate-950/50 border border-slate-850 p-3 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-lg text-slate-200 transition"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-base w-8 text-center text-white">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-lg text-slate-200 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pricing Summary Footer */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Unit Cost: ₹{unitPrice} • Quantity: {quantity}</span>
                  <span className="text-base font-bold text-slate-200 block mt-0.5">
                    Subtotal: <strong className="text-cyan-400 font-mono">₹{subtotal}</strong>
                  </span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 sm:flex-none px-5 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-300 font-bold text-sm transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 sm:flex-none px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 transition text-sm"
                  >
                    <span>Shipping Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SHIPPING DETAILS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-200">Step 3: Enter Shipping & Contact Details</h3>
                <span className="text-xs text-slate-400">Ensure correct phone number for status updates</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Contact Information */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-xl">
                  <div className="sm:col-span-3 pb-1 border-b border-slate-850">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Contact Info</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className={`w-full p-2.5 bg-slate-950 border rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none ${
                        shippingErrors.name ? 'border-red-500/60 bg-red-950/5' : 'border-slate-800'
                      }`}
                    />
                    {shippingErrors.name && <span className="text-[10px] text-red-400 mt-1 block">{shippingErrors.name}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className={`w-full p-2.5 bg-slate-950 border rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none ${
                        shippingErrors.phone ? 'border-red-500/60 bg-red-950/5' : 'border-slate-800'
                      }`}
                    />
                    {shippingErrors.phone && <span className="text-[10px] text-red-400 mt-1 block">{shippingErrors.phone}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      className={`w-full p-2.5 bg-slate-950 border rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none ${
                        shippingErrors.email ? 'border-red-500/60 bg-red-950/5' : 'border-slate-800'
                      }`}
                    />
                    {shippingErrors.email && <span className="text-[10px] text-red-400 mt-1 block">{shippingErrors.email}</span>}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-xl">
                  <div className="sm:col-span-12 pb-1 border-b border-slate-850">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Delivery Address</span>
                  </div>
                  <div className="sm:col-span-12">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="Flat/House No, Apartment Name, Street Area"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className={`w-full p-2.5 bg-slate-950 border rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none ${
                        shippingErrors.street ? 'border-red-500/60 bg-red-950/5' : 'border-slate-800'
                      }`}
                    />
                    {shippingErrors.street && <span className="text-[10px] text-red-400 mt-1 block">{shippingErrors.street}</span>}
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className={`w-full p-2.5 bg-slate-950 border rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none ${
                        shippingErrors.city ? 'border-red-500/60 bg-red-950/5' : 'border-slate-800'
                      }`}
                    />
                    {shippingErrors.city && <span className="text-[10px] text-red-400 mt-1 block">{shippingErrors.city}</span>}
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className={`w-full p-2.5 bg-slate-950 border rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none ${
                        shippingErrors.state ? 'border-red-500/60 bg-red-950/5' : 'border-slate-800'
                      }`}
                    />
                    {shippingErrors.state && <span className="text-[10px] text-red-400 mt-1 block">{shippingErrors.state}</span>}
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Pincode (6 digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 560001"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      className={`w-full p-2.5 bg-slate-950 border rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none ${
                        shippingErrors.zip ? 'border-red-500/60 bg-red-950/5' : 'border-slate-800'
                      }`}
                    />
                    {shippingErrors.zip && <span className="text-[10px] text-red-400 mt-1 block">{shippingErrors.zip}</span>}
                  </div>
                </div>

              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-300 font-bold text-sm transition animate-in"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 transition text-sm"
                >
                  <span>Review & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PAY */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-200">Step 4: Review Your Order & Pay</h3>
                <span className="text-xs text-slate-400">Secured via Demo Razorpay</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Summary */}
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Order Summary</span>
                  
                  <div className="flex gap-4">
                    <img
                      src={previewUrl}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-800"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{currentSize.label}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Dimensions: {currentSize.dimensions}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Type: <span className="font-semibold text-slate-300 capitalize">{orderType} print</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-3 space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Price Per Unit:</span>
                      <span className="font-semibold text-slate-200">₹{unitPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-semibold text-slate-200">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-200">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="font-semibold text-emerald-400">
                        {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                      </span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="text-[10px] text-right text-slate-500 italic">Add ₹{500 - subtotal} more to get free shipping!</p>
                    )}
                    
                    <div className="flex justify-between border-t border-slate-850 pt-2.5 text-sm">
                      <span className="font-bold text-slate-200">Grand Total:</span>
                      <span className="font-extrabold text-cyan-400 font-mono">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Contact Summary */}
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-3">Delivery & Contact Details</span>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium block">Ship To:</span>
                        <span className="font-bold text-slate-200 text-sm">{shippingName}</span>
                      </div>
                      
                      <div>
                        <span className="text-slate-500 font-medium block">Address:</span>
                        <p className="text-slate-300 leading-relaxed">
                          {address.street}, {address.city}, {address.state} - <strong className="text-slate-200 font-mono">{address.zip}</strong>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 font-medium block">Phone:</span>
                          <span className="text-slate-300 font-semibold">{shippingPhone}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block">Email:</span>
                          <span className="text-slate-300 font-semibold truncate block">{shippingEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-850/60 mt-4 text-[10px] text-slate-500 leading-relaxed flex gap-2 items-start">
                    <div className="p-1 bg-cyan-500/10 text-cyan-400 rounded">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <p>Payments are handled securely via Razorpay Demo Mode. No actual money is deducted. Click the checkout button below to pay.</p>
                  </div>
                </div>

              </div>

              {/* Checkout Actions */}
              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-300 font-bold text-sm transition"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-xl shadow-cyan-500/20 transition-all duration-300 transform hover:scale-[1.02] text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now with Razorpay</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Support Section for Customer */}
        <div className="mt-8 p-5 bg-slate-900/20 border border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Need help with your order?</h4>
            <p className="text-xs text-slate-500 mt-0.5">Direct admin support is available via WhatsApp, Instagram or Email.</p>
          </div>
          <div className="flex gap-2 text-xs">
            <a
              href={`https://wa.me/${adminConfig.adminPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>
            <a
              href={`mailto:${adminConfig.adminEmail}`}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

      </div>

      {/* Razorpay Modal Render */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalAmount}
        customerEmail={shippingEmail}
        customerPhone={shippingPhone}
        orderDescription={`${quantity}x ${currentSize.label} (${orderType === 'frame' ? 'Framed' : 'Print Only'})`}
      />
    </div>
  );
};
