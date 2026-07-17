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

onMounted(() => {
  if (auth.isLoggedIn) notif.startPolling()
})

onUnmounted(() => {
  notif.stopPolling()
})

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
  router.push('/pt/riwayat')
}

const navItems = [
  {
    path: '/pt',
    label: 'Dashboard',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7zM10 4.414l5 5V17h-3v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4H5V9.414l5-5z"/></svg>',
  },
  {
    path: '/pt/upload',
    label: 'Upload Laporan',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>',
  },
  {
    path: '/pt/riwayat',
    label: 'Riwayat Laporan',
    icon: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>',
  },
]

const isActive = (path) => {
  return route.path === path
}

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
          <div class="logo-icon">
            <img v-if="auth.user?.foto" :src="auth.user.foto" class="avatar-img" />
            <span v-else>S</span>
          </div>
          <div class="logo-text">
            <h1 class="logo">SistemPelporanPMI</h1>
            <p class="subtitle">Perusahaan / PT</p>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-label-group">Menu Utama</div>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
          @click="sidebarOpen = false"
        >
          <span class="nav-indicator"></span>
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">
            <img v-if="auth.user?.foto" :src="auth.user.foto" class="avatar-img" />
            <span v-else>{{ auth.user?.name?.charAt(0) || 'P' }}</span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ auth.user?.name || 'Perusahaan' }}</p>
            <p class="user-role">{{ auth.isPT ? 'Perusahaan / PT' : 'User' }}</p>
          </div>
        </div>
        <button class="logout-btn-sidebar" @click="showLogoutModal = true" title="Keluar">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
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
          <router-link to="/pt" class="breadcrumb-link">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" clip-rule="evenodd"/></svg>
          </router-link>
          <span class="breadcrumb-sep">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </span>
          <span class="breadcrumb-current">{{ navItems.find(i => i.path === route.path)?.label || 'Dashboard' }}</span>
        </div>
        <div class="spacer"></div>
        <div class="topbar-right">
          <div class="notif-wrap" @click.stop="toggleNotif">
            <button class="btn-icon" :class="{ 'has-unread': notif.unreadCount > 0 }">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
              <span v-if="notif.unreadCount" class="notif-badge">{{ notif.unreadCount > 9 ? '9+' : notif.unreadCount }}</span>
            </button>
            <div v-if="showNotif" class="notif-dropdown" @click.stop>
              <div class="notif-header">
                <div class="notif-header-left">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                  <span class="notif-title">Notifikasi</span>
                </div>
                <button v-if="notif.unreadCount" class="btn-text" @click="markAllRead">Tandai dibaca</button>
              </div>
              <div class="notif-list">
                <div v-for="n in notif.notifications" :key="n.id" class="notif-item" :class="{ unread: !n.dibaca }" @click="clickNotif(n)">
                  <div class="notif-dot-wrap">
                    <div class="notif-dot" :class="{ read: n.dibaca }"></div>
                  </div>
                  <div class="notif-body">
                    <p class="notif-msg">{{ n.message }}</p>
                    <span class="notif-time">{{ n.dibuat }}</span>
                  </div>
                </div>
                <div v-if="notif.notifications.length === 0" class="notif-empty">
                  <svg viewBox="0 0 20 20" width="32" height="32" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                  <span>Tidak ada notifikasi</span>
                </div>
              </div>
            </div>
          </div>
          <button class="btn-logout-top" @click="showLogoutModal = true" title="Keluar">
            <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Keluar
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
        <p class="modal-sub" style="text-align:center">Anda akan logout dari sistem SistemPelporanPMI</p>
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

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #0a1f3f 0%, #040e1f 100%);
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
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.logo-wrap { display: flex; align-items: center; gap: 12px; }
.logo-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--teal); color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px; overflow: hidden; flex-shrink: 0;
}
.logo-text { min-width: 0; }
.logo { font-size: 18px; font-weight: 700; color: var(--white); margin: 0; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.subtitle { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; }

.sidebar-nav {
  flex: 1;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.nav-label-group {
  font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.25);
  text-transform: uppercase; letter-spacing: 0.08em;
  padding: 8px 14px 6px; margin-top: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: rgba(255,255,255,0.55);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.nav-link:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.85);
  text-decoration: none;
}
.nav-link.active {
  background: rgba(13,148,136,0.15);
  color: var(--teal);
  font-weight: 600;
}
.nav-indicator {
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 0; border-radius: 0 3px 3px 0;
  background: var(--teal); transition: height 0.2s;
}
.nav-link.active .nav-indicator { height: 20px; }
.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative; z-index: 1;
}
.nav-label {
  flex: 1; position: relative; z-index: 1;
}

.sidebar-footer {
  padding: 12px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column; gap: 10px;
}
.user-card { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--teal); color: white; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
.user-role { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.03em; margin: 0; }
.logout-btn-sidebar {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 10px 14px; border: 1px solid rgba(239,68,68,0.25);
  border-radius: 10px; background: rgba(239,68,68,0.08);
  color: #fca5a5; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.logout-btn-sidebar:hover {
  background: rgba(239,68,68,0.2); color: #fff;
  border-color: rgba(239,68,68,0.5); transform: translateY(-1px);
}
.logout-btn-sidebar:active { transform: translateY(0); }

/* ── Main ── */
.main { flex: 1; margin-left: var(--sidebar-width); }

.topbar {
  display: flex;
  align-items: center;
  padding: 12px 32px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 60px;
}
.hamburger {
  display: none; background: none; border: none;
  padding: 4px; cursor: pointer; color: var(--gray-600);
}
.breadcrumb { display: flex; align-items: center; gap: 4px; font-size: 14px; }
.breadcrumb-link {
  color: var(--gray-400); display: flex; align-items: center; padding: 4px;
  border-radius: 6px; transition: all 0.15s;
}
.breadcrumb-link:hover { color: var(--teal); background: var(--gray-100); text-decoration: none; }
.breadcrumb-sep { color: var(--gray-300); display: flex; align-items: center; }
.breadcrumb-current { color: var(--gray-700); font-weight: 500; }
.spacer { flex: 1; }

.content { padding: 24px 32px; }

/* ── Topbar Right ── */
.topbar-right { display: flex; align-items: center; gap: 4px; }
.btn-icon {
  position: relative;
  background: none; border: none; padding: 8px;
  cursor: pointer; color: var(--gray-400); border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.btn-icon:hover { background: var(--gray-100); color: var(--gray-600); }
.btn-icon.has-unread { color: var(--teal); }

.notif-wrap { position: relative; }
.notif-badge {
  position: absolute; top: 2px; right: 2px;
  min-width: 16px; height: 16px; border-radius: 8px;
  background: var(--danger); color: white;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px; line-height: 1;
  pointer-events: none;
  box-shadow: 0 0 0 2px white;
}
.notif-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 380px; max-height: 420px;
  background: var(--white); border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
  z-index: 300; display: flex; flex-direction: column;
  overflow: hidden; animation: notifIn 0.2s ease;
}
@keyframes notifIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.notif-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border-bottom: 1px solid var(--gray-100);
}
.notif-header-left { display: flex; align-items: center; gap: 8px; color: var(--gray-500); }
.notif-title { font-size: 14px; font-weight: 600; color: var(--gray-800); }
.btn-text { background: none; border: none; color: var(--teal); font-size: 12px; font-weight: 500; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.btn-text:hover { background: var(--teal-light); text-decoration: none; }

.notif-list { overflow-y: auto; max-height: 340px; }
.notif-item {
  display: flex; gap: 12px; padding: 12px 16px;
  cursor: pointer; transition: background 0.1s;
  border-bottom: 1px solid var(--gray-50);
}
.notif-item:hover { background: var(--gray-50); }
.notif-item.unread { background: #f0fdfa; }
.notif-dot-wrap { padding-top: 4px; flex-shrink: 0; }
.notif-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--teal);
}
.notif-dot.read { background: var(--gray-300); }
.notif-body { flex: 1; min-width: 0; }
.notif-msg { font-size: 13px; color: var(--gray-700); line-height: 1.4; margin: 0; }
.notif-item.unread .notif-msg { font-weight: 500; color: var(--gray-900); }
.notif-time { font-size: 11px; color: var(--gray-400); margin-top: 3px; display: block; }
.notif-empty {
  padding: 40px 20px; text-align: center; color: var(--gray-400); font-size: 13px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}

.btn-logout-top {
  display: flex; align-items: center; gap: 6px;
  background: none; border: 1px solid transparent; padding: 7px 14px;
  cursor: pointer; color: var(--gray-400); border-radius: 8px;
  font-size: 13px; font-weight: 500;
  transition: all 0.2s; white-space: nowrap;
}
.btn-logout-top:hover {
  color: var(--danger); background: var(--danger-bg);
  border-color: #fecaca; transform: translateY(-1px);
}
.btn-logout-top:active { transform: translateY(0); }

.modal-icon-wrap { text-align: center; margin-bottom: 16px; }
.modal-logout { max-width: 400px; text-align: center; }

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
