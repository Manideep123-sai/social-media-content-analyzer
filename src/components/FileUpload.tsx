import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ExtractionProgress } from '../types';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  progress: ExtractionProgress;
  onClear: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  progress,
  onClear
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcess(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcess(file);
    }
  };

  const validateAndProcess = (file: File) => {
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      alert('Please upload a valid PDF or image file (.pdf, .png, .jpg, .jpeg, .webp)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please upload a smaller document.');
      return;
    }

    onFileSelected(file);
  };

  const isExtracting = ['uploading', 'parsing_pdf', 'running_ocr', 'analyzing'].includes(progress.status);

  return (
    <div className="w-full">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer select-none overflow-hidden ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[0.99] shadow-lg shadow-indigo-500/10'
            : isExtracting
            ? 'border-indigo-500/40 bg-slate-800/60 cursor-wait'
            : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
        }`}
      >
        {/* Background glow when active */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />
        )}

        {isExtracting ? (
          /* Extraction In-Progress State */
          <div className="py-4 flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
            </div>

            <div className="max-w-md w-full px-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="truncate max-w-[240px] text-indigo-300">
                  {progress.fileName || 'Processing Document'}
                </span>
                <span className="font-mono text-indigo-400">{progress.progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${Math.max(5, progress.progress)}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 mt-2 animate-pulse">
                {progress.message || 'Extracting post content...'}
              </p>
            </div>
          </div>
        ) : (
          /* Idle / Ready to Upload State */
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-md">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm sm:text-base font-semibold text-slate-200">
                Drop your PDF or Image here, or <span className="text-indigo-400 underline underline-offset-4">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF documents, screenshots, and scanned post drafts (PNG, JPG, WEBP up to 20MB)
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <FileText className="w-3 h-3 text-rose-400" />
                <span>PDF Document Parsing</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <ImageIcon className="w-3 h-3 text-emerald-400" />
                <span>Tesseract OCR Engine</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error state if any */}
      {progress.status === 'error' && (
        <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-rose-200">Extraction Error</p>
            <p className="mt-0.5 text-rose-300/90">{progress.error || 'Failed to extract text from document.'}</p>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-rose-400 hover:text-rose-200 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
