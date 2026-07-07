import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isPT = computed(() => user.value?.role === 'pt')

  async function login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password })
      user.value = res.data.user
      localStorage.setItem('user', JSON.stringify({ ...res.data.user, token: res.data.token }))
      return true
    } catch {
      return false
    }
  }

  async function restore() {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const res = await api.get('/auth/me')
        user.value = res.data.user
        localStorage.setItem('user', JSON.stringify({ ...res.data.user, token: parsed.token }))
      } catch {
        logout()
      }
    }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  return { user, isLoggedIn, isAdmin, isPT, login, logout, restore }
})
