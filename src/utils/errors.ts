export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly responseBody?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const CYRILLIC_REGEX = /[\u0400-\u04FF]/;

/**
 * Checks whether the text contains Ukrainian/Cyrillic characters.
 */
export function hasCyrillic(text: string): boolean {
  return CYRILLIC_REGEX.test(text);
}

/**
 * Converts any caught error into a friendly Ukrainian message.
 * Ensures no raw English technical errors (e.g. "Failed to fetch", "API error: 500") leak to the UI.
 */
export function getErrorMessage(error: unknown, fallbackMessage?: string): string {
  // If error is an ApiError with specific HTTP status codes
  if (error instanceof ApiError) {
    if (error.responseBody && typeof error.responseBody === 'object' && 'message' in error.responseBody) {
      const serverMsg = (error.responseBody as { message?: unknown }).message;
      if (typeof serverMsg === 'string' && hasCyrillic(serverMsg)) {
        return serverMsg;
      }
    }

    if (hasCyrillic(error.message)) {
      return error.message;
    }

    switch (error.status) {
      case 400:
        return fallbackMessage || 'Некоректні дані. Перевірте введену інформацію.';
      case 401:
        return 'Неправильний PIN-код. Спробуйте ще раз.';
      case 403:
        return 'Доступ заборонено.';
      case 404:
        return 'Дошку не знайдено.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Помилка сервера. Спробуйте пізніше.';
      default:
        return fallbackMessage || 'Сталася помилка при зверненні до сервера. Спробуйте пізніше.';
    }
  }

  // Handle standard JavaScript Error
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Network / fetch / offline errors
    if (
      msg.includes('fetch') ||
      msg.includes('network') ||
      msg.includes('offline') ||
      msg.includes('load failed') ||
      msg.includes('connection')
    ) {
      return 'Немає зв’язку з сервером. Перевірте інтернет.';
    }

    // If message is already localized in Ukrainian, preserve it
    if (hasCyrillic(error.message)) {
      return error.message;
    }

    return fallbackMessage || 'Сталася непередбачена помилка. Спробуйте пізніше.';
  }

  if (typeof error === 'string') {
    if (hasCyrillic(error)) {
      return error;
    }
    return fallbackMessage || 'Сталася помилка. Спробуйте пізніше.';
  }

  return fallbackMessage || 'Сталася помилка. Спробуйте пізніше.';
}
