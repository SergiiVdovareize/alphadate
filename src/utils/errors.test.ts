import { describe, it, expect } from 'vitest';
import { getErrorMessage, hasCyrillic } from './errors';
import { ApiError } from '../services/api';

describe('hasCyrillic', () => {
  it('detects cyrillic characters', () => {
    expect(hasCyrillic('Привіт')).toBe(true);
    expect(hasCyrillic('Hello')).toBe(false);
    expect(hasCyrillic('1234!')).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('translates network / fetch errors', () => {
    expect(getErrorMessage(new Error('Failed to fetch'))).toBe(
      'Немає зв’язку з сервером. Перевірте інтернет.'
    );
    expect(getErrorMessage(new Error('NetworkError when attempting to fetch'))).toBe(
      'Немає зв’язку з сервером. Перевірте інтернет.'
    );
    expect(getErrorMessage(new Error('Network offline'))).toBe(
      'Немає зв’язку з сервером. Перевірте інтернет.'
    );
  });

  it('translates ApiError status codes', () => {
    expect(getErrorMessage(new ApiError(400, 'Bad Request'))).toBe(
      'Некоректні дані. Перевірте введену інформацію.'
    );
    expect(getErrorMessage(new ApiError(401, 'Unauthorized'))).toBe(
      'Неправильний PIN-код. Спробуйте ще раз.'
    );
    expect(getErrorMessage(new ApiError(403, 'Forbidden'))).toBe('Доступ заборонено.');
    expect(getErrorMessage(new ApiError(404, 'Not Found'))).toBe('Щоденник не знайдено.');
    expect(getErrorMessage(new ApiError(500, 'Internal Server Error'))).toBe(
      'Помилка сервера. Спробуйте пізніше.'
    );
    expect(getErrorMessage(new ApiError(502, 'Bad Gateway'))).toBe(
      'Помилка сервера. Спробуйте пізніше.'
    );
  });

  it('respects custom fallbackMessage when provided for ApiError 400', () => {
    expect(getErrorMessage(new ApiError(400, 'Bad Request'), 'Введіть коректні дані')).toBe(
      'Введіть коректні дані'
    );
  });

  it('preserves Ukrainian server response messages in ApiError', () => {
    const errorWithBody = new ApiError(400, 'Bad Request', {
      message: 'Некоректний формат адреси пошти'
    });
    expect(getErrorMessage(errorWithBody)).toBe('Некоректний формат адреси пошти');

    const errorWithMessage = new ApiError(400, 'Будь ласка, заповніть усі поля');
    expect(getErrorMessage(errorWithMessage)).toBe('Будь ласка, заповніть усі поля');
  });

  it('preserves existing Ukrainian errors in generic Error objects', () => {
    expect(getErrorMessage(new Error('Помилка валідації форми'))).toBe('Помилка валідації форми');
  });

  it('uses fallbackMessage for unknown english errors', () => {
    expect(getErrorMessage(new Error('Something weird'), 'Не вдалося виконати дію.')).toBe(
      'Не вдалося виконати дію.'
    );
    expect(getErrorMessage(new Error('Something weird'))).toBe(
      'Сталася непередбачена помилка. Спробуйте пізніше.'
    );
  });

  it('handles strings and unknown types', () => {
    expect(getErrorMessage('Вже є українською')).toBe('Вже є українською');
    expect(getErrorMessage('English error', 'Український фолбек')).toBe('Український фолбек');
    expect(getErrorMessage(null, 'Фолбек')).toBe('Фолбек');
    expect(getErrorMessage(undefined)).toBe('Сталася помилка. Спробуйте пізніше.');
  });
});
