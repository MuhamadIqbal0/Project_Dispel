import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'verifikasi', name: 'Verifikasi', component: () => import('../views/admin/Verifikasi.vue') },
      { path: 'data-cpmi', name: 'DataCPMI', component: () => import('../views/admin/DataCPMI.vue') },
      { path: 'rekap', name: 'Rekap', component: () => import('../views/admin/Rekap.vue') },
      { path: 'perusahaan', name: 'Perusahaan', component: () => import('../views/admin/Perusahaan.vue') },
      { path: 'log-aktivitas', name: 'LogAktivitas', component: () => import('../views/admin/LogAktivitas.vue') },
      { path: 'akun', name: 'Akun', component: () => import('../views/admin/Akun.vue') },
      { path: 'pengaturan', name: 'Pengaturan', component: () => import('../views/admin/Pengaturan.vue') },
    ]
  },
  {
    path: '/pt',
    component: () => import('../layouts/PTLayout.vue'),
    meta: { requiresAuth: true, role: 'pt' },
    children: [
      { path: '', name: 'PTDashboard', component: () => import('../views/pt/Dashboard.vue') },
      { path: 'upload', name: 'UploadLaporan', component: () => import('../views/pt/UploadLaporan.vue') },
      { path: 'riwayat', name: 'RiwayatLaporan', component: () => import('../views/pt/Riwayat.vue') },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (!auth.user) {
    await auth.restore()
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }

  if (to.meta.guest && auth.isLoggedIn) {
    if (auth.isAdmin) return next('/')
    if (auth.isPT) return next('/pt')
  }

  if (to.meta.role && to.meta.role !== auth.user?.role) {
    if (auth.isAdmin) return next('/')
    if (auth.isPT) return next('/pt')
    return next('/login')
  }

  next()
})

export default router
