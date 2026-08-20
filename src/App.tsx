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
import { analyzeContentWithAI } from './lib/aiService';
import { AnalysisResult, ExtractionProgress } from './types';
import { SAMPLES } from './samples';
import { Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [sourceType, setSourceType] = useState<'pdf' | 'image' | 'text' | 'sample'>('text');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Theme state: default to dark (Matte Black) or read from localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const executeAnalysis = async (
    text: string,
    srcType: 'pdf' | 'image' | 'text' | 'sample' = sourceType,
    keyToUse: string = apiKey
  ) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    try {
      if (keyToUse) {
        const aiRes = await analyzeContentWithAI(text, keyToUse, srcType);
        setAnalysisResult(aiRes);
      } else {
        const heurRes = analyzeContent(text, srcType);
        setAnalysisResult(heurRes);
      }
    } catch (err) {
      console.warn('AI analysis fell back to heuristic engine:', err);
      const heurRes = analyzeContent(text, srcType);
      setAnalysisResult(heurRes);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      if (content.trim()) {
        executeAnalysis(content, sourceType, key);
      }
    } else {
      localStorage.removeItem('gemini_api_key');
      if (content.trim()) {
        executeAnalysis(content, sourceType, '');
      }
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

    executeAnalysis(sample.content, sample.sourceType);
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

        await executeAnalysis(result.text, 'pdf');

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

        await executeAnalysis(result.text, 'image');
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
    executeAnalysis(textToAnalyze, sourceType);
  };

  const handleContentChange = (newText: string) => {
    setContent(newText);
    if (sourceType === 'sample') {
      setSourceType('text');
    }
  };

  const handleApplyAiText = (newText: string) => {
    setContent(newText);
    executeAnalysis(newText, 'text');
  };

  return (
    <div className="min-h-screen dark:bg-matte-950 bg-slate-50 dark:text-slate-100 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Navigation & Toolbar */}
      <Header
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onLoadSample={handleLoadSample}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Hero Banner */}
        <section className="text-center max-w-3xl mx-auto space-y-2 pt-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI + OCR Social Intelligence Platform</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Social Media Content Analyzer
          </h1>
          <p className="text-sm sm:text-base dark:text-slate-400 text-slate-600">
            Upload PDF drafts or scanned post images to extract text via OCR, evaluate engagement with blunt, realistic AI critiques, and optimize for LinkedIn, X, and Instagram.
          </p>
        </section>

        {/* Step 1: Upload Zone */}
        <section className="dark:bg-matte-900/90 bg-white border dark:border-matte-800 border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xl transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                1
              </span>
              <h2 className="font-bold text-base sm:text-lg dark:text-white text-slate-900">
                Upload Document or Scanned Post
              </h2>
            </div>
            <span className="text-xs dark:text-slate-400 text-slate-500 hidden sm:inline">
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
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              2
            </span>
            <h2 className="font-bold text-base sm:text-lg dark:text-white text-slate-900">
              Extracted Content & Engagement Analysis
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
              {isAnalyzing ? (
                <div className="dark:bg-matte-900/90 bg-white border dark:border-matte-800 border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-lg">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm font-semibold dark:text-slate-200 text-slate-800">
                    {apiKey ? 'Running Live Gemini AI Analysis...' : 'Calculating Engagement Heuristics...'}
                  </p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">
                    Evaluating hook strength, cadence, CTAs, and platform rules...
                  </p>
                </div>
              ) : analysisResult ? (
                <AnalysisDashboard result={analysisResult} />
              ) : (
                <div className="dark:bg-matte-900/90 bg-white border dark:border-matte-800 border-slate-200 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-lg transition-colors duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold dark:text-white text-slate-900">Ready to Analyze</h3>
                    <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 mt-1 max-w-md">
                      Upload a PDF document, scan an image with OCR, or paste your post copy to evaluate engagement score, readability, and platform rules.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs dark:text-slate-400 text-slate-500 mr-1">Quick test:</span>
                    <button
                      onClick={() => handleLoadSample('linkedin')}
                      className="px-3 py-1.5 dark:bg-matte-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-matte-750 dark:text-slate-200 text-slate-700 border dark:border-matte-700 border-slate-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      LinkedIn Post
                    </button>
                    <button
                      onClick={() => handleLoadSample('x')}
                      className="px-3 py-1.5 dark:bg-matte-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-matte-750 dark:text-slate-200 text-slate-700 border dark:border-matte-700 border-slate-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      X / Twitter
                    </button>
                    <button
                      onClick={() => handleLoadSample('pdf')}
                      className="px-3 py-1.5 dark:bg-matte-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-matte-750 dark:text-slate-200 text-slate-700 border dark:border-matte-700 border-slate-200 text-xs font-semibold rounded-xl transition-colors"
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
      <footer className="border-t dark:border-matte-800 border-slate-200 dark:bg-matte-950 bg-white py-8 text-center text-xs dark:text-slate-500 text-slate-500 mt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-2 dark:text-slate-400 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold dark:text-slate-300 text-slate-800">
              Technical Assessment Project: Social Media Content Analyzer
            </span>
          </div>
          <p>
            Built with React, TypeScript, Tailwind CSS, pdfjs-dist, and Tesseract.js. Powered by Google Gemini AI with client-side key storage.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-4 text-indigo-600 dark:text-indigo-400">
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
