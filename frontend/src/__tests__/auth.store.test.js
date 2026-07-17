import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import api from '../services/api'

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
  vi.clearAllMocks()
})

describe('Auth Store', () => {
  it('should start with no user', () => {
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.isAdmin).toBe(false)
  })

  it('should login successfully', async () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' }
    api.post.mockResolvedValue({ data: { user: mockUser, token: 'fake-token' } })

    const auth = useAuthStore()
    const result = await auth.login('admin@test.com', 'password123')

    expect(result).toBe(true)
    expect(auth.user).toEqual(mockUser)
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.isAdmin).toBe(true)
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@test.com',
      password: 'password123',
    })
  })

  it('should return false on login failure', async () => {
    api.post.mockRejectedValue(new Error('Unauthorized'))

    const auth = useAuthStore()
    const result = await auth.login('wrong@test.com', 'wrong')

    expect(result).toBe(false)
    expect(auth.user).toBeNull()
  })

  it('should logout and clear session', async () => {
    const mockUser = { id: 1, name: 'Admin', role: 'admin' }
    api.post.mockResolvedValue({ data: { user: mockUser, token: 'token' } })

    const auth = useAuthStore()
    await auth.login('admin@test.com', 'password')
    expect(auth.isLoggedIn).toBe(true)

    auth.logout()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
    expect(sessionStorage.getItem('user')).toBeNull()
  })

  it('should distinguish admin vs pt role', async () => {
    api.post.mockResolvedValue({
      data: { user: { id: 1, role: 'pt' }, token: 'token' },
    })

    const auth = useAuthStore()
    await auth.login('pt@test.com', 'pass')

    expect(auth.isAdmin).toBe(false)
    expect(auth.isPT).toBe(true)
  })
})
