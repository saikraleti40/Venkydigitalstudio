import { SizePrice, User, Order, AdminConfig } from '../types';

// Default Size and Price configuration
const DEFAULT_SIZES: SizePrice[] = [
  { id: 'size-passport', label: 'Passport Size', dimensions: '2" x 2.5" (4.5 x 3.5 cm)', photoPrice: 50, framePrice: 150 },
  { id: 'size-4x6', label: 'Standard Photo', dimensions: '4" x 6" (10 x 15 cm)', photoPrice: 80, framePrice: 280 },
  { id: 'size-5x7', label: 'Medium Portrait', dimensions: '5" x 7" (13 x 18 cm)', photoPrice: 120, framePrice: 390 },
  { id: 'size-8x10', label: 'Large Portrait', dimensions: '8" x 10" (20 x 25 cm)', photoPrice: 200, framePrice: 590 },
  { id: 'size-a4', label: 'A4 Art Print', dimensions: '8.3" x 11.7" (21 x 29.7 cm)', photoPrice: 250, framePrice: 750 },
  { id: 'size-12x18', label: 'Exhibition Poster', dimensions: '12" x 18" (30 x 45 cm)', photoPrice: 450, framePrice: 1200 },
];

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  adminEmail: 'contact@venkydigitalstudio.com',
  adminPhone: '+919876543210',
  adminInstagram: 'venky_digital_studio',
  razorpayKeyId: 'rzp_test_VenkyStudioDemoKey123',
};

const DEFAULT_USERS: User[] = [
  {
    email: 'customer@gmail.com',
    name: 'Rohan Sharma',
    phone: '+919876543211',
    password: 'password',
  }
];

// Sample orders
const getSampleOrders = (): Order[] => [
  {
    id: 'ORD-98431',
    customerEmail: 'customer@gmail.com',
    customerName: 'Rohan Sharma',
    customerPhone: '+919876543211',
    sizeId: 'size-a4',
    sizeLabel: 'A4 Art Print',
    type: 'frame',
    photoUrl: '/uploads/upload_1.webp', // Use the uploaded file here!
    fileName: 'nature_landscape.webp',
    fileSize: 450000,
    quantity: 1,
    totalAmount: 750,
    paymentStatus: 'Paid',
    paymentId: 'pay_PST123456789',
    orderStatus: 'Processing',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    shippingAddress: {
      street: '123, MG Road, Near Central Mall',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560001',
    },
  },
  {
    id: 'ORD-77210',
    customerEmail: 'customer@gmail.com',
    customerName: 'Rohan Sharma',
    customerPhone: '+919876543211',
    sizeId: 'size-4x6',
    sizeLabel: 'Standard Photo',
    type: 'photo',
    photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    fileName: 'family_portrait.jpg',
    fileSize: 1250000,
    quantity: 3,
    totalAmount: 240, // 80 * 3
    paymentStatus: 'Paid',
    paymentId: 'pay_PST987654321',
    orderStatus: 'Completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    shippingAddress: {
      street: '123, MG Road, Near Central Mall',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560001',
    },
  },
];

// LocalStorage Keys
const KEYS = {
  SIZES: 'venky_studio_sizes',
  ADMIN_CONFIG: 'venky_studio_admin_config',
  ADMIN_PASSWORD: 'venky_studio_admin_password',
  USERS: 'venky_studio_users',
  ORDERS: 'venky_studio_orders',
  CURRENT_USER: 'venky_studio_current_user',
};

export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.SIZES)) {
    localStorage.setItem(KEYS.SIZES, JSON.stringify(DEFAULT_SIZES));
  }
  if (!localStorage.getItem(KEYS.ADMIN_CONFIG)) {
    localStorage.setItem(KEYS.ADMIN_CONFIG, JSON.stringify(DEFAULT_ADMIN_CONFIG));
  }
  if (!localStorage.getItem(KEYS.ADMIN_PASSWORD)) {
    localStorage.setItem(KEYS.ADMIN_PASSWORD, 'password'); // Default admin password
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(getSampleOrders()));
  }
};

// SIZES
export const getSizes = (): SizePrice[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.SIZES) || '[]');
};

export const updateSizes = (sizes: SizePrice[]) => {
  localStorage.setItem(KEYS.SIZES, JSON.stringify(sizes));
};

// ADMIN CONFIG
export const getAdminConfig = (): AdminConfig => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.ADMIN_CONFIG) || '{}');
};

export const updateAdminConfig = (config: AdminConfig) => {
  localStorage.setItem(KEYS.ADMIN_CONFIG, JSON.stringify(config));
};

// ADMIN PASSWORD
export const getAdminPassword = (): string => {
  initializeStorage();
  return localStorage.getItem(KEYS.ADMIN_PASSWORD) || 'password';
};

export const updateAdminPassword = (newPassword: string) => {
  localStorage.setItem(KEYS.ADMIN_PASSWORD, newPassword);
};

// USERS
export const getUsers = (): User[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
};

export const registerUser = (user: User): { success: boolean; error?: string } => {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    return { success: false, error: 'User with this email already exists' };
  }
  users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  setCurrentUser(user);
  return { success: true };
};

export const loginUser = (email: string, password?: string, isGmail = false): { success: boolean; user?: User; error?: string } => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (isGmail) {
    // Gmail login: if user doesn't exist, auto-register them
    if (!user) {
      const newUser: User = {
        email: email.toLowerCase(),
        name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
        phone: '+919999999999', // Default placeholder, can edit later
        isGmail: true,
      };
      registerUser(newUser);
      return { success: true, user: newUser };
    }
    setCurrentUser(user);
    return { success: true, user };
  }

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }

  setCurrentUser(user);
  return { success: true, user };
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// ORDERS
export const getOrders = (): Order[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
};

export const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus'>): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    orderStatus: 'Pending',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder); // Add to beginning
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: Order['orderStatus']): boolean => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].orderStatus = status;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    return true;
  }
  return false;
};

export const updateOrderPaymentStatus = (orderId: string, status: Order['paymentStatus'], paymentId?: string): boolean => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].paymentStatus = status;
    if (paymentId) orders[index].paymentId = paymentId;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    return true;
  }
  return false;
};
