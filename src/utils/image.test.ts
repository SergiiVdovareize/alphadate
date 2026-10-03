import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateAspectRatioFit,
  compressImageFile,
  DEFAULT_MAX_WIDTH,
  DEFAULT_MAX_HEIGHT
} from './image';

describe('image utils', () => {
  describe('calculateAspectRatioFit', () => {
    it('returns 0x0 if src dimensions are zero or negative', () => {
      expect(calculateAspectRatioFit(0, 100, 500, 500)).toEqual({ width: 0, height: 0 });
      expect(calculateAspectRatioFit(100, 0, 500, 500)).toEqual({ width: 0, height: 0 });
      expect(calculateAspectRatioFit(-10, -20, 500, 500)).toEqual({ width: 0, height: 0 });
    });

    it('returns original dimensions if image is smaller than max bounds', () => {
      expect(calculateAspectRatioFit(800, 600, 1200, 1200)).toEqual({ width: 800, height: 600 });
      expect(calculateAspectRatioFit(1200, 1200, 1200, 1200)).toEqual({
        width: 1200,
        height: 1200
      });
    });

    it('scales down proportionally when width exceeds max', () => {
      // 2400x1200 scaled with max 1200x1200 -> 1200x600
      expect(calculateAspectRatioFit(2400, 1200, 1200, 1200)).toEqual({ width: 1200, height: 600 });
    });

    it('scales down proportionally when height exceeds max', () => {
      // 1000x2000 scaled with max 1000x1000 -> 500x1000
      expect(calculateAspectRatioFit(1000, 2000, 1000, 1000)).toEqual({ width: 500, height: 1000 });
    });
  });

  describe('compressImageFile', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    beforeEach(() => {
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      vi.restoreAllMocks();
    });

    it('rejects if file is not an image', async () => {
      const file = new File(['text'], 'test.txt', { type: 'text/plain' });
      await expect(compressImageFile(file)).rejects.toThrow(
        'Будь ласка, оберіть дійсний файл зображення.'
      );
    });

    it('rejects if file exceeds maximum size', async () => {
      const largeFile = new File(['x'.repeat(100)], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 16 * 1024 * 1024 });

      await expect(compressImageFile(largeFile)).rejects.toThrow(
        'Розмір фото перевищує 15 МБ. Оберіть файл меншого розміру.'
      );
    });

    it('compresses image successfully using canvas', async () => {
      const mockDrawImage = vi.fn();
      const mockToDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mockCompressedData');

      // Mock canvas getContext and toDataURL
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn().mockReturnValue({
              drawImage: mockDrawImage
            }),
            toDataURL: mockToDataURL
          } as unknown as HTMLCanvasElement;
        }
        return origCreateElement(tagName);
      });

      // Mock Image
      const origImage = globalThis.Image;
      class MockImage {
        width = 2400;
        height = 1200;
        naturalWidth = 2400;
        naturalHeight = 1200;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src = '';
        set src(val: string) {
          this._src = val;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
        get src() {
          return this._src;
        }
      }
      globalThis.Image = MockImage as unknown as typeof Image;

      const file = new File(['fake-image-bytes'], 'date-photo.jpg', { type: 'image/jpeg' });
      const result = await compressImageFile(file, {
        maxWidth: DEFAULT_MAX_WIDTH,
        maxHeight: DEFAULT_MAX_HEIGHT
      });

      expect(result).toBe('data:image/jpeg;base64,mockCompressedData');
      expect(mockDrawImage).toHaveBeenCalled();
      expect(mockToDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

      globalThis.Image = origImage;
    });

    it('rejects if image failed to load', async () => {
      const origImage = globalThis.Image;
      class FailingImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src = '';
        set src(val: string) {
          this._src = val;
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
        get src() {
          return this._src;
        }
      }
      globalThis.Image = FailingImage as unknown as typeof Image;

      const file = new File(['corrupt-bytes'], 'corrupt.jpg', { type: 'image/jpeg' });
      await expect(compressImageFile(file)).rejects.toThrow(
        'Не вдалося завантажити зображення. Можливо, файл пошкоджено.'
      );

      globalThis.Image = origImage;
    });

    it('rejects if canvas context cannot be created', async () => {
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn().mockReturnValue(null)
          } as unknown as HTMLCanvasElement;
        }
        return origCreateElement(tagName);
      });

      const origImage = globalThis.Image;
      class MockImage {
        width = 800;
        height = 600;
        onload: (() => void) | null = null;
        private _src = '';
        set src(val: string) {
          this._src = val;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
        get src() {
          return this._src;
        }
      }
      globalThis.Image = MockImage as unknown as typeof Image;

      const file = new File(['fake-bytes'], 'valid.jpg', { type: 'image/jpeg' });
      await expect(compressImageFile(file)).rejects.toThrow(
        'Не вдалося створити контекст для обробки зображення.'
      );

      globalThis.Image = origImage;
    });
  });
});
