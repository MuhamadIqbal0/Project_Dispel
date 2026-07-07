<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotifikasiStore } from '../stores/notifikasi'

const auth = useAuthStore()
const notif = useNotifikasiStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const showNotif = ref(false)
const showLogoutModal = ref(false)

onMounted(() => notif.startPolling())
onUnmounted(() => notif.stopPolling())

function toggleNotif() {
  showNotif.value = !showNotif.value
}

function closeNotif() {
  showNotif.value = false
}

function markAllRead() {
  notif.markAllRead()
}

function clickNotif(n) {
  notif.markRead(n.id)
  if (n.jenis === 'pending') router.push('/verifikasi')
}

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>',
  },
  {
    path: '/verifikasi',
    label: 'Laporan Masuk',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/></svg>',
  },
  {
    path: '/data-cpmi',
    label: 'Manajemen Data CPMI',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>',
  },
  {
    path: '/perusahaan',
    label: 'Manajemen Perusahaan',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/></svg>',
  },
  {
    path: '/log-aktivitas',
    label: 'Riwayat Laporan',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>',
  },
  {
    path: '/pengaturan',
    label: 'Pengaturan',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>',
  },
]

function confirmLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo-wrap">
          <div class="logo-icon">S</div>
          <div>
            <h1 class="logo">SIPEL</h1>
            <p class="subtitle">Admin Dinas</p>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: route.path === item.path }"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">{{ auth.user?.name?.charAt(0) || 'A' }}</div>
          <div class="user-info">
            <p class="user-name">{{ auth.user?.name || 'Admin' }}</p>
            <p class="user-role">Administrator</p>
          </div>
        </div>
        <button class="btn-logout" @click="showLogoutModal = true">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Keluar
        </button>
      </div>
    </aside>

    <div class="overlay" :class="{ open: sidebarOpen }" @click="sidebarOpen = false"></div>

      <main class="main" @click="closeNotif">
      <header class="topbar">
        <button class="hamburger" @click="sidebarOpen = true">
          <svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
        </button>
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">SIPEL</router-link>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ navItems.find(i => i.path === route.path)?.label || 'Dashboard' }}</span>
        </div>
        <div class="spacer"></div>

        <div class="topbar-right">
          <div class="notif-wrap" @click.stop="toggleNotif">
            <button class="btn-icon">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
              <span v-if="notif.unreadCount" class="notif-badge">{{ notif.unreadCount > 9 ? '9+' : notif.unreadCount }}</span>
            </button>
            <div v-if="showNotif" class="notif-dropdown" @click.stop>
              <div class="notif-header">
                <span class="notif-title">Notifikasi</span>
                <button v-if="notif.unreadCount" class="btn-text" @click="markAllRead">Tandai dibaca</button>
              </div>
              <div class="notif-list">
                <div v-for="n in notif.notifications" :key="n.id" class="notif-item" :class="{ unread: !n.dibaca }" @click="clickNotif(n)">
                  <div class="notif-dot" :class="{ read: n.dibaca }"></div>
                  <div class="notif-body">
                    <p class="notif-msg">{{ n.message }}</p>
                    <span class="notif-time">{{ n.dibuat }}</span>
                  </div>
                </div>
                <div v-if="notif.notifications.length === 0" class="notif-empty">Tidak ada notifikasi</div>
              </div>
            </div>
          </div>
          <button class="btn-icon btn-logout-top" @click="showLogoutModal = true" title="Keluar">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </header>

      <div class="content">
        <router-view />
      </div>
    </main>

    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal" @click.stop>
        <div class="modal-icon-wrap">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#dc2626" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
        </div>
        <h3 class="modal-title" style="text-align:center">Yakin ingin keluar?</h3>
        <p class="modal-sub" style="text-align:center">Anda akan logout dari sistem SIPEL</p>
        <div class="modal-actions" style="justify-content:center">
          <button class="btn btn-outline" @click="showLogoutModal = false">Batal</button>
          <button class="btn btn-danger" @click="confirmLogout">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout { display: flex; min-height: 100vh; }

/* ── Sidebar (Navy) ── */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, var(--navy-dark) 0%, #07162e 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.3s;
}

.sidebar-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-wrap { display: flex; align-items: center; gap: 12px; }
.logo-icon {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--teal); color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px;
}
.logo { font-size: 20px; font-weight: 700; color: var(--white); margin: 0; line-height: 1.2; }
.subtitle { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 1px; }

.sidebar-nav {
  flex: 1;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius);
  color: rgba(255,255,255,0.65);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
}
.nav-link:hover {
  background: rgba(255,255,255,0.08);
  color: var(--white);
  text-decoration: none;
}
.nav-link.active {
  background: var(--teal);
  color: var(--white);
  font-weight: 600;
}
.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nav-label { flex: 1; }

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.user-card { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--teal); color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; flex-shrink: 0;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.03em; }

.btn-logout {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius); background: transparent;
  color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}
.btn-logout:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #fca5a5; }

/* ── Main ── */
.main { flex: 1; margin-left: var(--sidebar-width); }

.topbar {
  display: flex;
  align-items: center;
  padding: 14px 32px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.hamburger {
  display: none; background: none; border: none;
  padding: 4px; cursor: pointer; color: var(--gray-600);
}
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 14px; }
.breadcrumb-link { color: var(--teal); font-weight: 500; }
.breadcrumb-link:hover { text-decoration: none; color: var(--teal-hover); }
.breadcrumb-sep { color: var(--gray-300); }
.breadcrumb-current { color: var(--gray-600); }
.spacer { flex: 1; }

.content { padding: 28px 32px; }

/* ── Topbar Right ── */
.topbar-right { display: flex; align-items: center; gap: 8px; }
.btn-icon {
  position: relative;
  background: none; border: none; padding: 6px;
  cursor: pointer; color: var(--gray-500); border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.btn-icon:hover { background: var(--gray-100); color: var(--gray-700); }

.notif-wrap { position: relative; }
.notif-badge {
  position: absolute; top: 0; right: 0;
  min-width: 16px; height: 16px; border-radius: 8px;
  background: var(--danger); color: white;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px; line-height: 1;
  transform: translate(4px, -4px);
  pointer-events: none;
}
.notif-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 360px; max-height: 400px;
  background: var(--white); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg); border: 1px solid var(--gray-200);
  z-index: 300; display: flex; flex-direction: column;
  overflow: hidden;
}
.notif-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border-bottom: 1px solid var(--gray-100);
}
.notif-title { font-size: 14px; font-weight: 600; color: var(--gray-800); }
.btn-text { background: none; border: none; color: var(--teal); font-size: 12px; font-weight: 500; cursor: pointer; }
.btn-text:hover { text-decoration: underline; }

.notif-list { overflow-y: auto; max-height: 340px; }
.notif-item {
  display: flex; gap: 10px; padding: 12px 16px;
  cursor: pointer; transition: background 0.1s;
  border-bottom: 1px solid var(--gray-50);
}
.notif-item:hover { background: var(--gray-50); }
.notif-item.unread { background: #f0fdfa; }
.notif-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--teal); flex-shrink: 0; margin-top: 5px;
}
.notif-dot.read { background: var(--gray-300); }
.notif-body { flex: 1; min-width: 0; }
.notif-msg { font-size: 13px; color: var(--gray-700); line-height: 1.4; }
.notif-item.unread .notif-msg { font-weight: 500; color: var(--gray-900); }
.notif-time { font-size: 11px; color: var(--gray-400); margin-top: 2px; display: block; }
.notif-empty { padding: 32px; text-align: center; color: var(--gray-400); font-size: 13px; }

.btn-logout-top { color: var(--gray-400); }
.btn-logout-top:hover { color: var(--danger); background: var(--danger-bg); }

.modal-icon-wrap { text-align: center; margin-bottom: 16px; }

/* ── Overlay mobile ── */
.overlay { display: none; }

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .overlay.open {
    display: block; position: fixed; inset: 0;
    background: rgba(0,0,0,0.4); z-index: 99;
  }
  .hamburger { display: block; }
  .main { margin-left: 0; }
  .content { padding: 20px; }
}
</style>
