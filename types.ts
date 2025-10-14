

export enum Section {
  Register = 'register',
  Login = 'login',
  Upload = 'upload',
  Books = 'books',
  Admin = 'admin',
  MyBooks = 'my-books',
  AdsManager = 'ads-manager',
  ForgotPassword = 'forgot-password',
  MyPurchases = 'my-purchases',
  Orders = 'orders',
  Settings = 'settings',
  Profile = 'profile',
}

export interface User {
  username: string; // This will be the user's email
  name: string;
  email: string;
  password?: string; // Storing plaintext for simplicity in this local-only version.
  role: 'admin' | 'user';
  purchasedBookIds: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  coverUrl: string;     // URL or Base64 Data URL
  pdfUrl: string;       // URL or Base64 Data URL
  pdfFileName: string;  // Store original PDF file name
  uploadedBy: string;   // user email
  status: 'pending' | 'approved';
  isForSale: boolean;
  price: number;
  tags: string[];
  downloadCount: number;
  isFeatured?: boolean;
}

export interface Review {
  id: string;
  bookId: string;
  username: string; // user email
  rating: number; // 1-5
  comment: string;
  createdAt: number; // timestamp
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum PaymentMethod {
  Binance = 'binance',
  Card = 'card',
  Mobile = 'mobile',
}

export interface Purchase {
  id: string;
  bookId: string;
  userId: string; // user email
  amount: number;
  referenceCode: string;
  status: 'pending' | 'completed';
  paymentMethod: PaymentMethod | null;
  createdAt: number;
}

export interface Settings {
  id: string; // Should be a singleton document ID, e.g., 'main'
  binanceApiKey: string;
  binanceApiSecret: string;
}