

import React, { useState, useEffect } from 'react';
import { Section, User, Book, ToastMessage, Review, Ad, ChatMessage, Purchase, PaymentMethod, Settings } from './types';
import Header from './components/Header';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import UploadForm from './components/UploadForm';
import BookList from './components/BookList';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';
import MyBooks from './components/MyBooks';
import MyPurchases from './components/MyPurchases';
import SummarizeModal from './components/SummarizeModal';
import EditBookModal from './components/EditBookModal';
import AdManager from './components/AdManager';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import OrderManagement from './components/OrderManagement';
import PaymentSettings from './components/PaymentSettings';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import { GoogleGenAI, Type, Chat } from "@google/genai";
import * as db from './db';

import PaymentMethodSelectionModal from './components/PaymentMethodSelectionModal';
import BinancePaymentModal from './components/BinancePaymentModal';
import CardPaymentModal from './components/CardPaymentModal';
import MobilePaymentModal from './components/MobilePaymentModal';
import BookPreviewModal from './components/BookPreviewModal';
import PublishGuideModal from './components/PublishGuideModal';
import GithubPublishGuideModal from './components/GithubPublishGuideModal';
import Profile from './components/Profile';
import InfoModal from './components/InfoModal';
import { useAuth } from './AuthContext';


// Extend the Window interface for TypeScript to recognize the deferredInstallPrompt
declare global {
  interface Window {
    deferredInstallPrompt: any;
  }
}

// Utility to convert a data URL string back to a File object for AI processing
async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
}


// Utility to resize and convert an image file to a JPEG Blob for upload
const processAndResizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 800; // Max width for the cover image
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            if (!event.target?.result) {
                return reject(new Error('Failed to read file for resizing.'));
            }
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }

                let { width, height } = img;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with a reasonable quality
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas to Blob conversion failed.'));
                    }
                }, 'image/jpeg', 0.85);
            };
            img.onerror = (error) => reject(new Error('Image could not be loaded. It might be corrupted or in an unsupported format.'));
        };
        reader.onerror = (error) => reject(error);
    });
};


// Utility function to convert a File to a GoogleGenerativeAI.Part
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

interface SummarizeState {
    isOpen: boolean;
    book: Book | null;
    summary: string;
    isLoading: boolean;
    error: string;
}

interface EditState {
    isOpen: boolean;
    book: Book | null;
}

interface PreviewState {
    isOpen: boolean;
    book: Book | null;
}

interface PaymentFlowState {
    purchase: Purchase | null;
    book: Book | null;
    methodSelectionOpen: boolean;
    activeMethod: PaymentMethod | null;
}

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const { currentUser, isInitialized } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>(Section.Books);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  
  const [summarizeState, setSummarizeState] = useState<SummarizeState>({ isOpen: false, book: null, summary: '', isLoading: false, error: '' });
  const [editState, setEditState] = useState<EditState>({ isOpen: false, book: null });
  const [previewState, setPreviewState] = useState<PreviewState>({ isOpen: false, book: null });
  const [forgotPasswordInfo, setForgotPasswordInfo] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  // New states for payment feature
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [settings, setSettings] = useState<Settings>({ id: 'main', binanceApiKey: '', binanceApiSecret: '' });
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlowState>({
      purchase: null,
      book: null,
      methodSelectionOpen: false,
      activeMethod: null,
  });

  // Chatbot states
  const [chat, setChat] = useState<Chat | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // PWA Install Prompt State
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [canShowInstallButton, setCanShowInstallButton] = useState(false);

  // Publish Guide Modal State
  const [isPublishGuideOpen, setIsPublishGuideOpen] = useState(false);
  const [isGithubPublishGuideOpen, setIsGithubPublishGuideOpen] = useState(false);

  const handleRequestPublishGuide = () => {
    setIsPublishGuideOpen(true);
  };

  const handleClosePublishGuide = () => {
    setIsPublishGuideOpen(false);
  };

  const handleRequestGithubPublishGuide = () => {
    setIsGithubPublishGuideOpen(true);
  };

  const handleCloseGithubPublishGuide = () => {
    setIsGithubPublishGuideOpen(false);
  };


  useEffect(() => {
    const handleInstallPromptReady = (e: CustomEvent) => {
      setInstallPromptEvent(e.detail);
    };

    window.addEventListener('pwa-install-ready', handleInstallPromptReady as EventListener);

    if (window.deferredInstallPrompt) {
      setInstallPromptEvent(window.deferredInstallPrompt);
    }
    
    return () => {
      window.removeEventListener('pwa-install-ready', handleInstallPromptReady as EventListener);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        setCanShowInstallButton(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
            showToast('اپلیکیشن په بریالیتوب سره انسټال شو!', 'success');
        } else {
            showToast('انسټال لغوه شو. تاسو کولی شئ دا وروسته د خپل براوزر مینو څخه انسټال کړئ.', 'error');
        }
        setInstallPromptEvent(null);
        window.deferredInstallPrompt = null;
    });
  };


  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('khawreen_theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('khawreen_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const availableSections = Object.values(Section).join(', ');
        const systemInstruction = `You are a friendly and helpful AI assistant for 'Khawreen Library', a digital library. Your primary goals are: 1. Help users discover books. 2. Answer questions about the library and its features. 3. Help users navigate the website. When a user asks for help with navigation (e.g., "take me to upload", "how do I see my books?"), you MUST respond with ONLY a special command in the format [NAVIGATE:SECTION_NAME]. The available sections are: ${availableSections}. Do not add any other text around the command. For example, if the user asks "How can I upload a book?", you should respond with [NAVIGATE:upload]. When a user asks about books, I will provide you with a list of available books in JSON format. Use this list to answer their questions. Be conversational and helpful. Your primary language is English. Respond in English unless the user explicitly requests another language.`;
        
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        setChat(chatInstance);
        setChatMessages([{ role: 'model', text: 'Hello! How can I help you explore the Khawreen Library today?' }]);
    }
  }, []);
  
  // Local DB Data Loading
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    const collections: (keyof typeof db.collections)[] = ['books', 'reviews', 'ads', 'purchases', 'users'];
    const setters: { [key: string]: React.Dispatch<React.SetStateAction<any>> } = {
        books: setBooks, reviews: setReviews, ads: setAds, purchases: setPurchases, users: setUsers
    };

    // Listen for data changes in each collection
    collections.forEach(collectionName => {
        const unsubscribe = db.onSnapshot(collectionName, (data) => {
            if(collectionName === 'books') {
                const booksWithDefaults = data.map((book: Book) => ({...book, downloadCount: book.downloadCount || 0, }));
                setBooks(booksWithDefaults);
            } else {
                setters[collectionName](data);
            }
        });
        unsubscribers.push(unsubscribe);
    });
    
    // Listen for settings changes
    const settingsUnsubscribe = db.onSettingsSnapshot((settingsData) => {
        if(settingsData) {
            setSettings(settingsData);
        }
    });
    unsubscribers.push(settingsUnsubscribe);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);


    // --- Preview Modal Handlers ---
  const handleRequestPreview = (bookId: string) => {
      const bookToPreview = books.find(b => b.id === bookId);
      if (bookToPreview) {
          setPreviewState({ isOpen: true, book: bookToPreview });
      }
  };

  // Effect to handle deep links for books
  useEffect(() => {
    if (!isInitialized || books.length === 0) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const bookIdToPreview = urlParams.get('book');

    if (bookIdToPreview) {
      const bookExists = books.find(b => b.id === bookIdToPreview && b.status === 'approved');
      if (bookExists) {
        handleRequestPreview(bookIdToPreview);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('book');
        window.history.replaceState({}, '', newUrl.toString());
      } else {
        showToast('The linked book could not be found or is not available.', 'error');
      }
    }
  }, [isInitialized, books]);


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setToasts(prevToasts => [...prevToasts, newToast]);
  };

  const closeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
 const handleRegister = async (userData: {name: string; email: string; password?: string;}) => {
    if (!userData.password) {
      showToast('Password is required for registration.', 'error');
      return;
    }
    try {
        const userCount = await db.getUserCount();
        const isAdmin = userCount === 0;
        await db.register(userData.email, userData.password, userData.name, isAdmin);
        showToast(`Registration successful! ${isAdmin ? 'You are the site Admin.' : ''} Please login.`, 'success');
        setActiveSection(Section.Login);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(message, 'error');
    }
  };


  const handleLogin = async (credentials: { email: string; password?: string }) => {
     if (!credentials.password) {
        showToast('Password is required.', 'error');
        return;
    }
    try {
      const user = await db.login(credentials.email, credentials.password);
      showToast(`Welcome back, ${user.name || user.email}!`);
      setActiveSection(Section.Books);
    } catch (error) {
       const message = error instanceof Error ? error.message : 'An unknown error occurred.';
       showToast(message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
        await db.logout();
        showToast('You have been logged out.', 'success');
        setActiveSection(Section.Books);
    } catch (error) {
        showToast('Failed to log out.', 'error');
    }
  };
  
 const handleForgotPasswordRequest = async (email: string) => {
    try {
        const password = await db.sendPasswordReset(email);
        if (password) {
            setForgotPasswordInfo({
                isOpen: true,
                message: `Because this app runs locally without a server, your password is shown here for recovery:\n\n${password}`
            });
        } else {
            showToast("If an account exists for that email, recovery info has been prepared.", 'success');
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(message, 'error');
    }
  };

  const handleAddBook = async (title: string, author: string, language: string, coverFile: File, pdfFile: File, isForSale: boolean, price: number) => {
    if (!currentUser) {
        const errorMessage = 'You must be logged in to upload a book.';
        showToast(errorMessage, 'error');
        setActiveSection(Section.Login);
        throw new Error(errorMessage);
    }
    
    let coverBlob: Blob;
    try {
        coverBlob = await processAndResizeImage(coverFile);
    } catch (error) {
        const errorMessage = 'Failed to process cover image. It may be corrupted or in an unsupported format.';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
    }

    try {
        const bookId = `book-${Date.now()}`;
        // Store files as Base64 data URLs in local storage
        const coverUrl = await db.uploadFile(coverBlob, `covers/${bookId}.jpg`);
        const pdfUrl = await db.uploadFile(pdfFile, `pdfs/${bookId}.pdf`);

        let tags: string[] = [];
        try {
            if (process.env.API_KEY) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const pdfPart = await fileToGenerativePart(pdfFile);
                const prompt = `Analyze this book. Generate 5-7 relevant tags in English. Examples: 'History', 'Poetry', 'Fiction'. Return as a JSON object: {"tags": ["tag1", "tag2"]}.`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [pdfPart, { text: prompt }] },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: Type.OBJECT, properties: { tags: { type: Type.ARRAY, items: { type: Type.STRING } } } }
                    }
                });
                const jsonResponse = JSON.parse(response.text);
                if (jsonResponse?.tags) {
                    tags = jsonResponse.tags;
                    showToast('AI-powered tags generated!', 'success');
                }
            }
        } catch (e) {
            console.error("Failed to generate tags:", e);
            showToast('Book uploaded, but AI tag generation failed.', 'error');
        }
        
        const newBook: Book = {
          id: bookId, title, author, language, coverUrl, pdfUrl, pdfFileName: pdfFile.name,
          uploadedBy: currentUser.email, status: 'pending', isForSale,
          price: isForSale ? price : 0, tags, downloadCount: 0,
        };
        
        await db.add('books', newBook, newBook.id);
        showToast('Book submitted for admin approval!');
        setActiveSection(Section.MyBooks);

    } catch (uploadError) {
        const errorMessage = 'Failed to process files for local storage.';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const bookToDelete = books.find(b => b.id === bookId);
    if(window.confirm('Are you sure you want to delete this book? This will also remove it from storage permanently.')) {
        if (bookToDelete) {
          await db.deleteBook(bookToDelete);
          showToast('Book removed successfully.', 'success');
        } else {
          showToast('Could not find book to delete.', 'error');
        }
    }
  };

  const handleDownloadBook = async (bookId: string) => {
    await db.incrementDownloadCount(bookId);
  };

  const handleApproveBook = async (bookId: string) => {
    await db.update('books', bookId, { status: 'approved' });
    showToast('Book approved and published!', 'success');
  };
  
  const handleAddReview = async (bookId: string, rating: number, comment: string) => {
      if (!currentUser) {
        showToast('You must be logged in to leave a review.', 'error');
        setActiveSection(Section.Login);
        return;
      }
      const newReview: Review = {
        id: `review-${Date.now()}`, bookId, username: currentUser.email, rating, comment, createdAt: Date.now(),
      };
      await db.add('reviews', newReview, newReview.id);
      showToast('Your review has been submitted!', 'success');
  };

  const handleAcquireFreeBook = async (bookId: string) => {
    if (await db.addBookToUserLibrary(bookId)) {
      showToast('Book added to your library successfully!', 'success');
    } else {
      showToast('Could not add book to library.', 'error');
    }
  };
  
  const handleRequestAcquisition = async (bookId: string) => {
    if (!currentUser) {
      showToast('You must be logged in to get a book.', 'error');
      setActiveSection(Section.Login);
      return;
    }
    const bookToAcquire = books.find(b => b.id === bookId);
    if (!bookToAcquire) return;

    if (currentUser.purchasedBookIds.includes(bookId)) {
      showToast('You already own this book.', 'success');
      setActiveSection(Section.MyPurchases);
      return;
    }

    if (!bookToAcquire.isForSale || bookToAcquire.price <= 0) {
      await handleAcquireFreeBook(bookId);
    } else {
      const referenceCode = `KHW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const purchaseId = `purchase-${Date.now()}`;
      const newPurchase: Purchase = {
        id: purchaseId, bookId: bookToAcquire.id, userId: currentUser.email,
        amount: bookToAcquire.price, referenceCode: referenceCode, status: 'pending',
        paymentMethod: null, createdAt: Date.now(),
      };
      await db.add('purchases', newPurchase, purchaseId);
      setPaymentFlow({
        purchase: newPurchase, book: bookToAcquire,
        methodSelectionOpen: true, activeMethod: null,
      });
    }
  };

  const handleClosePaymentModals = () => {
    setPaymentFlow({ purchase: null, book: null, methodSelectionOpen: false, activeMethod: null });
  };
  
  const handleSelectPaymentMethod = async (method: PaymentMethod, purchase: Purchase) => {
    await db.update('purchases', purchase.id, { paymentMethod: method });
    setPaymentFlow(prev => ({ ...prev, methodSelectionOpen: false, activeMethod: method }));
  };
  
  const handlePaymentSuccess = async (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) {
        showToast('An error occurred during payment confirmation.', 'error');
        handleClosePaymentModals();
        return;
    }

    await db.addBookToUserLibrary(purchase.bookId);
    await db.update('purchases', purchaseId, { status: 'completed' });

    handleClosePaymentModals();
    showToast('Payment successful! The book has been added to your library.', 'success');
    setActiveSection(Section.MyPurchases);
  };

  const handleAddAd = async (adData: Omit<Ad, 'id'>) => {
    const adId = `ad-${Date.now()}`;
    const newAd: Ad = { id: adId, ...adData };
    await db.add('ads', newAd, adId);
    showToast('Advertisement created successfully!', 'success');
  };

  const handleUpdateAd = async (adId: string, adData: Omit<Ad, 'id'>) => {
    await db.update('ads', adId, adData);
    showToast('Advertisement updated successfully!', 'success');
  };

  const handleDeleteAd = async (adId: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      await db.deleteItem('ads', adId);
      showToast('Advertisement deleted.', 'success');
    }
  };

  const handleSaveSettings = async (newSettings: Omit<Settings, 'id'>) => {
    await db.putSettings(newSettings);
    showToast('Settings saved successfully!', 'success');
    setActiveSection(Section.Admin);
  };
  
  const handleUpdateBookDetails = async (bookId: string, updates: Partial<Book>) => {
    await db.update('books', bookId, updates);
    setEditState({ isOpen: false, book: null });
    showToast('Book details updated successfully!', 'success');
  };

  const handleSendMessage = async (message: string) => {
    if (!chat) return;
    setIsChatLoading(true);
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    
    const bookListForContext = books
      .filter(b => b.status === 'approved')
      .map(b => ({ title: b.title, author: b.author, language: b.language, tags: b.tags, price: b.price }))
      .slice(0, 20);

    const contextMessage = `Here is a list of available books in JSON format: ${JSON.stringify(bookListForContext)}. Use this information to answer any book-related questions.`;
    
    try {
        const response = await chat.sendMessage({ message: `${contextMessage}\n\nUser query: ${message}` });
        const responseText = response.text.trim();
        
        const navRegex = /\[NAVIGATE:(\w+(?:-\w+)*)\]/;
        const match = responseText.match(navRegex);

        if (match && match[1]) {
            const section = match[1] as Section;
            if (Object.values(Section).includes(section)) {
                setActiveSection(section);
                setIsChatOpen(false);
                 showToast(`Navigating you to the ${section.replace('-',' ')} page.`, 'success');
            } else {
                setChatMessages(prev => [...prev, { role: 'model', text: `Sorry, I can't navigate to "${section}". It's not a valid section.` }]);
            }
        } else {
             setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
        }
    } catch (e) {
        console.error("Chat error:", e);
        setChatMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
        setIsChatLoading(false);
    }
  };
  
  const handleRequestSummary = async (bookId: string) => {
      const bookToSummarize = books.find(b => b.id === bookId);
      if (!bookToSummarize) return;

      setSummarizeState({ isOpen: true, book: bookToSummarize, summary: '', isLoading: true, error: '' });

      if (!process.env.API_KEY) {
          setSummarizeState(s => ({ ...s, isLoading: false, error: 'API key is not configured. Cannot generate summary.' }));
          return;
      }
      
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const pdfFile = await dataUrlToFile(bookToSummarize.pdfUrl, bookToSummarize.pdfFileName);
          const filePart = await fileToGenerativePart(pdfFile);

          const prompt = `Please provide a concise, one-paragraph summary of this book in the book's original language, which is ${bookToSummarize.language}.`;
          const genAIResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [filePart, { text: prompt }] },
          });

          setSummarizeState(s => ({ ...s, summary: genAIResponse.text, isLoading: false }));
      } catch (e) {
          console.error("Summarization error:", e);
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setSummarizeState(s => ({ ...s, isLoading: false, error: `Failed to generate summary. ${errorMessage}` }));
      }
  };
  const handleCloseSummary = () => setSummarizeState({ isOpen: false, book: null, summary: '', isLoading: false, error: '' });

  const handleRequestEdit = (bookId: string) => {
    const bookToEdit = books.find(b => b.id === bookId);
    if (bookToEdit) {
      setEditState({ isOpen: true, book: bookToEdit });
    }
  };
  const handleCloseEdit = () => setEditState({ isOpen: false, book: null });
  
  const handleClosePreview = () => setPreviewState({ isOpen: false, book: null });

  const approvedBooks = books.filter(book => book.status === 'approved');
  const pendingBooks = books.filter(book => book.status === 'pending');
  const myBooks = books.filter(book => currentUser && book.uploadedBy === currentUser.email);
  const myPurchasedBooks = books.filter(book => currentUser && currentUser.purchasedBookIds.includes(book.id));

  const pendingApprovalCount = currentUser?.role === 'admin' ? pendingBooks.length : 0;
  
  if (!isInitialized) {
      return <div className="flex justify-center items-center h-screen bg-slate-100 dark:bg-slate-900">
          <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
              <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">Loading Library...</p>
          </div>
      </div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        toggleTheme={toggleTheme}
        pendingApprovalCount={pendingApprovalCount}
        installPrompt={canShowInstallButton && installPromptEvent}
        onInstallClick={handleInstallClick}
        onRequestPublishGuide={handleRequestPublishGuide}
        onRequestGithubPublishGuide={handleRequestGithubPublishGuide}
      />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          {activeSection === Section.Register && <RegisterForm onRegister={handleRegister} />}
          {activeSection === Section.Login && <LoginForm onLogin={handleLogin} onNavigate={setActiveSection} />}
          {activeSection === Section.ForgotPassword && <ForgotPasswordForm onForgotPasswordRequest={handleForgotPasswordRequest} />}
          {activeSection === Section.Upload && <UploadForm onUpload={handleAddBook} showToast={showToast} />}
          {activeSection === Section.Books && <BookList books={approvedBooks} ads={ads} reviews={reviews} onAddReview={handleAddReview} onDelete={handleDeleteBook} onRequestSummary={handleRequestSummary} onRequestEdit={handleRequestEdit} onRequestPreview={handleRequestPreview} onPurchase={handleRequestAcquisition} onDownload={handleDownloadBook} searchQuery={searchQuery} onNavigate={setActiveSection} />}
          {activeSection === Section.Admin && currentUser?.role === 'admin' && <AdminPanel books={pendingBooks} reviews={reviews} onAddReview={handleAddReview} onApprove={handleApproveBook} onReject={handleDeleteBook} onRequestSummary={handleRequestSummary} onRequestEdit={handleRequestEdit} onRequestPreview={handleRequestPreview} onNavigate={setActiveSection} onDownload={handleDownloadBook} />}
          {activeSection === Section.MyBooks && <MyBooks books={myBooks} onDelete={handleDeleteBook} onApprove={handleApproveBook} onRequestSummary={handleRequestSummary} onRequestEdit={handleRequestEdit} onRequestPreview={handleRequestPreview} reviews={reviews} onAddReview={handleAddReview} onNavigate={setActiveSection} onDownload={handleDownloadBook} />}
          {activeSection === Section.MyPurchases && <MyPurchases books={myPurchasedBooks} reviews={reviews} onAddReview={handleAddReview} onRequestSummary={handleRequestSummary} onRequestPreview={handleRequestPreview} onNavigate={setActiveSection} onDownload={handleDownloadBook}/>}
          {activeSection === Section.AdsManager && currentUser?.role === 'admin' && <AdManager ads={ads} onAdd={handleAddAd} onUpdate={handleUpdateAd} onDelete={handleDeleteAd} />}
          {activeSection === Section.Orders && currentUser?.role === 'admin' && <OrderManagement purchases={purchases} books={books} users={users} />}
          {activeSection === Section.Settings && currentUser?.role === 'admin' && <PaymentSettings settings={settings} onSave={handleSaveSettings} />}
          {activeSection === Section.Profile && currentUser && <Profile showToast={showToast} />}
        </div>
      </main>
      <Footer onNavigate={setActiveSection} />
      <div className="fixed bottom-0 right-0 p-4 space-y-3 z-[100]">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => closeToast(toast.id)} />
        ))}
      </div>
      {summarizeState.isOpen && (
        <SummarizeModal
            isOpen={summarizeState.isOpen}
            onClose={handleCloseSummary}
            bookTitle={summarizeState.book?.title || ''}
            bookLanguage={summarizeState.book?.language || 'English'}
            summary={summarizeState.summary}
            isLoading={summarizeState.isLoading}
            error={summarizeState.error}
        />
      )}
      {editState.isOpen && (
        <EditBookModal
            isOpen={editState.isOpen}
            onClose={handleCloseEdit}
            book={editState.book}
            onUpdate={handleUpdateBookDetails}
        />
      )}
      {previewState.isOpen && (
        <BookPreviewModal
            isOpen={previewState.isOpen}
            onClose={handleClosePreview}
            book={previewState.book}
        />
       )}

      {paymentFlow.methodSelectionOpen && (
        <PaymentMethodSelectionModal
          isOpen={paymentFlow.methodSelectionOpen}
          onClose={handleClosePaymentModals}
          onSelectMethod={handleSelectPaymentMethod}
          purchase={paymentFlow.purchase}
          book={books.find(b => b.id === paymentFlow.purchase?.bookId)}
        />
      )}
      {paymentFlow.activeMethod === PaymentMethod.Binance && (
        <BinancePaymentModal
          isOpen={true}
          onClose={handleClosePaymentModals}
          onSuccess={handlePaymentSuccess}
          purchase={paymentFlow.purchase}
          book={books.find(b => b.id === paymentFlow.purchase?.bookId)}
        />
      )}
      {paymentFlow.activeMethod === PaymentMethod.Card && (
        <CardPaymentModal
          isOpen={true}
          onClose={handleClosePaymentModals}
          onSuccess={handlePaymentSuccess}
          purchase={paymentFlow.purchase}
          book={books.find(b => b.id === paymentFlow.purchase?.bookId)}
        />
      )}
      {paymentFlow.activeMethod === PaymentMethod.Mobile && (
        <MobilePaymentModal
          isOpen={true}
          onClose={handleClosePaymentModals}
          onSuccess={handlePaymentSuccess}
          purchase={paymentFlow.purchase}
          book={books.find(b => b.id === paymentFlow.purchase?.bookId)}
        />
      )}
      
      {chat && <Chatbot isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} messages={chatMessages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />}

      <InfoModal
        isOpen={forgotPasswordInfo.isOpen}
        onClose={() => setForgotPasswordInfo({ isOpen: false, message: '' })}
        title="Password Recovery"
      >
        <p className="whitespace-pre-wrap font-mono bg-slate-100 dark:bg-slate-700 p-3 rounded-md text-center">{forgotPasswordInfo.message}</p>
      </InfoModal>

      <PublishGuideModal isOpen={isPublishGuideOpen} onClose={handleClosePublishGuide} />
      <GithubPublishGuideModal isOpen={isGithubPublishGuideOpen} onClose={handleCloseGithubPublishGuide} />
    </div>
  );
};

export default App;