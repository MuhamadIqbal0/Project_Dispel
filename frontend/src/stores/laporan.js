import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useLaporanStore = defineStore('laporan', () => {
  const laporanList = ref([])
  const perusahaanList = ref([])

  async function fetchLaporan(params = {}) {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.negara) query.set('negara', params.negara)
    if (params.search) query.set('search', params.search)
    const res = await api.get(`/laporan?${query.toString()}`)
    laporanList.value = res.data
  }

  async function fetchPerusahaan() {
    const res = await api.get('/perusahaan')
    perusahaanList.value = res.data
  }

  async function fetchStats() {
    const res = await api.get('/laporan/stats')
    return res.data
  }

  async function fetchRekap(params = {}) {
    const query = new URLSearchParams()
    if (params.periode) query.set('periode', params.periode)
    if (params.perusahaan) query.set('perusahaan', params.perusahaan)
    if (params.negara) query.set('negara', params.negara)
    const res = await api.get(`/laporan/rekap?${query.toString()}`)
    return res.data
  }

  async function fetchLog(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await api.get(`/log${query}`)
    return res.data
  }

  async function uploadLaporan(data) {
    const res = await api.post('/laporan', data)
    return res.data
  }

  async function konfirmasiLaporan(id, status, catatan) {
    const res = await api.put(`/laporan/${id}/konfirmasi`, { status, catatan })
    return res.data
  }

  async function addPerusahaan(data) {
    const res = await api.post('/perusahaan', data)
    return res.data
  }

  async function updatePerusahaan(id, data) {
    const res = await api.put(`/perusahaan/${id}`, data)
    return res.data
  }

  async function deletePerusahaan(id) {
    await api.delete(`/perusahaan/${id}`)
  }

  return {
    laporanList, perusahaanList,
    fetchLaporan, fetchPerusahaan, fetchStats, fetchRekap, fetchLog,
    uploadLaporan, konfirmasiLaporan,
    addPerusahaan, updatePerusahaan, deletePerusahaan,
  }
})
