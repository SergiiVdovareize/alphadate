export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
  maxSizeBytes?: number;
}

export const DEFAULT_MAX_WIDTH = 1200;
export const DEFAULT_MAX_HEIGHT = 1200;
export const DEFAULT_QUALITY = 0.8;
export const DEFAULT_MIME_TYPE = 'image/jpeg';
export const DEFAULT_MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * Calculates target dimensions preserving aspect ratio within bounding limits.
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return { width: 0, height: 0 };
  }
  if (srcWidth <= maxWidth && srcHeight <= maxHeight) {
    return { width: srcWidth, height: srcHeight };
  }
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.max(1, Math.round(srcWidth * ratio)),
    height: Math.max(1, Math.round(srcHeight * ratio))
  };
}

/**
 * Client-side image resize and compression.
 * Downscales images exceeding maxWidth / maxHeight and encodes them as a compressed data URL.
 */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    mimeType = DEFAULT_MIME_TYPE,
    maxSizeBytes = DEFAULT_MAX_FILE_SIZE
  } = options;

  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Будь ласка, оберіть дійсний файл зображення.');
  }

  if (file.size > maxSizeBytes) {
    throw new Error('Розмір фото перевищує 15 МБ. Оберіть файл меншого розміру.');
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const { width, height } = calculateAspectRatioFit(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          maxWidth,
          maxHeight
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Не вдалося створити контекст для обробки зображення.');
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Не вдалося обробити фото.'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Не вдалося завантажити зображення. Можливо, файл пошкоджено.'));
    };

    img.src = objectUrl;
  });
}
