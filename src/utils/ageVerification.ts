// Multiple DOB patterns to handle OCR noise on Aadhaar cards
// Aadhaar typically prints "DOB: DD/MM/YYYY" or "Year of Birth: YYYY"
const DOB_PATTERNS: RegExp[] = [
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (with optional spaces)
  /(\d{1,2})\s*[\/\-.\s]\s*(\d{1,2})\s*[\/\-.\s]\s*(\d{4})/,
  // YYYY-MM-DD
  /(\d{4})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/,
];

const YOB_PATTERN = /(?:year\s*of\s*birth|yob)[\s:]*?(\d{4})/i;
const DOB_LABEL_PATTERN = /(?:dob|d\.?o\.?b|date\s*of\s*birth|birth)[\s:]*?(\d{1,2})[\/\-.\s](\d{1,2})[\/\-.\s](\d{4})/i;

function isValidDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function extractDOB(text: string): Date | null {
  // Normalize: collapse whitespace, fix common OCR confusions in date contexts
  const cleaned = text
    .replace(/[Oo](?=\d)/g, "0")
    .replace(/(?<=\d)[Oo]/g, "0")
    .replace(/[lI|](?=\d)/g, "1")
    .replace(/\s+/g, " ");

  // 1) Labeled DOB first (most reliable)
  const labeled = cleaned.match(DOB_LABEL_PATTERN);
  if (labeled) {
    const day = parseInt(labeled[1], 10);
    const month = parseInt(labeled[2], 10);
    const year = parseInt(labeled[3], 10);
    if (isValidDate(day, month, year)) return new Date(year, month - 1, day);
  }

  // 2) Year of Birth fallback (assume Jan 1 — conservative for age calc)
  const yob = cleaned.match(YOB_PATTERN);
  if (yob) {
    const year = parseInt(yob[1], 10);
    if (year >= 1900 && year <= new Date().getFullYear()) {
      return new Date(year, 0, 1);
    }
  }

  // 3) Generic date patterns — pick the first valid one
  for (const pattern of DOB_PATTERNS) {
    const globalRegex = new RegExp(pattern.source, "g");
    let m: RegExpExecArray | null;
    while ((m = globalRegex.exec(cleaned)) !== null) {
      let day: number, month: number, year: number;
      if (m[1].length === 4) {
        year = parseInt(m[1], 10);
        month = parseInt(m[2], 10);
        day = parseInt(m[3], 10);
      } else {
        day = parseInt(m[1], 10);
        month = parseInt(m[2], 10);
        year = parseInt(m[3], 10);
      }
      if (isValidDate(day, month, year)) return new Date(year, month - 1, day);
    }
  }

  return null;
}

export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export const MIN_AGE = 21;

// Preprocess: upscale, grayscale, contrast + threshold for sharper OCR
export async function preprocessImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Upscale small images so Tesseract has more pixels per character
      const targetW = 1600;
      const scale = Math.max(1, targetW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const contrast = 1.6;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        let adj = (gray - 128) * contrast + 128;
        // Soft threshold to clean background
        if (adj > 180) adj = 255;
        else if (adj < 80) adj = 0;
        adj = Math.min(255, Math.max(0, adj));
        d[i] = d[i + 1] = d[i + 2] = adj;
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = dataUrl;
  });
}
