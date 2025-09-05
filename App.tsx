import React, { useState, useEffect } from 'react';
import { Section, User, Book, ToastMessage, Review, Ad, Purchase, Settings, PaymentMethod, ChatMessage } from './types';
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
import PaymentMethodSelectionModal from './components/PaymentMethodSelectionModal';
import BinancePaymentModal from './components/BinancePaymentModal';
import CardPaymentModal from './components/CardPaymentModal';
import MobilePaymentModal from './components/MobilePaymentModal';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import { GoogleGenAI, Type, Chat } from "@google/genai";

// Utility to convert file to Base64 Data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Utility to convert Data URL back to a File object
function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


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

interface PaymentState {
  isOpen: boolean;
  purchase: Purchase | null;
}

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Books);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [settings, setSettings] = useState<Settings>({ binanceApiKey: '', binanceApiSecret: '' });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  
  const [summarizeState, setSummarizeState] = useState<SummarizeState>({ isOpen: false, book: null, summary: '', isLoading: false, error: '' });
  const [editState, setEditState] = useState<EditState>({ isOpen: false, book: null });

  // Payment Modal States
  const [paymentMethodSelectionState, setPaymentMethodSelectionState] = useState<PaymentState>({ isOpen: false, purchase: null });
  const [binancePaymentState, setBinancePaymentState] = useState<PaymentState>({ isOpen: false, purchase: null });
  const [cardPaymentState, setCardPaymentState] = useState<PaymentState>({ isOpen: false, purchase: null });
  const [mobilePaymentState, setMobilePaymentState] = useState<PaymentState>({ isOpen: false, purchase: null });

  // Chatbot states
  const [chat, setChat] = useState<Chat | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('khawreen_theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  // Theme effect
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

  // Initialize Chatbot
  useEffect(() => {
    if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const availableSections = Object.values(Section).join(', ');
        const systemInstruction = `You are a friendly and helpful AI assistant for 'Khawreen Library', a digital Pashto library. Your primary goals are: 1. Help users discover books. 2. Answer questions about the library and its features. 3. Help users navigate the website. When a user asks for help with navigation (e.g., "take me to upload", "how do I see my books?"), you MUST respond with ONLY a special command in the format [NAVIGATE:SECTION_NAME]. The available sections are: ${availableSections}. Do not add any other text around the command. For example, if the user asks "How can I upload a book?", you should respond with [NAVIGATE:upload]. When a user asks about books, I will provide you with a list of available books in JSON format. Use this list to answer their questions. Be conversational and helpful. You can speak English or Pashto, depending on the user's language.`;
        
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        setChat(chatInstance);
        setChatMessages([{ role: 'model', text: 'Hello! How can I help you explore the Khawreen Library today?' }]);
    }
  }, []);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('khawreen_users');
      if (storedUsers) setUsers(JSON.parse(storedUsers));

      const storedBooks = localStorage.getItem('khawreen_books');
      if (storedBooks) setBooks(JSON.parse(storedBooks));

      const storedCurrentUser = localStorage.getItem('khawreen_currentUser');
      if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));

      const storedReviews = localStorage.getItem('khawreen_reviews');
      if (storedReviews) setReviews(JSON.parse(storedReviews));
      
      const storedAds = localStorage.getItem('khawreen_ads');
      if (storedAds) setAds(JSON.parse(storedAds));
      
      const storedPurchases = localStorage.getItem('khawreen_purchases');
      if (storedPurchases) setPurchases(JSON.parse(storedPurchases));

      const storedSettings = localStorage.getItem('khawreen_settings');
      if (storedSettings) setSettings(JSON.parse(storedSettings));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Clear potentially corrupted storage
      localStorage.clear();
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('khawreen_users', JSON.stringify(users));
      localStorage.setItem('khawreen_books', JSON.stringify(books));
      localStorage.setItem('khawreen_currentUser', JSON.stringify(currentUser));
      localStorage.setItem('khawreen_reviews', JSON.stringify(reviews));
      localStorage.setItem('khawreen_ads', JSON.stringify(ads));
      localStorage.setItem('khawreen_purchases', JSON.stringify(purchases));
      localStorage.setItem('khawreen_settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      showToast('Could not save session data. Storage may be full.', 'error');
    }
  }, [users, books, currentUser, reviews, ads, purchases, settings, isInitialized]);


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setToasts(prevToasts => [...prevToasts, newToast]);
  };

  const closeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  const handleRegister = (user: Omit<User, 'role' | 'username' | 'purchasedBookIds'>) => {
    const username = user.email;
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        showToast('An account with this email already exists.', 'error');
        return;
    }
    const newUser: User = { ...user, username, role: users.length === 0 ? 'admin' : 'user', purchasedBookIds: [] };
    setUsers(prevUsers => [...prevUsers, newUser]);
    showToast(`Registration successful! ${newUser.role === 'admin' ? 'You are the site Admin.' : ''} Please login.`, 'success');
    setActiveSection(Section.Login);
  };

  const handleLogin = (credentials: { email: string; password?: string }) => {
    const userToLogin = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    if (!userToLogin || userToLogin.password !== credentials.password) {
        showToast('Invalid email or password.', 'error');
        return;
    }
    setCurrentUser(userToLogin);
    showToast(`Welcome back, ${userToLogin.name || userToLogin.username}!`);
    setActiveSection(Section.Books);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('You have been logged out.', 'success');
    setActiveSection(Section.Books);
  };
  
  const handleForgotPasswordRequest = (email: string) => {
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
        showToast("If an account with that email exists, a reset code has been sent.", 'success');
        return;
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = Date.now() + 10 * 60 * 1000;
    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], resetCode, resetCodeExpiry };
    setUsers(updatedUsers);
    showToast(`Password reset code: ${resetCode}`, 'success');
  };

  const handleResetPassword = (email: string, code: string, newPassword: string) => {
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex === -1) {
          showToast('Invalid email or reset code.', 'error');
          return;
      }
      const user = users[userIndex];
      if (user.resetCode !== code || (user.resetCodeExpiry && Date.now() > user.resetCodeExpiry)) {
          showToast('Invalid or expired reset code. Please try again.', 'error');
          return;
      }
      const { resetCode: rCode, resetCodeExpiry: rCodeExpiry, ...userWithoutReset } = user;
      const updatedUsers = [...users];
      updatedUsers[userIndex] = { ...userWithoutReset, password: newPassword };
      setUsers(updatedUsers);
      showToast('Your password has been reset successfully. Please login.', 'success');
      setActiveSection(Section.Login);
  };

  const handleAddBook = async (title: string, author: string, language: string, coverFile: File, pdfFile: File, isForSale: boolean, price: number) => {
    if (!currentUser) {
        const errorMessage = 'You must be logged in to upload a book.';
        showToast(errorMessage, 'error');
        setActiveSection(Section.Login);
        throw new Error(errorMessage);
    }
    const MAX_SIZE_MB = 3;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (coverFile.size > MAX_SIZE_BYTES || pdfFile.size > MAX_SIZE_BYTES) {
        const errorMessage = `Files cannot be larger than ${MAX_SIZE_MB}MB due to browser storage limits.`;
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
    }
    let coverDataUrl: string, pdfDataUrl: string;
    try {
        coverDataUrl = await fileToDataUrl(coverFile);
        pdfDataUrl = await fileToDataUrl(pdfFile);
    } catch (error) {
        const errorMessage = 'Failed to process files. They may be corrupted or too large.';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
    }
    let tags: string[] = [];
    try {
        if (process.env.API_KEY) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const pdfFileForAnalysis = dataURLtoFile(pdfDataUrl, pdfFile.name);
            const pdfPart = await fileToGenerativePart(pdfFileForAnalysis);
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
        showToast('Book uploaded, but tag generation failed.', 'error');
    }
    const newBook: Book = {
      id: `book-${Date.now()}`, title, author, language, coverDataUrl, pdfDataUrl, pdfFileName: pdfFile.name,
      pdfMimeType: pdfFile.type, uploadedBy: currentUser.username, status: 'pending', isForSale,
      price: isForSale ? price : 0, tags,
    };
    setBooks(prevBooks => [newBook, ...prevBooks]);
    showToast('Book submitted for admin approval!');
    setActiveSection(Section.MyBooks);
  };

  const handleDeleteBook = (bookId: string) => {
    if(window.confirm('Are you sure you want to delete this book?')) {
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
        setReviews(prevReviews => prevReviews.filter(review => review.bookId !== bookId));
        setPurchases(prevPurchases => prevPurchases.filter(p => p.bookId !== bookId));
        showToast('Book removed successfully.', 'success');
    }
  };

  const handleApproveBook = (bookId: string) => {
    setBooks(prevBooks => prevBooks.map(book => book.id === bookId ? { ...book, status: 'approved' } : book));
    showToast('Book approved and published!', 'success');
  };
  
  const handleAddReview = (bookId: string, rating: number, comment: string) => {
      if (!currentUser) {
        showToast('You must be logged in to leave a review.', 'error');
        setActiveSection(Section.Login);
        return;
      }
      const newReview: Review = {
        id: `review-${Date.now()}`, bookId, username: currentUser.username, rating, comment, createdAt: Date.now(),
      };
      setReviews(prevReviews => [newReview, ...prevReviews]);
      showToast('Your review has been submitted!', 'success');
  };

  const handleRequestPurchase = (bookId: string) => {
    if (!currentUser) {
      showToast('You must be logged in to purchase a book.', 'error');
      setActiveSection(Section.Login);
      return;
    }
    const bookToPurchase = books.find(b => b.id === bookId);
    if (bookToPurchase) {
      const newPurchase: Purchase = {
        id: `purchase-${Date.now()}`, userId: currentUser.username, bookId, status: 'pending',
        createdAt: Date.now(), referenceCode: `KHW-${Date.now().toString().slice(-6)}`,
      };
      setPurchases(prev => [...prev, newPurchase]);
      setPaymentMethodSelectionState({ isOpen: true, purchase: newPurchase });
    }
  };
  
  const handleSelectPaymentMethod = (method: PaymentMethod, purchase: Purchase) => {
    setPaymentMethodSelectionState({ isOpen: false, purchase: null });
    switch (method) {
      case PaymentMethod.Binance:
        setBinancePaymentState({ isOpen: true, purchase });
        break;
      case PaymentMethod.Card:
        setCardPaymentState({ isOpen: true, purchase });
        break;
      case PaymentMethod.Mobile:
        setMobilePaymentState({ isOpen: true, purchase });
        break;
    }
  };
  
  const handlePaymentSuccess = (purchaseId: string) => {
    const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
    if (purchaseIndex === -1) {
        showToast('Purchase record not found.', 'error');
        return;
    }
    const purchase = purchases[purchaseIndex];
    const userIndex = users.findIndex(u => u.username === purchase.userId);
    if (userIndex === -1) {
        showToast('User for this purchase not found.', 'error');
        return;
    }
    const updatedPurchases = [...purchases];
    updatedPurchases[purchaseIndex] = { ...purchase, status: 'completed' };
    setPurchases(updatedPurchases);

    const updatedUsers = [...users];
    const user = updatedUsers[userIndex];
    const updatedUser = { ...user, purchasedBookIds: [...user.purchasedBookIds, purchase.bookId] };
    updatedUsers[userIndex] = updatedUser;
    setUsers(updatedUsers);

    if (currentUser?.username === user.username) {
        setCurrentUser(updatedUser);
    }

    handleClosePaymentModals();
    showToast('Payment successful! The book has been added to your purchases.', 'success');
  };

  const handleClosePaymentModals = () => {
    setPaymentMethodSelectionState({ isOpen: false, purchase: null });
    setBinancePaymentState({ isOpen: false, purchase: null });
    setCardPaymentState({ isOpen: false, purchase: null });
    setMobilePaymentState({ isOpen: false, purchase: null });
  };


  const handleRequestSummary = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    setSummarizeState({ isOpen: true, book, isLoading: true, summary: '', error: '' });
    try {
      if (!process.env.API_KEY) throw new Error("API key is not configured.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const pdfFile = dataURLtoFile(book.pdfDataUrl, book.pdfFileName);
      const pdfPart = await fileToGenerativePart(pdfFile);
      const prompt = "Summarize this book's plot, themes, and audience in a concise Pashto paragraph.";
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [pdfPart, {text: prompt}] } });
      setSummarizeState(s => ({ ...s, summary: response.text, isLoading: false }));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setSummarizeState(s => ({ ...s, error: `Could not generate summary: ${errorMessage}`, isLoading: false }));
    }
  };
  
  const handleCloseSummary = () => setSummarizeState({ isOpen: false, book: null, isLoading: false, summary: '', error: '' });
  
  const handleRequestEdit = (bookId: string) => {
    const bookToEdit = books.find(b => b.id === bookId);
    if (bookToEdit) setEditState({ isOpen: true, book: bookToEdit });
  };

  const handleCloseEdit = () => setEditState({ isOpen: false, book: null });

  const handleUpdateBook = (bookId: string, updates: Partial<Pick<Book, 'title' | 'author' | 'language' | 'isForSale' | 'price' | 'tags'>>) => {
    setBooks(prevBooks => prevBooks.map(book => book.id === bookId ? { ...book, ...updates } : book));
    showToast('Book details updated successfully!', 'success');
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    showToast('Payment settings saved successfully!', 'success');
  };

  const handleAddAd = (adData: Omit<Ad, 'id'>) => {
    const newAd: Ad = { id: `ad-${Date.now()}`, ...adData };
    setAds(prevAds => [...prevAds, newAd]);
    showToast('Advertisement created successfully!', 'success');
  };

  const handleUpdateAd = (adId: string, adData: Omit<Ad, 'id'>) => {
    setAds(prevAds => prevAds.map(ad => (ad.id === adId ? { id: adId, ...adData } : ad)));
    showToast('Advertisement updated successfully!', 'success');
  };

  const handleDeleteAd = (adId: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      showToast('Advertisement deleted.', 'success');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chat) return;

    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatLoading(true);

    const bookListForContext = books
        .filter(b => b.status === 'approved')
        .map(b => ({ title: b.title, author: b.author, language: b.language, price: b.price, tags: b.tags }));
    const contextPrompt = `Here is the current context:\nCurrent User: ${currentUser ? currentUser.name : 'Guest'}\nList of available books: ${JSON.stringify(bookListForContext)}\n\nUser's message: "${message}"`;

    try {
        const response = await chat.sendMessage({ message: contextPrompt });
        const responseText = response.text;
        
        const navRegex = /\[NAVIGATE:([\w-]+)\]/;
        const match = responseText.match(navRegex);

        if (match && match[1]) {
            const section = match[1] as Section;
            if (Object.values(Section).includes(section)) {
                setActiveSection(section);
                setIsChatOpen(false); // Close chat on navigation
                const navConfirmationMsg = `Sure, taking you to the ${section.replace(/-/g, ' ')} page.`;
                showToast(navConfirmationMsg);
            } else {
                const errorMsg = "I'm sorry, I can't navigate to that section.";
                setChatMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
            }
        } else {
            setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
        }
    } catch (error) {
        console.error("Chat error:", error);
        const errorMsg = "I'm sorry, I encountered an error. Please try again.";
        setChatMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    // Navigate to books section if user starts searching from another page
    if (query && activeSection !== Section.Books) {
      setActiveSection(Section.Books);
    }
  };

  const renderSection = () => {
    const containerClasses = "bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 sm:p-8 animate-fade-in";
    const approvedBooks = books.filter(b => b.status === 'approved');
    const pendingPurchaseBookIds = purchases.filter(p => p.userId === currentUser?.username && p.status === 'pending').map(p => p.bookId);

    switch (activeSection) {
      case Section.Register: return <div className={containerClasses}><RegisterForm onRegister={handleRegister} /></div>;
      case Section.Login: return <div className={containerClasses}><LoginForm onLogin={handleLogin} onNavigate={setActiveSection} /></div>;
      case Section.ForgotPassword: return <div className={containerClasses}><ForgotPasswordForm onForgotPasswordRequest={handleForgotPasswordRequest} onResetPassword={handleResetPassword} /></div>;
      case Section.Upload: return <div className={containerClasses}><UploadForm onUpload={handleAddBook} /></div>;
      case Section.Admin:
        if (currentUser?.role !== 'admin') { setActiveSection(Section.Books); return null; }
        const pendingBooks = books.filter(b => b.status === 'pending' && b.uploadedBy !== currentUser.username);
        return <div className={containerClasses}><AdminPanel books={pendingBooks} currentUser={currentUser} onApprove={handleApproveBook} onReject={handleDeleteBook} onRequestSummary={handleRequestSummary} onRequestEdit={handleRequestEdit} reviews={reviews} onAddReview={handleAddReview} onNavigate={setActiveSection} /></div>;
      case Section.MyBooks:
        if (!currentUser) { setActiveSection(Section.Login); return null; }
        const myBooks = books.filter(b => b.uploadedBy === currentUser.username).sort((a, b) => (a.status > b.status) ? 1 : -1);
        return <div className={containerClasses}><MyBooks books={myBooks} currentUser={currentUser} onDelete={handleDeleteBook} onApprove={handleApproveBook} onRequestSummary={handleRequestSummary} onRequestEdit={handleRequestEdit} reviews={reviews} onAddReview={handleAddReview} onNavigate={setActiveSection} /></div>;
      case Section.MyPurchases:
          if (!currentUser) { setActiveSection(Section.Login); return null; }
          const purchasedBooks = books.filter(b => currentUser.purchasedBookIds.includes(b.id));
          return <div className={containerClasses}><MyPurchases books={purchasedBooks} currentUser={currentUser} reviews={reviews} onAddReview={handleAddReview} onRequestSummary={handleRequestSummary} onNavigate={setActiveSection} /></div>;
      case Section.AdsManager:
        if (currentUser?.role !== 'admin') { setActiveSection(Section.Books); return null; }
        return <div className={containerClasses}><AdManager ads={ads} onAdd={handleAddAd} onUpdate={handleUpdateAd} onDelete={handleDeleteAd} /></div>;
      case Section.Orders:
        if (currentUser?.role !== 'admin') { setActiveSection(Section.Books); return null; }
        return <div className={containerClasses}><OrderManagement purchases={purchases} books={books} users={users} /></div>;
      case Section.Settings:
        if (currentUser?.role !== 'admin') { setActiveSection(Section.Books); return null; }
        return <div className={containerClasses}><PaymentSettings settings={settings} onSave={handleSaveSettings} /></div>;
      case Section.Books:
      default:
        return <div className={containerClasses}><BookList books={approvedBooks} ads={ads} currentUser={currentUser} onDelete={handleDeleteBook} onRequestSummary={handleRequestSummary} onRequestEdit={handleRequestEdit} onPurchase={handleRequestPurchase} reviews={reviews} onAddReview={handleAddReview} pendingPurchaseBookIds={pendingPurchaseBookIds} searchQuery={searchQuery} onNavigate={setActiveSection} /></div>;
    }
  };

  if (!isInitialized) return <div className="flex justify-center items-center min-h-screen"><i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i></div>;

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 flex flex-col">
      <Header onNavigate={setActiveSection} currentUser={currentUser} onLogout={handleLogout} searchQuery={searchQuery} setSearchQuery={handleSetSearchQuery} theme={theme} toggleTheme={toggleTheme} />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex-grow">
        {renderSection()}
      </main>
      <Footer onNavigate={setActiveSection} />
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
        {toasts.map(toast => <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => closeToast(toast.id)} />)}
      </div>
      {summarizeState.isOpen && <SummarizeModal isOpen={summarizeState.isOpen} onClose={handleCloseSummary} bookTitle={summarizeState.book?.title || ''} summary={summarizeState.summary} isLoading={summarizeState.isLoading} error={summarizeState.error} />}
      {editState.isOpen && <EditBookModal isOpen={editState.isOpen} onClose={handleCloseEdit} book={editState.book} onUpdate={handleUpdateBook} />}
      
      {paymentMethodSelectionState.isOpen && (
        <PaymentMethodSelectionModal
          isOpen={paymentMethodSelectionState.isOpen}
          onClose={handleClosePaymentModals}
          onSelectMethod={handleSelectPaymentMethod}
          purchase={paymentMethodSelectionState.purchase}
          book={books.find(b => b.id === paymentMethodSelectionState.purchase?.bookId)}
        />
      )}
      {binancePaymentState.isOpen && (
        <BinancePaymentModal
          isOpen={binancePaymentState.isOpen}
          onClose={handleClosePaymentModals}
          onSuccess={handlePaymentSuccess}
          purchase={binancePaymentState.purchase}
          book={books.find(b => b.id === binancePaymentState.purchase?.bookId)}
        />
      )}
      {cardPaymentState.isOpen && (
        <CardPaymentModal
          isOpen={cardPaymentState.isOpen}
          onClose={handleClosePaymentModals}
          onSuccess={handlePaymentSuccess}
          purchase={cardPaymentState.purchase}
          book={books.find(b => b.id === cardPaymentState.purchase?.bookId)}
        />
      )}
      {mobilePaymentState.isOpen && (
        <MobilePaymentModal
          isOpen={mobilePaymentState.isOpen}
          onClose={handleClosePaymentModals}
          onSuccess={handlePaymentSuccess}
          purchase={mobilePaymentState.purchase}
          book={books.find(b => b.id === mobilePaymentState.purchase?.bookId)}
        />
      )}
      {chat && (
        <Chatbot
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
        />
       )}
    </div>
  );
};

export default App;
