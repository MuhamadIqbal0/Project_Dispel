import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLaporanStore } from '../stores/laporan'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../services/api'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('Laporan Store', () => {
  it('should start with empty lists', () => {
    const store = useLaporanStore()
    expect(store.laporanList).toEqual([])
    expect(store.perusahaanList).toEqual([])
  })

  describe('fetchLaporan', () => {
    it('should fetch all laporan', async () => {
      const mockData = [{ id: 1, perusahaan: 'PT Maju', status: 'pending' }]
      api.get.mockResolvedValue({ data: mockData })

      const store = useLaporanStore()
      await store.fetchLaporan()

      expect(store.laporanList).toEqual(mockData)
      expect(api.get).toHaveBeenCalledWith('/laporan?')
    })

    it('should fetch with status filter', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchLaporan({ status: 'pending' })
      expect(api.get).toHaveBeenCalledWith('/laporan?status=pending')
    })

    it('should fetch with negara filter', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchLaporan({ negara: 'Malaysia' })
      expect(api.get).toHaveBeenCalledWith('/laporan?negara=Malaysia')
    })

    it('should fetch with search filter', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchLaporan({ search: 'Maju' })
      expect(api.get).toHaveBeenCalledWith('/laporan?search=Maju')
    })

    it('should combine multiple filters', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchLaporan({ status: 'diterima', negara: 'Taiwan', search: 'PT' })
      const url = api.get.mock.calls[0][0]
      expect(url).toContain('status=diterima')
      expect(url).toContain('negara=Taiwan')
      expect(url).toContain('search=PT')
    })
  })

  describe('fetchPerusahaan', () => {
    it('should fetch perusahaan list', async () => {
      const mockData = [{ id: 1, nama: 'PT Maju' }]
      api.get.mockResolvedValue({ data: mockData })

      const store = useLaporanStore()
      await store.fetchPerusahaan()

      expect(store.perusahaanList).toEqual(mockData)
      expect(api.get).toHaveBeenCalledWith('/perusahaan')
    })
  })

  describe('fetchStats', () => {
    it('should return stats', async () => {
      const mockStats = { total: 10, pending: 3, diterima: 5, ditolak: 2 }
      api.get.mockResolvedValue({ data: mockStats })

      const store = useLaporanStore()
      const result = await store.fetchStats()

      expect(result).toEqual(mockStats)
    })
  })

  describe('fetchRekap', () => {
    it('should fetch rekap without params', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchRekap()
      expect(api.get).toHaveBeenCalledWith('/laporan/rekap?')
    })

    it('should fetch rekap with filters', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchRekap({ periode: '2026-01', perusahaan: 'PT Maju' })
      const url = api.get.mock.calls[0][0]
      expect(url).toContain('periode=2026-01')
      expect(url).toContain('perusahaan=PT+Maju')
    })
  })

  describe('fetchLog', () => {
    it('should fetch logs', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchLog()
      expect(api.get).toHaveBeenCalledWith('/log?')
    })

    it('should fetch logs with filters', async () => {
      api.get.mockResolvedValue({ data: [] })
      const store = useLaporanStore()
      await store.fetchLog({ search: 'Admin', aksi: 'Upload' })
      const url = api.get.mock.calls[0][0]
      expect(url).toContain('search=Admin')
      expect(url).toContain('aksi=Upload')
    })
  })

  describe('uploadLaporan', () => {
    it('should post laporan data', async () => {
      const mockData = { id: 1, status: 'pending' }
      api.post.mockResolvedValue({ data: mockData })

      const store = useLaporanStore()
      const result = await store.uploadLaporan({
        perusahaan: 'PT Maju',
        periode: '2026-01',
        jumlah: 10,
        negara: 'Malaysia',
      })

      expect(result).toEqual(mockData)
      expect(api.post).toHaveBeenCalledWith('/laporan', expect.objectContaining({
        perusahaan: 'PT Maju',
        periode: '2026-01',
      }))
    })
  })

  describe('konfirmasiLaporan', () => {
    it('should PUT konfirmasi', async () => {
      const mockResult = { id: 1, status: 'diterima' }
      api.put.mockResolvedValue({ data: mockResult })

      const store = useLaporanStore()
      const result = await store.konfirmasiLaporan(1, 'diterima', 'Bagus')

      expect(result).toEqual(mockResult)
      expect(api.put).toHaveBeenCalledWith('/laporan/1/konfirmasi', { status: 'diterima', catatan: 'Bagus' })
    })
  })

  describe('perusahaan CRUD', () => {
    it('addPerusahaan should POST', async () => {
      api.post.mockResolvedValue({ data: { id: 1, nama: 'PT Baru' } })
      const store = useLaporanStore()
      await store.addPerusahaan({ nama: 'PT Baru' })
      expect(api.post).toHaveBeenCalledWith('/perusahaan', { nama: 'PT Baru' })
    })

    it('updatePerusahaan should PUT', async () => {
      api.put.mockResolvedValue({ data: { id: 1, nama: 'Updated' } })
      const store = useLaporanStore()
      await store.updatePerusahaan(1, { nama: 'Updated' })
      expect(api.put).toHaveBeenCalledWith('/perusahaan/1', { nama: 'Updated' })
    })

    it('deletePerusahaan should DELETE', async () => {
      api.delete.mockResolvedValue({})
      const store = useLaporanStore()
      await store.deletePerusahaan(1)
      expect(api.delete).toHaveBeenCalledWith('/perusahaan/1')
    })
  })
})
