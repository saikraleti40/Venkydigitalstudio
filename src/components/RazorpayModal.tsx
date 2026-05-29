import React, { useState } from 'react';
import { Shield, CreditCard, Smartphone, Landmark, Wallet, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { getAdminConfig } from '../lib/storage';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  orderDescription: string;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  customerEmail,
  customerPhone,
  orderDescription,
}) => {
  const [step, setStep] = useState<'methods' | 'card' | 'upi' | 'netbanking' | 'processing' | 'success'>('methods');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  // Form fields
  const [cardNumber, setCardNumber] = useState('4319 4920 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('Rohan Sharma');
  const [upiId, setUpiId] = useState('rohan@okaxis');

  const config = getAdminConfig();

  if (!isOpen) return null;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulate API call to Razorpay
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        onSuccess(mockPaymentId);
      }, 1500);
    }, 2000);
  };

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[420px] rounded-xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col text-gray-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Razorpay Header */}
        <div className="bg-[#1F2C5C] text-white p-5 flex justify-between items-center relative">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs tracking-widest text-[#00E5FF] font-bold uppercase">SECURE CHECKOUT</span>
            </div>
            <h3 className="text-lg font-bold mt-0.5 tracking-wide">Venky Digital Studio</h3>
            <p className="text-xs text-gray-300 truncate max-w-[280px] mt-0.5">{orderDescription}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Amount to Pay</span>
            <span className="text-xl font-extrabold text-[#00E5FF]">{formattedAmount}</span>
          </div>
        </div>

        {/* Razorpay Sub-Header */}
        <div className="bg-[#121B3A] text-[10px] text-gray-400 px-5 py-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3 h-3" /> Razorpay Trusted Standard
          </span>
          <span>Key ID: {config.razorpayKeyId || 'Demo Mode'}</span>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 min-h-[280px] flex flex-col justify-between bg-gray-50">
          
          {step === 'methods' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Payment Method</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => { setStep('card'); setSelectedMethod('Card'); }}
                  className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 border border-gray-200 rounded-lg hover:border-blue-300 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Card</p>
                      <p className="text-xs text-gray-400">Visa, MasterCard, RuPay, Maestro</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Pay</span>
                </button>

                <button
                  onClick={() => { setStep('upi'); setSelectedMethod('UPI'); }}
                  className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 border border-gray-200 rounded-lg hover:border-blue-300 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">UPI / QR</p>
                      <p className="text-xs text-gray-400">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">Pay</span>
                </button>

                <button
                  onClick={() => { setStep('netbanking'); setSelectedMethod('Netbanking'); }}
                  className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 border border-gray-200 rounded-lg hover:border-blue-300 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Netbanking</p>
                      <p className="text-xs text-gray-400">All major Indian banks available</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">Pay</span>
                </button>

                <button
                  onClick={() => { setStep('processing'); setSelectedMethod('Wallet'); handlePaymentSubmit({ preventDefault: () => {} } as any); }}
                  className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 border border-gray-200 rounded-lg hover:border-blue-300 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-md">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Wallets</p>
                      <p className="text-xs text-gray-400">Mobikwik, Freecharge, etc.</p>
                    </div>
                  </div>
                  <span className="text-xs text-rose-600 font-medium">Pay</span>
                </button>
              </div>

              <div className="text-[11px] text-gray-400 text-center pt-2">
                By continuing, you agree to Razorpay's Terms of Service.
              </div>
            </div>
          )}

          {/* CARD STEP */}
          {step === 'card' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => setStep('methods')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to payment options
              </button>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Name on Card</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#3399FF] hover:bg-[#2288EE] text-white font-bold rounded-lg text-sm shadow transition-colors mt-2"
              >
                Pay {formattedAmount}
              </button>
            </form>
          )}

          {/* UPI STEP */}
          {step === 'upi' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => setStep('methods')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to payment options
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Enter UPI ID (VPA)</label>
                  <input
                    type="text"
                    required
                    placeholder="username@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">A payment request will be sent to your UPI app.</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-purple-700 font-semibold">Or Scan QR Code instead</span>
                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700 transition"
                  >
                    Show QR
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#3399FF] hover:bg-[#2288EE] text-white font-bold rounded-lg text-sm shadow transition-colors mt-4"
              >
                Pay {formattedAmount}
              </button>
            </form>
          )}

          {/* NETBANKING STEP */}
          {step === 'netbanking' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => setStep('methods')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to payment options
              </button>
              
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase">Popular Banks</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="submit"
                      className="p-2.5 text-xs text-left bg-white border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50/20 font-medium transition"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-gray-400 text-center pt-2">
                You will be redirected to your bank's secure page to complete the payment.
              </div>
            </form>
          )}

          {/* PROCESSING STEP */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in duration-200">
              <Loader2 className="w-12 h-12 text-[#3399FF] animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">Processing Payment</p>
                <p className="text-xs text-gray-400 mt-1">Please do not close this modal or press back.</p>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-300">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-700">Payment Successful!</p>
                <p className="text-xs text-gray-400 mt-1">Generating order confirmation...</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {step !== 'processing' && step !== 'success' && (
          <div className="px-5 py-3.5 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> 100% Safe & Secure
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
