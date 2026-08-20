# Social Media Content Analyzer

An end-to-end web application that processes social media post drafts and scanned materials (PDF documents & image files), extracts text using layout-aware PDF parsing and Optical Character Recognition (OCR), and provides transparent engagement scoring with actionable platform optimization advice.

---

## 🌟 Key Features

1. **Document Upload & Ingestion**
   - Drag-and-drop & file picker interface.
   - Supports **PDF documents** and **Images** (`.png`, `.jpg`, `.jpeg`, `.webp`).
   - Direct text input / paste support for quick testing.
   - Interactive 1-click test sample loader (LinkedIn draft, Twitter thread, Strategy PDF, OCR image).

2. **Text Extraction Engine**
   - **PDF Parsing (`pdfjs-dist`)**: Preserves layout, line breaks, and paragraph structures.
   - **Image OCR (`Tesseract.js`)**: Scans screenshots and scanned documents with live progress tracking (0–100%) and confidence metrics.
   - **Side-by-Side View**: Extracted raw text is displayed alongside real-time metrics so reviewers can verify extraction accuracy and edit text freely.

3. **Transparent Heuristic Engagement Scoring (0–100)**
   - **Hook Strength (20 pts)**: Detects curiosity triggers, questions, data/statistics, and power words in the opening line.
   - **Readability & Cadence (20 pts)**: Evaluates sentence length rhythm, conversational flow, and reading ease grade.
   - **Call-to-Action (CTA) (20 pts)**: Identifies closing question hooks and high-converting conversion triggers.
   - **Formatting & Whitespace (20 pts)**: Analyzes paragraph density, bullet points, and mobile readability.
   - **Hashtags & Visuals (10 pts)**: Checks optimal hashtag density (2–5 tags) and visual anchor emojis.
   - **Tone & Audience Sentiment (10 pts)**: Identifies conversational voice, active verbs, and audience resonance.

4. **Multi-Platform Optimization**
   - **LinkedIn**: Length target (60–300 words), storytelling structure, line spacing, and engagement prompts.
   - **X (Twitter)**: 280-character limit checks, single-post vs thread alerts, punchy brevity.
   - **Instagram**: Caption limits (2,200 chars), first-125-char truncation awareness, hashtag density (3–8 tags).
   - **Live Feed Mockup**: Visual simulation of how the content renders in a real feed.

5. **Actionable Suggestions & Optional AI Enhancement**
   - 1-click copy for **Question Hooks**, **Data Hooks**, and **Contrarian Hooks**.
   - Tailored **CTA triggers** and suggested hashtags based on extracted keywords.
   - **100% Offline-First**: Works reliably with zero external API dependencies.
   - **Optional Gemini API Key**: Users can optionally connect a Google Gemini key for deep generative rewrites.

---

## 📝 Approach & Technical Design (200-Word Write-up)

> **Approach Write-Up for Technical Assessment:**
> 
> The Social Media Content Analyzer is built as a responsive, client-side application using **React**, **TypeScript**, and **Tailwind CSS**, prioritizing zero-configuration execution, reliability, and full data privacy.
> 
> For document ingestion, layout-aware PDF parsing is implemented with `pdfjs-dist` to preserve paragraph structures, while image files are processed via client-side `Tesseract.js` OCR with real-time progress callbacks. This eliminates heavy server dependencies and binary installation requirements on the host.
> 
> Rather than relying on fragile black-box predictions, the core engagement engine uses a deterministic, transparent heuristic scoring algorithm (0–100). It breaks engagement into measurable attributes: opening hook strength, readability grade, call-to-action presence, visual whitespace, hashtag density, and conversational tone. A side-by-side view allows immediate inspection and manual fine-tuning of extracted text.
> 
> Tailored platform rules evaluate post compliance and character limits for LinkedIn, X, and Instagram with live feed simulations. While the heuristic engine operates completely offline, an optional Google Gemini API layer is included for generative rewrites, ensuring continuous uptime and production resilience regardless of external API availability.

---

## 📂 Project Structure

```
social-media-content-analyzer/
├── public/
│   └── samples/                   # Pre-bundled PDF & Image files for testing
│       ├── sample-post.pdf
│       └── sample-post-screenshot.png
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Navbar, 1-click sample loader & optional AI key modal
│   │   ├── FileUpload.tsx         # Drag & Drop with active progress bar & error states
│   │   ├── TextInput.tsx          # Extracted text viewer / editor with live sync
│   │   ├── AnalysisDashboard.tsx  # Engagement score gauge, 6-metric breakdown & stats
│   │   ├── PlatformOptimizer.tsx  # Platform-specific rules & live feed mockups
│   │   └── SuggestionsPanel.tsx   # Actionable hook variants, CTAs, hashtags & AI rewrites
│   ├── lib/
│   │   ├── pdfParser.ts           # PDF text extractor with layout preservation
│   │   ├── ocr.ts                 # Tesseract OCR engine with progress callbacks
│   │   ├── analyzer.ts            # Transparent heuristic rule-based scoring engine
│   │   └── aiService.ts           # Optional Gemini API integration
│   ├── samples.ts                 # Preloaded social media test post samples
│   ├── types.ts                   # Strongly typed TypeScript interfaces
│   ├── App.tsx                    # Main orchestrator & state container
│   ├── main.tsx
│   └── index.css                  # Tailwind directives & styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or later)
- npm (v9.0 or later)

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Manideep123-sai/social-media-content-analyzer.git
   cd social-media-content-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🧪 Testing the Application

1. **One-Click Samples**: Use the **"Load Sample"** dropdown in the header to instantly test LinkedIn, X (Twitter), PDF document extracts, or OCR screenshot samples.
2. **File Upload Testing**:
   - Drag and drop `public/samples/sample-post.pdf` into the upload zone to test PDF text parsing.
   - Drag and drop `public/samples/sample-post-screenshot.png` into the upload zone to test Tesseract OCR extraction.
3. **Direct Text Edit**: Edit any extracted text in the left pane and click **"Analyze Engagement"** to verify real-time recalculation of scores and platform recommendations.

---

## 🛡️ Error Handling & UX

- **File Validation**: Validates allowed extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`) and enforces a 20MB file limit.
- **Progress Feedback**: Shows stage-by-stage status ("Loading PDF document", "Loading OCR core", "Recognizing text 80%").
- **Graceful Fallbacks**: If an image contains unreadable text or an API fails, non-blocking UI alert banners notify the user without crashing the app.
