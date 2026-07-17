import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Perusahaan from '../views/admin/Perusahaan.vue'

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

describe('Perusahaan.vue', () => {
  it('should render page title', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Perusahaan)
    await flushPromises()
    expect(wrapper.text()).toContain('Manajemen Perusahaan')
  })

  it('should show empty state when no data', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Perusahaan)
    await flushPromises()
    expect(wrapper.text()).toContain('Belum ada perusahaan terdaftar')
  })

  it('should render perusahaan list', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, nama: 'PT Maju', alamat: 'Jakarta', kontak: '08123', status: 'aktif' },
        { id: 2, nama: 'PT Sejahtera', alamat: 'Bandung', kontak: '08999', status: 'nonaktif' },
      ],
    })
    const wrapper = mount(Perusahaan)
    await flushPromises()

    expect(wrapper.text()).toContain('PT Maju')
    expect(wrapper.text()).toContain('PT Sejahtera')
    expect(wrapper.text()).toContain('Aktif')
    expect(wrapper.text()).toContain('Nonaktif')
  })

  it('should have add button', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Perusahaan)
    await flushPromises()
    expect(wrapper.text()).toContain('Tambah PT')
  })

  it('should show add form modal when clicking Tambah PT', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Perusahaan)
    await flushPromises()
    await wrapper.find('.btn-primary').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Tambah Perusahaan')
    expect(wrapper.find('.form-input').exists()).toBe(true)
  })

  it('should close modal on cancel', async () => {
    api.get.mockResolvedValue({ data: [] })
    const wrapper = mount(Perusahaan)
    await flushPromises()
    await wrapper.find('.btn-primary').trigger('click')
    await wrapper.vm.$nextTick()

    await wrapper.find('.btn-outline').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Tambah Perusahaan')
  })

  it('should call API to save new perusahaan', async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ id: 1, nama: 'PT Baru' }] })
    api.post.mockResolvedValue({ data: { id: 1, nama: 'PT Baru' } })

    const wrapper = mount(Perusahaan)
    await flushPromises()
    await wrapper.find('.btn-primary').trigger('click')
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('.form-input')
    await inputs[0].setValue('PT Baru')
    await wrapper.findAll('.btn-primary').find(b => b.text() === 'Simpan').trigger('click')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/perusahaan', expect.objectContaining({ nama: 'PT Baru' }))
  })
})
