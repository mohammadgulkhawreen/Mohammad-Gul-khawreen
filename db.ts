import { User, Book, Review, Ad, Purchase, Settings } from './types';

// Constants for localStorage keys
const DB_KEY = 'khawreen_library_db';
const SESSION_KEY = 'khawreen_library_session';

// Define the structure of our local database
interface LocalDB {
  users: User[];
  books: Book[];
  reviews: Review[];
  ads: Ad[];
  purchases: Purchase[];
  settings: Settings[]; // Stored as an array with one item for consistency
}

// Custom event to notify subscribers of data changes
const dispatchDataChangeEvent = () => {
  window.dispatchEvent(new CustomEvent('datachanged'));
};

const dispatchAuthChangeEvent = () => {
    window.dispatchEvent(new CustomEvent('authstatechanged'));
};


// --- Database Initialization ---
const getDB = (): LocalDB => {
  try {
    const dbString = localStorage.getItem(DB_KEY);
    if (dbString) {
      return JSON.parse(dbString);
    }
  } catch (error) {
    console.error("Could not parse local DB, resetting.", error);
    localStorage.removeItem(DB_KEY);
  }
  
  // If no DB exists or it was corrupt, create a new one
  const newDB: LocalDB = {
    users: [],
    books: [],
    reviews: [],
    ads: [],
    purchases: [],
    settings: [{ id: 'main', binanceApiKey: '', binanceApiSecret: '' }],
  };
  localStorage.setItem(DB_KEY, JSON.stringify(newDB));
  return newDB;
};

const saveDB = (db: LocalDB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  dispatchDataChangeEvent();
};


// --- Generic Collection Names ---
export const collections = {
    users: 'users',
    books: 'books',
    reviews: 'reviews',
    ads: 'ads',
    purchases: 'purchases',
    settings: 'settings',
} as const;
type CollectionName = keyof typeof collections;


// --- Generic Firestore-like Functions ---

export const onSnapshot = <T>(collectionName: CollectionName, callback: (data: T[]) => void): (() => void) => {
    const handleDataChange = () => {
        const db = getDB();
        // FIX: A direct cast to a generic array type is unsafe. Casting to 'unknown' first ensures type safety.
        callback(db[collectionName] as unknown as T[]);
    };
    window.addEventListener('datachanged', handleDataChange);
    // Initial call
    handleDataChange();
    
    // Return an unsubscribe function
    return () => {
        window.removeEventListener('datachanged', handleDataChange);
    };
};

export const get = async <T extends {id?: string; username?: string}>(collectionName: CollectionName, id: string): Promise<T | null> => {
    const db = getDB();
    const collection = db[collectionName];
    // User collection uses 'username' as id
    const keyField = collectionName === 'users' ? 'username' : 'id';
    return (collection.find(item => item[keyField] === id) as unknown as T) || null;
};


export const add = async <T extends { id: string }>(collectionName: CollectionName, item: T, id?: string) => {
    const db = getDB();
    const docId = id || item.id;
    // Fix: Unsafe direct cast to a generic array type. Casting to 'unknown' first ensures type safety.
    const collection = db[collectionName] as unknown as T[];
    const index = collection.findIndex((d: any) => d.id === docId);

    if (index > -1) {
        collection[index] = item;
    } else {
        collection.push(item);
    }
    saveDB(db);
};

export const update = async (collectionName: CollectionName, id: string, data: Partial<any>) => {
    const db = getDB();
    const collection = db[collectionName];
    // Handle users collection which uses email/username as id
    const keyField = collectionName === 'users' ? 'username' : 'id';
    
    const index = collection.findIndex((item: any) => item[keyField] === id);
    if (index > -1) {
        collection[index] = { ...collection[index], ...data };
        saveDB(db);
    }
};

export const deleteItem = async (collectionName: CollectionName, id: string) => {
    const db = getDB();
    (db[collectionName] as any[]) = db[collectionName].filter((item: any) => item.id !== id);
    saveDB(db);
};

// --- Authentication Functions ---
export const register = async (email: string, password: string, name: string, isAdmin: boolean = false) => {
    const db = getDB();
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }
    const userProfile: User = {
        username: email,
        email,
        name,
        password: password, // In a real app, hash this!
        role: isAdmin ? 'admin' : 'user',
        purchasedBookIds: []
    };
    db.users.push(userProfile);
    saveDB(db);
    return userProfile;
};

export const login = async (email: string, password: string): Promise<User> => {
    const db = getDB();
    const user = db.users.find(u => u.email === email);
    if (!user || user.password !== password) {
        throw new Error('Invalid email or password.');
    }
    localStorage.setItem(SESSION_KEY, user.email);
    dispatchAuthChangeEvent();
    // Return user without password
    const { password: _, ...userToReturn } = user;
    return userToReturn;
};

export const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    dispatchAuthChangeEvent();
};

export const sendPasswordReset = async (email: string): Promise<string | null> => {
    const db = getDB();
    const user = db.users.find(u => u.email === email);
    if (user && user.password) {
      console.log(`Password reset for ${email}. In this local version, the password is: ${user.password}`);
      return user.password;
    }
    return null;
};


export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
    const handleAuthChange = async () => {
        const userEmail = localStorage.getItem(SESSION_KEY);
        if (userEmail) {
            const userProfile = await get<User>('users', userEmail);
            if(userProfile) {
                const { password, ...userToReturn } = userProfile;
                callback(userToReturn);
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    };
    
    window.addEventListener('authstatechanged', handleAuthChange);
    // Initial call
    handleAuthChange();
    
    // Return unsubscribe function
    return () => {
        window.removeEventListener('authstatechanged', handleAuthChange);
    };
};

export const getUserCount = async (): Promise<number> => {
    const db = getDB();
    return db.users.length;
};

export const updateProfile = async (email: string, updates: { name?: string; currentPassword?: string; newPassword?: string }): Promise<User> => {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        throw new Error('User not found.');
    }

    const user = db.users[userIndex];

    if (updates.name) {
        user.name = updates.name;
    }

    if (updates.newPassword) {
        if (!updates.currentPassword || user.password !== updates.currentPassword) {
            throw new Error('Incorrect current password.');
        }
        if (updates.newPassword.length < 6) {
             throw new Error('Password must be at least 6 characters long.');
        }
        user.password = updates.newPassword;
    }
    
    db.users[userIndex] = user;
    saveDB(db);
    dispatchAuthChangeEvent(); // Notify listeners that user data has changed

    const { password: _, ...userToReturn } = user;
    return userToReturn;
};


// --- File Storage Simulation ---
export const uploadFile = (file: File | Blob, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- Application-Specific Logic ---
export const incrementDownloadCount = async (bookId: string) => {
    const book = await get<Book>('books', bookId);
    if(book) {
        const newCount = (book.downloadCount || 0) + 1;
        await update('books', bookId, { downloadCount: newCount });
    }
};

export const addBookToUserLibrary = async (bookId: string): Promise<boolean> => {
    const userEmail = localStorage.getItem(SESSION_KEY);
    if (!userEmail) return false;

    const userProfile = await get<User>('users', userEmail);
    if (!userProfile || userProfile.purchasedBookIds.includes(bookId)) return false;

    const updatedBookIds = [...userProfile.purchasedBookIds, bookId];
    await update('users', userEmail, { purchasedBookIds: updatedBookIds });
    dispatchAuthChangeEvent();
    return true;
};

export const deleteBook = async (book: Book) => {
    const db = getDB();
    // 1. Delete the book
    db.books = db.books.filter(b => b.id !== book.id);
    // 2. Delete reviews for the book
    db.reviews = db.reviews.filter(r => r.bookId !== book.id);
    // 3. Remove book from users' purchased lists
    db.users.forEach(user => {
        user.purchasedBookIds = user.purchasedBookIds.filter(id => id !== book.id);
    });
    saveDB(db);
};

// --- Settings ---
export const onSettingsSnapshot = (callback: (data: Settings | null) => void) => {
    const handleDataChange = () => {
        const db = getDB();
        callback(db.settings[0] || null);
    };
    window.addEventListener('datachanged', handleDataChange);
    handleDataChange(); // initial call
    return () => window.removeEventListener('datachanged', handleDataChange);
};

export const putSettings = async (settings: Omit<Settings, 'id'>) => {
    const db = getDB();
    db.settings[0] = { ...db.settings[0], ...settings, id: 'main' };
    saveDB(db);
};

// Initialize DB on first load
getDB();