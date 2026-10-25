<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const currentTitle = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' ? title : 'Factory Overview'
})

const navigationItems = [
  { name: 'dashboard', label: 'Overview', icon: '◫' },
  { name: 'warehouse', label: 'Warehouse', icon: '▤' },
  { name: 'quality-control', label: 'Quality control', icon: '◎' },
] as const
</script>

<template>
  <div class="workspace-shell">
    <aside class="sidebar" aria-label="Main navigation">
      <RouterLink class="brand" :to="{ name: 'dashboard' }" aria-label="ForgeOS home">
        <span class="brand-mark" aria-hidden="true">F</span>
        <span class="brand-copy">
          <strong>ForgeOS</strong>
          <small>FACTORY OPERATIONS</small>
        </span>
      </RouterLink>

      <div class="site-switcher">
        <span class="site-icon" aria-hidden="true">⌂</span>
        <span><small>ACTIVE FACILITY</small><strong>North Plant</strong></span>
        <span class="chevron" aria-hidden="true">⌄</span>
      </div>

      <p class="nav-label">WORKSPACE</p>
      <nav class="primary-nav">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.name"
          class="nav-link"
          :to="{ name: item.name }"
        >
          <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="item.name === 'quality-control'" class="nav-indicator" aria-label="Open issues">2</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <span class="connection-indicator" aria-hidden="true"></span>
        <span><strong>Systems operational</strong><small>Last sync just now</small></span>
      </div>
    </aside>

    <main class="main-column">
      <header class="topbar">
        <div class="breadcrumb"><span>North Plant</span><span aria-hidden="true">/</span><strong>{{ currentTitle }}</strong></div>
        <div class="topbar-actions">
          <span class="live-status"><span class="live-dot" aria-hidden="true"></span>LIVE SYSTEM</span>
          <button class="icon-button" type="button" aria-label="Notifications">♧<span class="notification-dot"></span></button>
          <span class="avatar" aria-label="Signed in as Alex Morgan">AM</span>
        </div>
      </header>

      <div class="page-content">
        <RouterView v-slot="{ Component, route: activeRoute }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="activeRoute.name" />
          </Transition>
        </RouterView>
      </div>
      <footer class="workspace-footer"><span>FORGEOS MES</span><span>North Plant · Production environment</span></footer>
    </main>
  </div>
</template>

<style>
:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #0b111b;
  color: #e6edf5;
}

html, body, #app { width: 100%; min-width: 320px; min-height: 100%; margin: 0; }
body { min-height: 100vh; background: #0b111b; }
#app { max-width: none; padding: 0; font-weight: 400; }
* { box-sizing: border-box; }
button { font: inherit; }
.workspace-shell { min-height: 100vh; background: #0b111b; }
.sidebar { position: fixed; inset: 0 auto 0 0; z-index: 2; display: flex; width: 248px; flex-direction: column; padding: 1.5rem 1rem 1rem; border-right: 1px solid #202b3a; background: #0e1724; }
.brand { display: flex; align-items: center; gap: 0.75rem; padding: 0 0.55rem; color: inherit; text-decoration: none; }
.brand-mark { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: 0.75rem; background: #5bd2ad; color: #08251f; font-size: 1.3rem; font-weight: 800; }
.brand-copy { display: grid; gap: 0.14rem; }
.brand-copy strong { font-size: 1.05rem; letter-spacing: -0.03em; }
.brand-copy small, .site-switcher small { color: #7d8ba0; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.11em; }
.site-switcher { display: flex; align-items: center; gap: 0.7rem; margin-top: 2.3rem; padding: 0.8rem 0.65rem; border: 1px solid #253246; border-radius: 0.7rem; background: #131f2e; }
.site-icon { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 0.55rem; background: #1d3040; color: #7ce1c0; }
.site-switcher > span:nth-child(2) { display: grid; flex: 1; gap: 0.2rem; }
.site-switcher strong { font-size: 0.82rem; }
.chevron { color: #7d8ba0; }
.nav-label { margin: 2rem 0 0.65rem 0.65rem; color: #64748b; font-size: 0.61rem; font-weight: 700; letter-spacing: 0.13em; }
.primary-nav { display: grid; gap: 0.35rem; }
.nav-link { display: flex; min-height: 2.65rem; align-items: center; gap: 0.75rem; padding: 0 0.75rem; border: 1px solid transparent; border-radius: 0.6rem; color: #9aa7b9; font-size: 0.84rem; text-decoration: none; transition: background 140ms ease, color 140ms ease, border-color 140ms ease; }
.nav-link:hover { background: #172535; color: #edf5fa; }
.nav-link.router-link-active { border-color: #29483f; background: #18332f; color: #8de6c4; }
.nav-icon { width: 1.2rem; color: #8795a9; text-align: center; font-size: 1rem; }
.router-link-active .nav-icon { color: #8de6c4; }
.nav-indicator { display: grid; width: 1.25rem; height: 1.25rem; place-items: center; margin-left: auto; border-radius: 50%; background: #42332a; color: #ffca8b; font-size: 0.67rem; }
.sidebar-footer { display: flex; align-items: flex-start; gap: 0.65rem; margin-top: auto; padding: 1rem 0.55rem 0.25rem; border-top: 1px solid #202b3a; }
.connection-indicator, .live-dot { width: 0.45rem; height: 0.45rem; flex: 0 0 auto; margin-top: 0.25rem; border-radius: 50%; background: #52d3a9; box-shadow: 0 0 10px #52d3a966; }
.sidebar-footer > span:last-child { display: grid; gap: 0.25rem; }
.sidebar-footer strong { font-size: 0.75rem; font-weight: 600; }
.sidebar-footer small { color: #758399; font-size: 0.68rem; }
.main-column { min-height: 100vh; margin-left: 248px; }
.topbar { position: sticky; top: 0; z-index: 1; display: flex; height: 4.25rem; align-items: center; justify-content: space-between; gap: 1rem; padding: 0 2rem; border-bottom: 1px solid #202b3a; background: #0b111beF; backdrop-filter: blur(14px); }
.breadcrumb, .topbar-actions { display: flex; align-items: center; gap: 0.8rem; }
.breadcrumb { color: #758399; font-size: 0.78rem; }
.breadcrumb strong { color: #d9e1ea; font-weight: 550; }
.topbar-actions { gap: 1.2rem; }
.live-status { display: flex; align-items: center; gap: 0.5rem; color: #81daba; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; }
.live-dot { width: 0.4rem; height: 0.4rem; margin: 0; }
.icon-button { position: relative; display: grid; width: 2rem; height: 2rem; place-items: center; border: 0; border-radius: 50%; background: transparent; color: #9ba8b9; cursor: pointer; font-size: 1.1rem; }
.icon-button:hover { background: #192638; }
.notification-dot { position: absolute; top: 0.25rem; right: 0.3rem; width: 0.4rem; height: 0.4rem; border: 1px solid #0b111b; border-radius: 50%; background: #f0a66e; }
.avatar { display: grid; width: 2rem; height: 2rem; place-items: center; border: 1px solid #35445a; border-radius: 50%; background: #24364a; color: #c9d5e3; font-size: 0.65rem; font-weight: 700; }
.page-content { width: min(100%, 1440px); margin: 0 auto; padding: 2.25rem 2rem; }
.workspace-footer { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 2rem; border-top: 1px solid #202b3a; color: #66758b; font-size: 0.67rem; }
.workspace-footer span:first-child { font-weight: 700; letter-spacing: 0.1em; }
.page-enter-active, .page-leave-active { transition: opacity 120ms ease, transform 120ms ease; }
.page-enter-from { opacity: 0; transform: translateY(5px); }
.page-leave-to { opacity: 0; transform: translateY(-3px); }
@media (max-width: 760px) {
  .sidebar { position: sticky; inset: 0 0 auto; width: 100%; height: auto; padding: 0.8rem 1rem; border-right: 0; border-bottom: 1px solid #202b3a; }
  .brand { padding: 0; }
  .brand-mark { width: 2.1rem; height: 2.1rem; }
  .site-switcher, .nav-label, .sidebar-footer { display: none; }
  .primary-nav { display: flex; gap: 0.35rem; overflow-x: auto; margin-top: 0.8rem; }
  .nav-link { min-height: 2.35rem; flex: 0 0 auto; gap: 0.4rem; padding: 0 0.65rem; font-size: 0.75rem; }
  .nav-indicator { width: 1rem; height: 1rem; }
  .main-column { margin-left: 0; }
  .topbar { height: 3.6rem; padding: 0 1rem; }
  .topbar-actions { gap: 0.7rem; }
  .page-content { padding: 1.5rem 1rem; }
  .workspace-footer { padding: 0.9rem 1rem; }
}
@media (max-width: 430px) {
  .live-status { font-size: 0; }
  .live-status .live-dot { width: 0.5rem; height: 0.5rem; }
  .breadcrumb { gap: 0.45rem; font-size: 0.69rem; }
  .workspace-footer { flex-direction: column; gap: 0.25rem; }
}
</style>
