// Quick PDF text extractor using pdf-parse
import { readFileSync } from 'fs';

const pdfPath = 'C:/Users/khizar.imtiaz/Downloads/tokenlens-phase3.pdf';

try {
  // Try dynamic import of pdf-parse
  const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js').catch(() =>
    import('pdf-parse')
  );
  const buf = readFileSync(pdfPath);
  const data = await pdfParse(buf);
  console.log('=== TOTAL PAGES:', data.numpages, '===');
  console.log(data.text);
} catch(e) {
  console.error('pdf-parse not available:', e.message);
  // Fallback: raw string extraction
  const buf = readFileSync(pdfPath);
  const text = buf.toString('latin1');
  // Extract BT...ET text blocks
  const streams = text.match(/stream[\s\S]*?endstream/g) || [];
  console.log('Found', streams.length, 'streams');
  // Extract readable strings
  const readable = text.match(/\(([^\x00-\x1f\x7f-\xff]{4,})\)/g) || [];
  readable.forEach(s => console.log(s.slice(1,-1)));
}
