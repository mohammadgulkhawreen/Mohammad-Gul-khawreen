
import React, { useEffect, useRef, useState } from 'react';
import { Book } from '../types';

// Let TypeScript know that pdfjsLib is available globally
declare var pdfjsLib: any;

interface BookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

type SpeechStatus = 'idle' | 'speaking' | 'paused' | 'unavailable';
type PreviewTheme = 'light' | 'sepia' | 'dark';

const BookPreviewModal: React.FC<BookPreviewModalProps> = ({ isOpen, onClose, book }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [previewPages, setPreviewPages] = useState(0);

  // New states for reader experience
  const [scale, setScale] = useState(1.2);
  const [theme, setTheme] = useState<PreviewTheme>('light');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [extractedText, setExtractedText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !book) return;

    // Reset state for the new preview
    setIsLoading(true);
    setError('');
    setTotalPages(0);
    setPreviewPages(0);
    setExtractedText('');
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = ''; // Clear previous preview
    }
    
    // Cancel any ongoing speech when a new book is opened
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setSpeechStatus('idle');
    }

    const renderPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(book.pdfUrl).promise;
        setTotalPages(pdf.numPages);

        const numPagesToPreview = Math.min(5, pdf.numPages); // Preview up to 5 pages
        setPreviewPages(numPagesToPreview);
        
        let allText = '';

        for (let i = 1; i <= numPagesToPreview; i++) {
          const page = await pdf.getPage(i);
          const desiredWidth = canvasContainerRef.current?.clientWidth || 600;
          const viewport = page.getViewport({ scale: 1 });
          const initialScale = desiredWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale: initialScale * scale });

          const canvas = document.createElement('canvas');
          canvas.className = 'mb-4 shadow-lg rounded-md border border-slate-200 dark:border-slate-600';
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not get canvas context');

          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          if (canvasContainerRef.current) {
            canvasContainerRef.current.appendChild(canvas);
          }

          await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
          
          // Extract text for TTS
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          allText += pageText + '\n\n';
        }
        setExtractedText(allText);

      } catch (err) {
        console.error('Failed to render PDF preview:', err);
        setError('Could not load PDF preview. The file might be corrupted or in an unsupported format.');
      } finally {
        setIsLoading(false);
      }
    };

    renderPdf();
  }, [isOpen, book, scale]);

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(currentScale => {
        const newScale = direction === 'in' ? currentScale + 0.2 : currentScale - 0.2;
        return Math.max(0.5, Math.min(3, newScale));
    });
  };

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handlePlayPauseSpeech = () => {
    if (speechStatus === 'speaking') {
      speechSynthesis.pause();
      setSpeechStatus('paused');
    } else if (speechStatus === 'paused') {
      speechSynthesis.resume();
      setSpeechStatus('speaking');
    } else if (speechStatus === 'idle' && extractedText) {
      const utterance = new SpeechSynthesisUtterance(extractedText);
      utteranceRef.current = utterance;
      
      const langMap: { [key: string]: string[] } = {
        'Pashto': ['ps-AF', 'ps'], 'Dari': ['fa-AF', 'fa'], 'English': ['en-US', 'en-GB', 'en'],
      };
      const targetLangs = (book && langMap[book.language]) || ['en-US', 'en'];
      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;
      for (const langCode of targetLangs) {
        selectedVoice = voices.find(voice => voice.lang.startsWith(langCode));
        if (selectedVoice) break;
      }
      if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];

      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice?.lang || 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setSpeechStatus('idle');
      utterance.onerror = () => setSpeechStatus('idle');

      speechSynthesis.speak(utterance);
      setSpeechStatus('speaking');
    }
  };

  const handleStopSpeech = () => {
    speechSynthesis.cancel();
    setSpeechStatus('idle');
  };

  const handleCloseModal = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setSpeechStatus('idle');
    }
    onClose();
  };


  if (!isOpen) return null;

  const themeClasses: Record<PreviewTheme, string> = {
    light: 'bg-slate-100 dark:bg-slate-900/50',
    sepia: 'bg-[#fbf0d9] dark:bg-[#5a4d3c]',
    dark: 'bg-gray-800 dark:bg-black',
  };
  const canvasFilterClass = theme === 'dark' ? 'dark-theme-canvas-filter' : '';


  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[90] flex justify-center items-center p-0 sm:p-4 ${isFullScreen ? 'bg-white dark:bg-slate-800' : ''}`}
      onClick={handleCloseModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <style>{`.dark-theme-canvas-filter { filter: invert(1) hue-rotate(180deg); }`}</style>
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full h-full flex flex-col transform transition-all duration-300 ease-out animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="w-1/3">
             <h2 id="preview-modal-title" className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
                {book?.title}
            </h2>
            {previewPages > 0 && totalPages > 0 && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Showing {previewPages} of {totalPages} pages</p>
            )}
          </div>

          {/* Reading Toolbar */}
          <div className="w-1/3 flex justify-center items-center gap-2 sm:gap-3">
             <button title="Zoom Out" onClick={() => handleZoom('out')} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"><i className="fas fa-search-minus text-slate-600 dark:text-slate-300"></i></button>
             <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-12 text-center">{(scale * 100).toFixed(0)}%</span>
             <button title="Zoom In" onClick={() => handleZoom('in')} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"><i className="fas fa-search-plus text-slate-600 dark:text-slate-300"></i></button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1 sm:mx-2"></div>
             <button title="Light Theme" onClick={() => setTheme('light')} className={`w-8 h-8 rounded-full bg-white border-2 ${theme === 'light' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}></button>
             <button title="Sepia Theme" onClick={() => setTheme('sepia')} className={`w-8 h-8 rounded-full bg-[#fbf0d9] border-2 ${theme === 'sepia' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}></button>
             <button title="Dark Theme" onClick={() => setTheme('dark')} className={`w-8 h-8 rounded-full bg-gray-800 border-2 ${theme === 'dark' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}></button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1 sm:mx-2"></div>
             {speechStatus !== 'unavailable' && (
                <>
                <button title={speechStatus === 'speaking' ? 'Pause' : 'Listen'} onClick={handlePlayPauseSpeech} disabled={!extractedText || isLoading} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors disabled:opacity-50"><i className={`fas ${speechStatus === 'speaking' ? 'fa-pause' : 'fa-play'} text-slate-600 dark:text-slate-300`}></i></button>
                {(speechStatus === 'speaking' || speechStatus === 'paused') && <button title="Stop" onClick={handleStopSpeech} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"><i className="fas fa-stop text-slate-600 dark:text-slate-300"></i></button>}
                </>
             )}
          </div>
          
          <div className="w-1/3 flex justify-end items-center gap-4">
            <button onClick={handleToggleFullScreen} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'} text-xl`}></i>
            </button>
            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </header>

        <main className={`flex-grow overflow-y-auto p-4 transition-colors duration-300 ${themeClasses[theme]}`}>
          {isLoading && (
            <div className="flex justify-center items-center h-full text-center">
              <div>
                <i className="fas fa-spinner fa-spin text-4xl text-indigo-500 dark:text-indigo-400 mb-4"></i>
                <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg">Loading Preview...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center items-center h-full text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-6">
                <div>
                    <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <p className="text-red-700 dark:text-red-300 font-semibold text-lg">An Error Occurred</p>
                    <p className="text-red-600 dark:text-red-400 mt-2 text-sm">{error}</p>
                </div>
            </div>
          )}
          <div ref={canvasContainerRef} className={`flex flex-col items-center ${canvasFilterClass}`}>
            {/* Canvases will be appended here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookPreviewModal;
