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
}

export enum PaymentMethod {
  Binance = 'binance',
  Card = 'card',
  Mobile = 'mobile',
}

export interface User {
  username: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  resetCode?: string;
  resetCodeExpiry?: number;
  purchasedBookIds: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  coverDataUrl: string; // Store cover as data URL
  pdfDataUrl: string;   // Store PDF as data URL
  pdfFileName: string; // Store original PDF file name
  pdfMimeType: string; // Store PDF mime type
  uploadedBy: string;
  status: 'pending' | 'approved';
  isForSale: boolean;
  price: number;
  tags: string[];
}

export interface Review {
  id: string;
  bookId: string;
  username: string;
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

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  status: 'pending' | 'completed';
  createdAt: number;
  referenceCode: string;
}

export interface Settings {
  binanceApiKey: string;
  binanceApiSecret: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
