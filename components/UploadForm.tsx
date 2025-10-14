import React, { useState, useRef } from 'react';
import FileInput from './FileInput';
import { GoogleGenAI } from "@google/genai";

interface UploadFormProps {
  onUpload: (title: string, author: string, language: string, coverFile: File, pdfFile: File, isForSale: boolean, price: number) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUpload, showToast }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('Pashto');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleGenerateCover = async () => {
    if (!title.trim() || !author.trim()) {
      showToast('Please enter a title and author first.', 'error');
      return;
    }
    if (!process.env.API_KEY) {
      showToast('AI features are disabled. API key is not configured.', 'error');
      return;
    }

    setIsGeneratingCover(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Minimalist book cover for a book titled "${title}" by ${author}. Abstract, artistic, high quality, no text on the image.`;
      
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4', // Common book cover aspect ratio
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64Image = response.generatedImages[0].image.imageBytes;
        
        // Create an image element to draw on canvas
        const image = new Image();
        const imageLoadPromise = new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('Failed to load generated image. It might be corrupted.'));
        });
        image.src = `data:image/jpeg;base64,${base64Image}`;
        await imageLoadPromise;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // Draw original image
        ctx.drawImage(image, 0, 0);

        // --- Add Text Overlay ---
        const isRtl = language === 'Pashto' || language === 'Dari';
        const fontFamily = isRtl ? "'Noto Naskh Arabic', 'Tahoma', 'Arial', sans-serif" : "'Helvetica', 'Arial', sans-serif";

        // Text properties for better readability
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        if (isRtl) {
            ctx.direction = 'rtl';
        }

        // Font sizes relative to image width for responsiveness
        const titleFontSize = Math.round(canvas.width / 15);
        const authorFontSize = Math.round(canvas.width / 20);
        const langFontSize = Math.round(canvas.width / 25);
        
        // Y positions calculated from the bottom for consistent placement
        const bottomMargin = canvas.height * 0.05;
        const lineSpacing = authorFontSize * 0.5;

        const langY = canvas.height - bottomMargin;
        const authorY = langY - langFontSize - lineSpacing;
        const titleY = authorY - authorFontSize - lineSpacing;

        // Translate language name to native script
        const getLanguageNameInNativeScript = (lang: string) => {
            switch (lang) {
                case 'Pashto': return 'پښتو';
                case 'Dari': return 'دری';
                case 'English': return 'انګلیسي';
                default: return lang;
            }
        };

        // Draw Language
        ctx.font = `${langFontSize}px ${fontFamily}`;
        ctx.fillText(getLanguageNameInNativeScript(language), canvas.width / 2, langY);

        // Draw Author
        ctx.font = `${authorFontSize}px ${fontFamily}`;
        ctx.fillText(author, canvas.width / 2, authorY);
        
        // Draw Title (Bold)
        ctx.font = `bold ${titleFontSize}px ${fontFamily}`;
        ctx.fillText(title, canvas.width / 2, titleY);
        // --- End Text Overlay ---

        // Convert canvas to blob
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

        if (blob) {
            const fileName = `${title.replace(/\s+/g, '_')}_cover.jpg`;
            const generatedFile = new File([blob], fileName, { type: 'image/jpeg' });
            
            setCoverFile(generatedFile);
            showToast('AI cover generated with text!', 'success');
        } else {
             throw new Error('Failed to convert canvas to blob.');
        }

      } else {
        throw new Error('No image was generated by the AI.');
      }
    } catch (e) {
      console.error('AI Cover Generation Error:', e);
      let userFriendlyMessage = 'د پوښ په جوړولو کې یوه نامعلومه ستونزه رامنځته شوه.'; // An unknown error occurred while generating the cover.

      let errorMessage = '';
      if (e instanceof Error) {
        errorMessage = e.message.toLowerCase();
      } else if (typeof e === 'string') {
        errorMessage = e.toLowerCase();
      } else if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as any).message === 'string') {
        errorMessage = (e as any).message.toLowerCase();
      }
      
      if (errorMessage) {
          if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('quota') || errorMessage.includes('limited free generations')) {
              userFriendlyMessage = 'تاسو د انځور جوړولو لپاره د خپلې ورځې وړیا ونډې (quota) حد ته رسېدلي یاست. لطفا سبا بیا هڅه وکړئ.'; // You have reached your daily free quota for image generation. Please try again tomorrow.
          } else if (errorMessage.includes('api key not valid')) {
              userFriendlyMessage = 'ستاسو API کیلي ناسمه ده. لطفا ترتیبات وګورئ.'; // Your API key is not valid. Please check the settings.
          } else if (errorMessage.includes('no image was generated')) {
              userFriendlyMessage = 'د AI لخوا کوم انځور جوړ نشو. لطفا بیا هڅه وکړئ.'; // No image was generated by the AI. Please try again.
          } else if (errorMessage.includes('failed to load generated image')) {
              userFriendlyMessage = 'انځور جوړ شو، خو په لوډولو کې یې ستونزه راغله. کېدای شي انځور خراب وي.'; // Image was generated, but failed to load. It might be corrupted.
          } else if (errorMessage.includes('failed to convert canvas to blob')) {
              userFriendlyMessage = 'انځور جوړ شو، خو پرې د لیکنې پر مهال ستونزه راغله.'; // Image was generated, but an error occurred while writing text on it.
          } else {
              userFriendlyMessage = 'د پوښ په جوړولو کې ستونزه رامنځته شوه. لطفا خپله انټرنیټ اړیکه او API کیلي وګورئ.'; // An error occurred while generating the cover. Please check your internet connection and API key.
          }
      }
      showToast(userFriendlyMessage, 'error');
    } finally {
      setIsGeneratingCover(false);
    }
  };


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
          <label htmlFor="language" className="font-semibold text-slate-700 dark:text-slate-300">Language</label>
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 appearance-none"
            >
              <option value="Pashto">Pashto</option>
              <option value="Dari">Dari</option>
              <option value="English">English</option>
              <option value="Other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-400">
                <i className="fas fa-chevron-down h-5 w-5"></i>
            </div>
          </div>
        </div>

        <FileInput 
          id="cover"
          label="Click to upload cover image (JPEG, PNG, WebP, GIF)"
          iconClass="fa-image"
          accept="image/jpeg, image/png, image/webp, image/gif"
          file={coverFile}
          onFileChange={setCoverFile}
        />
        
        <div className="flex justify-center -mt-3 mb-2">
          <button
            type="button"
            onClick={handleGenerateCover}
            disabled={isGeneratingCover || !title.trim() || !author.trim()}
            className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold py-2 px-5 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingCover ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Generating...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i> Generate Cover with AI
              </>
            )}
          </button>
        </div>
        
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
                        className="p-3 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
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