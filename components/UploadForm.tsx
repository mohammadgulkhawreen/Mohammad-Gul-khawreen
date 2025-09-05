import React, { useState, useRef } from 'react';
import FileInput from './FileInput';

interface UploadFormProps {
  onUpload: (title: string, author: string, language: string, coverFile: File, pdfFile: File, isForSale: boolean, price: number) => Promise<void>;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUpload }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('Pashto');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !language || !coverFile || !pdfFile) {
      alert('All fields are required.');
      return;
    }
    if (isForSale && (!price || Number(price) <= 0)) {
        alert('Please enter a valid price for the book.');
        return;
    }
    setIsUploading(true);
    try {
        await onUpload(title, author, language, coverFile, pdfFile, isForSale, Number(price));
        // Reset state for controlled components
        setTitle('');
        setAuthor('');
        setLanguage('Pashto');
        setCoverFile(null);
        setPdfFile(null);
        setIsForSale(false);
        setPrice('');
        // Reset the entire form element to clear native file inputs
        if (formRef.current) {
          formRef.current.reset();
        }
    } catch (error) {
        console.error("Upload failed", error);
        // An error toast will be shown by the App component
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
        <i className="fas fa-upload"></i>
        Share Your Book
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="form-group flex flex-col gap-2">
          <label htmlFor="title" className="font-semibold text-slate-700 dark:text-slate-300">Book Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
            required
            className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>
        <div className="form-group flex flex-col gap-2">
          <label htmlFor="author" className="font-semibold text-slate-700 dark:text-slate-300">Author Name</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
            required
            className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>
        
        <div className="form-group flex flex-col gap-2">
          <label htmlFor="language" className="font-semibold text-slate-700 dark:text-slate-300">Language (ژبه)</label>
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 appearance-none"
            >
              <option value="Pashto">پښتو (Pashto)</option>
              <option value="Dari">دری (Dari)</option>
              <option value="English">انګلیسي (English)</option>
              <option value="Other">نور (Other)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-400">
                <i className="fas fa-chevron-down h-5 w-5"></i>
            </div>
          </div>
        </div>

        <FileInput 
          id="cover"
          label="Click to upload cover image (JPEG, PNG)"
          iconClass="fa-image"
          accept="image/jpeg, image/png"
          file={coverFile}
          onFileChange={setCoverFile}
        />
        
        <FileInput
          id="pdf"
          label="Click to upload PDF document"
          iconClass="fa-file-pdf"
          accept="application/pdf"
          file={pdfFile}
          onFileChange={setPdfFile}
        />
        
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="isForSale"
                    checked={isForSale}
                    onChange={(e) => setIsForSale(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-200 dark:bg-slate-600"
                />
                <label htmlFor="isForSale" className="font-semibold text-slate-700 dark:text-slate-300">This book is for sale</label>
            </div>
            {isForSale && (
                <div className="mt-4 animate-fade-in">
                    <label htmlFor="price" className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">Price (AFN)</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g., 500"
                        min="0"
                        step="1"
                        required
                        className="p-3 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700"
                    />
                </div>
            )}
        </div>


        <button
          type="submit"
          disabled={isUploading}
          className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 mt-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Uploading...
              </>
          ) : (
              <>
                <i className="fas fa-upload"></i>
                Upload Book
              </>
          )}
        </button>
      </form>
    </>
  );
};

export default UploadForm;