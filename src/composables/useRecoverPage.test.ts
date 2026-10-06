import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecoverPage } from './useRecoverPage';
import { api } from '../services/api';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

vi.mock('../services/api', () => ({
  api: {
    recoverBoard: vi.fn()
  }
}));

import type { RecoverBoardResponse } from '../types';

describe('useRecoverPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates empty email and sets error', async () => {
    const page = useRecoverPage();
    page.email.value = '   ';

    await page.handleRecover();

    expect(page.errorMessage.value).toBe('Будь ласка, введіть електронну пошту.');
    expect(page.isEmailError.value).toBe(true);
    expect(api.recoverBoard).not.toHaveBeenCalled();
  });

  it('validates invalid email format and sets error', async () => {
    const page = useRecoverPage();
    page.email.value = 'not-an-email';

    await page.handleRecover();

    expect(page.errorMessage.value).toBe('Будь ласка, введіть коректну електронну пошту.');
    expect(page.isEmailError.value).toBe(true);
    expect(api.recoverBoard).not.toHaveBeenCalled();
  });

  it('successfully recovers board when API returns success', async () => {
    const successResponse: RecoverBoardResponse = { success: true };
    vi.mocked(api.recoverBoard).mockResolvedValue(successResponse);

    const page = useRecoverPage();
    page.email.value = 'couple@example.com';

    await page.handleRecover();

    expect(api.recoverBoard).toHaveBeenCalledWith('couple@example.com');
    expect(page.isSuccess.value).toBe(true);
    expect(page.errorMessage.value).toBeNull();
  });

  it('handles API failure gracefully', async () => {
    const failureResponse: RecoverBoardResponse = {
      success: false,
      message: 'Щоденників не знайдено'
    };
    vi.mocked(api.recoverBoard).mockResolvedValue(failureResponse);

    const page = useRecoverPage();
    page.email.value = 'couple@example.com';

    await page.handleRecover();

    expect(page.isSuccess.value).toBe(false);
    expect(page.errorMessage.value).toBe('Щоденників не знайдено');
  });

  it('handles network error gracefully', async () => {
    vi.mocked(api.recoverBoard).mockRejectedValue(new Error('Не вдалося з’єднатися'));

    const page = useRecoverPage();
    page.email.value = 'couple@example.com';

    await page.handleRecover();

    expect(page.isSuccess.value).toBe(false);
    expect(page.errorMessage.value).toBe('Не вдалося з’єднатися');
  });

  it('navigates to home when goHome is called', () => {
    const page = useRecoverPage();
    page.goHome();

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
