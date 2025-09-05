import React from 'react';

interface FileInputProps {
  id: string;
  label: string;
  iconClass: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, iconClass, accept, file, onFileChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="form-group flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-indigo-400 dark:hover:border-indigo-500"
      >
        {file ? (
          <div className="text-center text-emerald-600 dark:text-emerald-400">
            <i className="fas fa-check-circle text-3xl mb-2"></i>
            <span className="font-semibold">{file.name}</span>
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400">
            <i className={`fas ${iconClass} text-3xl mb-2`}></i>
            <span>{label}</span>
          </div>
        )}
      </label>
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileInput;