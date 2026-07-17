import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Riwayat from '../views/pt/Riwayat.vue'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '../services/api'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('Riwayat.vue', () => {
  it('should render page title', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Riwayat)
    await flushPromises()
    expect(wrapper.text()).toContain('Riwayat Laporan')
  })

  it('should show empty state when no data', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Riwayat)
    await flushPromises()
    expect(wrapper.text()).toContain('Belum ada laporan')
  })

  it('should render laporan list', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          periode: '2026-01',
          jumlah: 10,
          negara: 'Malaysia',
          file: 'data.pdf',
          status: 'pending',
          tgl_upload: '2026-01-15',
          catatan: '',
        },
        {
          id: 2,
          periode: '2026-02',
          jumlah: 5,
          negara: 'Taiwan',
          file: '',
          status: 'diterima',
          tgl_upload: '2026-02-10',
          catatan: 'OK',
        },
      ],
    })
    const wrapper = mount(Riwayat)
    await flushPromises()

    expect(wrapper.text()).toContain('2026-01')
    expect(wrapper.text()).toContain('2026-02')
    expect(wrapper.text()).toContain('Malaysia')
    expect(wrapper.text()).toContain('Taiwan')
    expect(wrapper.text()).toContain('10 orang')
    expect(wrapper.text()).toContain('Diterima')
    expect(wrapper.text()).toContain('Pending')
  })

  it('should have search input', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Riwayat)
    await flushPromises()
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('should fetch data on mount', async () => {
    api.get.mockResolvedValue({ data: [] })
    mount(Riwayat)
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/laporan?')
  })

  it('should pass search param when searching', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Riwayat)
    await flushPromises()

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('2026-01')
    await searchInput.trigger('input')
    await flushPromises()

    const lastCall = api.get.mock.calls[api.get.mock.calls.length - 1][0]
    expect(lastCall).toContain('search=2026-01')
  })
})
