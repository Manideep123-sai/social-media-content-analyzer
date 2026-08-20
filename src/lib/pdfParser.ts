import * as pdfjsLib from 'pdfjs-dist';

// Set up pdf.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  info?: {
    title?: string;
    author?: string;
  };
}

export type ProgressCallback = (progress: number, message: string) => void;

/**
 * Parses a PDF file and extracts text while preserving layout & paragraph structure.
 */
export async function extractTextFromPDF(
  file: File | Blob,
  onProgress?: ProgressCallback
): Promise<PDFExtractionResult> {
  try {
    onProgress?.(10, 'Loading PDF document...');
    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    const extractedPages: string[] = [];

    onProgress?.(30, `Document loaded (${numPages} page${numPages > 1 ? 's' : ''}). Extracting text...`);

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Sort items by vertical position (top to bottom) then horizontal (left to right)
      const items = textContent.items as Array<{
        str: string;
        transform: number[];
        hasEOL?: boolean;
        width?: number;
      }>;

      if (!items || items.length === 0) {
        continue;
      }

      let lastY: number | null = null;
      let pageText = '';

      for (const item of items) {
        if (!('str' in item)) continue;
        const currentY = item.transform[5];

        if (lastY === null) {
          pageText += item.str;
        } else {
          const yDiff = Math.abs(currentY - lastY);
          if (yDiff > 12) {
            // Significant vertical space -> Paragraph break
            pageText += '\n\n' + item.str;
          } else if (yDiff > 4) {
            // Standard line break
            pageText += '\n' + item.str;
          } else {
            // Same line: add space if needed
            pageText += (pageText.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
          }
        }
        lastY = currentY;
      }

      extractedPages.push(pageText.trim());

      const progress = Math.round(30 + ((pageNum / numPages) * 60));
      onProgress?.(progress, `Extracted page ${pageNum} of ${numPages}...`);
    }

    const fullText = extractedPages.filter(p => p.length > 0).join('\n\n---\n\n');
    onProgress?.(95, 'Finalizing extracted text...');

    return {
      text: fullText,
      pageCount: numPages,
    };
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
