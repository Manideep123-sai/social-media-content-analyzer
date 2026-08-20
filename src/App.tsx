import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { TextInput } from './components/TextInput';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { PlatformOptimizer } from './components/PlatformOptimizer';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { extractTextFromPDF } from './lib/pdfParser';
import { extractTextFromImage } from './lib/ocr';
import { analyzeContent } from './lib/analyzer';
import { AnalysisResult, ExtractionProgress } from './types';
import { SAMPLES } from './samples';
import { FileText, Sparkles, CheckCircle2, ArrowDown, HelpCircle, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [sourceType, setSourceType] = useState<'pdf' | 'image' | 'text' | 'sample'>('text');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleLoadSample = (sampleId: 'pdf' | 'image' | 'linkedin' | 'x') => {
    const sample = SAMPLES[sampleId];
    if (!sample) return;

    setContent(sample.content);
    setSourceType(sample.sourceType);
    setExtractionProgress({
      status: 'idle',
      progress: 0,
      message: ''
    });

    const res = analyzeContent(sample.content, sample.sourceType);
    setAnalysisResult(res);
  };

  const handleFileSelected = async (file: File) => {
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isImage = /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!isPDF && !isImage) {
      setExtractionProgress({
        status: 'error',
        progress: 0,
        message: 'Unsupported format',
        error: 'Please upload a PDF document (.pdf) or an image file (.png, .jpg, .webp).'
      });
      return;
    }

    try {
      if (isPDF) {
        setExtractionProgress({
          status: 'parsing_pdf',
          progress: 10,
          message: 'Reading PDF document...',
          fileName: file.name,
          fileSize: file.size,
          fileType: 'PDF Document'
        });

        const result = await extractTextFromPDF(file, (progress, message) => {
          setExtractionProgress(prev => ({
            ...prev,
            status: 'parsing_pdf',
            progress,
            message
          }));
        });

        if (!result.text.trim()) {
          throw new Error('No selectable text found in this PDF. If this is a scanned document, please convert it to an image for OCR processing.');
        }

        setContent(result.text);
        setSourceType('pdf');
        
        setExtractionProgress({
          status: 'complete',
          progress: 100,
          message: `Successfully extracted text (${result.pageCount} page${result.pageCount > 1 ? 's' : ''})`
        });

        // Run analysis
        const res = analyzeContent(result.text, 'pdf');
        setAnalysisResult(res);

      } else {
        // Image OCR
        setExtractionProgress({
          status: 'running_ocr',
          progress: 10,
          message: 'Initializing Tesseract OCR engine...',
          fileName: file.name,
          fileSize: file.size,
          fileType: 'Image'
        });

        const result = await extractTextFromImage(file, (progress, message) => {
          setExtractionProgress(prev => ({
            ...prev,
            status: 'running_ocr',
            progress,
            message
          }));
        });

        if (!result.text.trim()) {
          throw new Error('Could not identify recognizable text in this image. Please ensure good contrast and clear text.');
        }

        setContent(result.text);
        setSourceType('image');

        setExtractionProgress({
          status: 'complete',
          progress: 100,
          message: `OCR Complete (Confidence: ${Math.round(result.confidence)}%)`
        });

        // Run analysis
        const res = analyzeContent(result.text, 'image');
        setAnalysisResult(res);
      }
    } catch (err) {
      console.error('Extraction failure:', err);
      setExtractionProgress({
        status: 'error',
        progress: 0,
        message: 'Extraction failed',
        error: err instanceof Error ? err.message : 'Unknown error during extraction'
      });
    }
  };

  const handleManualAnalyze = (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeContent(textToAnalyze, sourceType);
      setAnalysisResult(res);
      setIsAnalyzing(false);
    }, 150);
  };

  const handleContentChange = (newText: string) => {
    setContent(newText);
    // If text was modified manually, update source type if it was idle
    if (sourceType === 'sample') {
      setSourceType('text');
    }
  };

  const handleApplyAiText = (newText: string) => {
    setContent(newText);
    const res = analyzeContent(newText, 'text');
    setAnalysisResult(res);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation & Toolbar */}
      <Header
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onLoadSample={handleLoadSample}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Hero Banner */}
        <section className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practical Assessment Solution • Production Grade</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Social Media Content Analyzer
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Upload PDF drafts or scanned post images to extract text via OCR, evaluate engagement with transparent heuristic scoring, and optimize for LinkedIn, X, and Instagram.
          </p>
        </section>

        {/* Step 1: Upload Zone */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-base sm:text-lg text-white">Upload Document or Scanned Post</h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              PDF Parsing + Tesseract.js OCR
            </span>
          </div>

          <FileUpload
            onFileSelected={handleFileSelected}
            progress={extractionProgress}
            onClear={() => setExtractionProgress({ status: 'idle', progress: 0, message: '' })}
          />
        </section>

        {/* Step 2 & 3: Side-by-Side Extracted Text & Engagement Analysis */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="font-bold text-base sm:text-lg text-white">
              Extracted Content & Heuristic Engagement Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Extracted Content & Live Text Editor */}
            <div className="lg:col-span-5 h-full">
              <TextInput
                text={content}
                onChange={handleContentChange}
                onAnalyze={handleManualAnalyze}
                sourceType={sourceType}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Right Column: Score & Breakdown Dashboard */}
            <div className="lg:col-span-7">
              {analysisResult ? (
                <AnalysisDashboard result={analysisResult} />
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Ready to Analyze</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
                      Upload a PDF document, scan an image with OCR, or paste your post copy to evaluate engagement score, readability, and platform rules.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs text-slate-400 mr-1">Quick test:</span>
                    <button
                      onClick={() => handleLoadSample('linkedin')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      LinkedIn Post
                    </button>
                    <button
                      onClick={() => handleLoadSample('x')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      X / Twitter
                    </button>
                    <button
                      onClick={() => handleLoadSample('pdf')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Strategy PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Step 4 & 5: Platform Optimizer & Actionable Suggestions */}
        {analysisResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Platform Insights */}
            <div>
              <PlatformOptimizer
                platforms={analysisResult.platforms}
                content={content}
              />
            </div>

            {/* Actionable Suggestions */}
            <div>
              <SuggestionsPanel
                suggestions={analysisResult.suggestions}
                content={content}
                apiKey={apiKey}
                onApplyText={handleApplyAiText}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Technical Assessment Project: Social Media Content Analyzer</span>
          </div>
          <p>
            Built with React, TypeScript, Tailwind CSS, pdfjs-dist, and Tesseract.js. Designed with a transparent heuristic scoring engine and 100% client-side privacy.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-4 text-indigo-400">
            <a
              href="https://github.com/Manideep123-sai/social-media-content-analyzer"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:underline"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
