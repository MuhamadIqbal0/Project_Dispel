import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Login from '../views/Login.vue'

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
})

describe('Login.vue', () => {
  it('should render login form', () => {
    const wrapper = mount(Login)
    expect(wrapper.text()).toContain('SistemPelporanPMI')
    expect(wrapper.text()).toContain('Masuk ke Sistem')
  })

  it('should show email and password inputs', () => {
    const wrapper = mount(Login)
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
    expect(inputs[0].attributes('type')).toBe('email')
    expect(inputs[1].attributes('type')).toBe('password')
  })

  it('should toggle password visibility', async () => {
    const wrapper = mount(Login)
    const passwordInput = wrapper.findAll('input')[1]
    expect(passwordInput.attributes('type')).toBe('password')

    const eyeBtn = wrapper.find('.eye-btn')
    await eyeBtn.trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')

    await eyeBtn.trigger('click')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('should show demo account info', () => {
    const wrapper = mount(Login)
    expect(wrapper.text()).toContain('admin@disnakertrans.go.id')
    expect(wrapper.text()).toContain('pt.binakarya@mail.com')
  })
})
