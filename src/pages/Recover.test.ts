import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Recover from './Recover.vue';
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

describe('Recover.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, back button, and all 3 recovery steps', () => {
    const wrapper = mount(Recover);

    expect(wrapper.find('h1').text()).toBe('Відновлення щоденника');
    expect(wrapper.find('.back-link-btn').text()).toContain('На головну');

    // 3 steps and 2 or-dividers
    const stepCards = wrapper.findAll('.step-card');
    expect(stepCards).toHaveLength(3);

    const dividers = wrapper.findAll('.or-divider');
    expect(dividers).toHaveLength(2);
    dividers.forEach((d) => expect(d.text()).toBe('або'));

    // Step 1: No action button
    const step1 = wrapper.find('.step-card');
    expect(step1.find('button').exists()).toBe(false);

    // Step 2
    expect(wrapper.find('#step-2-heading').text()).toContain('Пошукайте лист');
    const copyBtn = wrapper.find('.copy-keyword-btn');
    expect(copyBtn.exists()).toBe(true);
    expect(copyBtn.text()).toContain('«AlphaDate»');

    // Step 3
    expect(wrapper.find('#step-3-heading').text()).toContain('Надіслати посилання на Email');
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('.submit-btn').text()).toBe('Надіслати посилання на пошту');
  });

  it('navigates to home when clicking back button', async () => {
    const wrapper = mount(Recover);

    await wrapper.find('.back-link-btn').trigger('click');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('copies "AlphaDate" to clipboard on click/tap and displays feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    const wrapper = mount(Recover);

    const copyBtn = wrapper.find('.copy-keyword-btn');
    expect(copyBtn.find('.check-icon').exists()).toBe(false);

    await copyBtn.trigger('click');
    expect(writeTextMock).toHaveBeenCalledWith('AlphaDate');

    await wrapper.vm.$nextTick();
    expect(copyBtn.classes()).toContain('is-copied');
    expect(copyBtn.find('.check-icon').exists()).toBe(true);
    expect(copyBtn.attributes('aria-label')).toBe('Слово скопійовано');
  });

  it('validates empty email in step 3', async () => {
    const wrapper = mount(Recover);

    await wrapper.find('form').trigger('submit.prevent');
    expect(api.recoverBoard).not.toHaveBeenCalled();
    expect(wrapper.find('.error-banner').text()).toBe('Будь ласка, введіть електронну пошту.');
  });

  it('validates invalid email format with custom error message and style', async () => {
    const wrapper = mount(Recover);

    const emailInput = wrapper.find('#recovery-email-field');
    await emailInput.setValue('invalid-email');
    await wrapper.find('form').trigger('submit.prevent');

    expect(api.recoverBoard).not.toHaveBeenCalled();
    expect(wrapper.find('.error-banner').text()).toBe(
      'Будь ласка, введіть коректну електронну пошту.'
    );
    expect(emailInput.classes()).toContain('input-error');

    // Clears error on input
    await emailInput.setValue('a');
    expect(wrapper.find('.error-banner').exists()).toBe(false);
  });

  it('submits recovery request and shows success box', async () => {
    vi.mocked(api.recoverBoard).mockResolvedValueOnce({
      success: true,
      message: 'OK'
    });

    const wrapper = mount(Recover);

    const emailInput = wrapper.find('#recovery-email-field');
    await emailInput.setValue('  couple@example.com  ');
    await wrapper.find('form').trigger('submit.prevent');

    expect(api.recoverBoard).toHaveBeenCalledWith('couple@example.com');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.success-box').exists()).toBe(true);
    expect(wrapper.find('.success-title').text()).toBe('Лист надіслано!');
    expect(wrapper.find('.success-desc').text()).toContain('Якщо щоденник було зареєстровано');
    expect(wrapper.find('.success-desc').text()).toContain(
      'при реєстрації могла вводитись пошта будь-якого партнера'
    );

    // Return to home from success box
    await wrapper.find('.success-box .outline-btn').trigger('click');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('displays partner email reminder in recovery steps', () => {
    const wrapper = mount(Recover);
    expect(wrapper.text()).toContain('при реєстрації могла вводитись пошта будь-якого партнера');
  });

  it('handles unsuccessful recovery response from api', async () => {
    vi.mocked(api.recoverBoard).mockResolvedValueOnce({
      success: false,
      message: 'Невірний формат'
    });

    const wrapper = mount(Recover);

    await wrapper.find('#recovery-email-field').setValue('user@example.com');
    await wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.error-banner').text()).toBe('Невірний формат');
  });

  it('handles thrown error during recovery submission', async () => {
    vi.mocked(api.recoverBoard).mockRejectedValueOnce(new Error('Помилка сервера'));

    const wrapper = mount(Recover);

    await wrapper.find('#recovery-email-field').setValue('user@example.com');
    await wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.error-banner').text()).toBe('Помилка сервера');
  });

  it('translates network or technical English errors into Ukrainian', async () => {
    vi.mocked(api.recoverBoard).mockRejectedValueOnce(new Error('Failed to fetch'));

    const wrapper = mount(Recover);

    await wrapper.find('#recovery-email-field').setValue('user@example.com');
    await wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.error-banner').text()).toBe(
      'Немає зв’язку з сервером. Перевірте інтернет.'
    );
  });
});
