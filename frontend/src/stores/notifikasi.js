import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useNotifikasiStore = defineStore('notifikasi', () => {
  const notifications = ref([])
  let pollingTimer = null

  const unreadCount = computed(() => notifications.value.filter(n => !n.dibaca).length)

  async function fetchNotifications() {
    try {
      const res = await api.get('/notifikasi')
      notifications.value = res.data
    } catch {
      // silent
    }
  }

  async function markRead(id) {
    try {
      await api.put(`/notifikasi/${id}/read`)
      const n = notifications.value.find(i => i.id === id)
      if (n) n.dibaca = true
    } catch {
      // silent
    }
  }

  async function markAllRead() {
    try {
      await api.put('/notifikasi/read-all')
      notifications.value.forEach(n => { n.dibaca = true })
    } catch {
      // silent
    }
  }

  function startPolling() {
    fetchNotifications()
    pollingTimer = setInterval(fetchNotifications, 15000)
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead, startPolling, stopPolling }
})
