import { createWorker } from 'tesseract.js';

export interface OCRExtractionResult {
  text: string;
  confidence: number;
}

export type OCRProgressCallback = (progress: number, message: string) => void;

/**
 * Extracts text from an image file using Tesseract.js OCR engine
 */
export async function extractTextFromImage(
  imageSource: File | Blob | string,
  onProgress?: OCRProgressCallback
): Promise<OCRExtractionResult> {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    onProgress?.(10, 'Initializing OCR engine...');

    worker = await createWorker('eng', 1, {
      logger: (message) => {
        if (message.status === 'loading tesseract core') {
          onProgress?.(25, 'Loading core OCR engine...');
        } else if (message.status === 'loading language traineddata') {
          onProgress?.(45, 'Loading English language dictionary...');
        } else if (message.status === 'initializing api') {
          onProgress?.(60, 'Setting up optical character recognition...');
        } else if (message.status === 'recognizing text') {
          const pct = Math.round(60 + (message.progress * 35));
          onProgress?.(pct, `Scanning image text (${Math.round(message.progress * 100)}%)...`);
        }
      },
    });

    onProgress?.(70, 'Running character recognition...');
    const result = await worker.recognize(imageSource);
    
    onProgress?.(98, 'Cleaning and formatting extracted text...');
    
    // Clean up excessive empty lines
    const cleanedText = result.data.text
      .split('\n')
      .map(line => line.trim())
      .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
      .join('\n');

    await worker.terminate();
    worker = null;

    return {
      text: cleanedText.trim(),
      confidence: result.data.confidence,
    };
  } catch (error) {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore terminate error
      }
    }
    console.error('OCR processing failed:', error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown OCR error'}`);
  }
}
