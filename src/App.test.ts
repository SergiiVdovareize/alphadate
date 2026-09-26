import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';

describe('App.vue', () => {
  it('renders router-view component', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': {
            template: '<div class="stubbed-router-view">Mock Router View</div>'
          }
        }
      }
    });

    expect(wrapper.find('.stubbed-router-view').exists()).toBe(true);
    expect(wrapper.find('.stubbed-router-view').text()).toBe('Mock Router View');
  });
});
