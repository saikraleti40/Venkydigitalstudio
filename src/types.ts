export interface SizePrice {
  id: string;
  label: string; // e.g. '4" x 6" (Standard)'
  dimensions: string; // e.g. '10 x 15 cm'
  photoPrice: number; // in INR
  framePrice: number; // in INR
}

export interface User {
  email: string;
  name: string;
  phone: string;
  password?: string;
  isGmail?: boolean;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  sizeId: string;
  sizeLabel: string;
  type: 'photo' | 'frame'; // photo print only, or photo + frame
  photoUrl: string; // base64 or placeholder
  fileName: string;
  fileSize: number; // in bytes
  quantity: number;
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid';
  paymentId?: string;
  orderStatus: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  createdAt: string;
  shippingAddress: ShippingAddress;
}

export interface AdminConfig {
  adminEmail: string;
  adminPhone: string;
  adminInstagram: string;
  razorpayKeyId: string;
}
