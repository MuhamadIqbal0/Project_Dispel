import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotifikasiStore } from '../stores/notifikasi'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import api from '../services/api'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Notifikasi Store', () => {
  it('should start with empty notifications', () => {
    const store = useNotifikasiStore()
    expect(store.notifications).toEqual([])
    expect(store.unreadCount).toBe(0)
  })

  describe('fetchNotifications', () => {
    it('should fetch and store notifications', async () => {
      const mockNotif = [
        { id: 1, message: 'Notif 1', dibaca: 0 },
        { id: 2, message: 'Notif 2', dibaca: 1 },
      ]
      api.get.mockResolvedValue({ data: mockNotif })

      const store = useNotifikasiStore()
      await store.fetchNotifications()

      expect(store.notifications).toEqual(mockNotif)
      expect(store.unreadCount).toBe(1)
    })

    it('should handle fetch error silently', async () => {
      api.get.mockRejectedValue(new Error('Network error'))

      const store = useNotifikasiStore()
      await store.fetchNotifications()

      expect(store.notifications).toEqual([])
    })
  })

  describe('unreadCount', () => {
    it('should count only unread notifications', async () => {
      api.get.mockResolvedValue({
        data: [
          { id: 1, dibaca: 0 },
          { id: 2, dibaca: 0 },
          { id: 3, dibaca: 1 },
        ],
      })

      const store = useNotifikasiStore()
      await store.fetchNotifications()

      expect(store.unreadCount).toBe(2)
    })

    it('should be 0 when all read', async () => {
      api.get.mockResolvedValue({
        data: [
          { id: 1, dibaca: 1 },
          { id: 2, dibaca: 1 },
        ],
      })

      const store = useNotifikasiStore()
      await store.fetchNotifications()

      expect(store.unreadCount).toBe(0)
    })
  })

  describe('markRead', () => {
    it('should mark single notification as read', async () => {
      api.get.mockResolvedValue({
        data: [
          { id: 1, dibaca: 0 },
          { id: 2, dibaca: 0 },
        ],
      })
      api.put.mockResolvedValue({})

      const store = useNotifikasiStore()
      await store.fetchNotifications()
      await store.markRead(1)

      expect(api.put).toHaveBeenCalledWith('/notifikasi/1/read')
      expect(store.notifications[0].dibaca).toBe(true)
      expect(store.notifications[1].dibaca).toBe(0)
      expect(store.unreadCount).toBe(1)
    })

    it('should handle markRead error silently', async () => {
      api.get.mockResolvedValue({ data: [{ id: 1, dibaca: 0 }] })
      api.put.mockRejectedValue(new Error('fail'))

      const store = useNotifikasiStore()
      await store.fetchNotifications()
      await store.markRead(1)

      expect(store.notifications[0].dibaca).toBe(0)
    })
  })

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      api.get.mockResolvedValue({
        data: [
          { id: 1, dibaca: 0 },
          { id: 2, dibaca: 0 },
        ],
      })
      api.put.mockResolvedValue({})

      const store = useNotifikasiStore()
      await store.fetchNotifications()
      await store.markAllRead()

      expect(api.put).toHaveBeenCalledWith('/notifikasi/read-all')
      expect(store.unreadCount).toBe(0)
    })

    it('should handle markAllRead error silently', async () => {
      api.get.mockResolvedValue({ data: [{ id: 1, dibaca: 0 }] })
      api.put.mockRejectedValue(new Error('fail'))

      const store = useNotifikasiStore()
      await store.fetchNotifications()
      await store.markAllRead()

      expect(store.unreadCount).toBe(1)
    })
  })

  describe('startPolling / stopPolling', () => {
    it('should fetch immediately and then every 15s', async () => {
      api.get.mockResolvedValue({ data: [] })

      const store = useNotifikasiStore()
      store.startPolling()

      expect(api.get).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(15000)
      expect(api.get).toHaveBeenCalledTimes(2)

      vi.advanceTimersByTime(15000)
      expect(api.get).toHaveBeenCalledTimes(3)

      store.stopPolling()
    })

    it('should stop polling on stopPolling', async () => {
      api.get.mockResolvedValue({ data: [] })

      const store = useNotifikasiStore()
      store.startPolling()
      expect(api.get).toHaveBeenCalledTimes(1)

      store.stopPolling()
      vi.advanceTimersByTime(30000)
      expect(api.get).toHaveBeenCalledTimes(1)
    })

    it('stopPolling should be safe to call without start', () => {
      const store = useNotifikasiStore()
      expect(() => store.stopPolling()).not.toThrow()
    })
  })
})
