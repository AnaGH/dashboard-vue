<script setup lang="ts">
import { ref } from 'vue'
import ProductionLineCard from '@/components/ProductionLineCard.vue'
import { useFactoryStore } from '@/composables/useFactoryStore'

const {
  metrics,
  productionLines,
  toggleProductionLineStatus,
  logProductionLineDefect,
} = useFactoryStore()
const actionError = ref<string | null>(null)

function handleToggleStatus(lineId: string): void {
  const result = toggleProductionLineStatus(lineId)
  actionError.value = result.success ? null : result.error
}

function handleLogDefect(lineId: string): void {
  const result = logProductionLineDefect(lineId)
  actionError.value = result.success ? null : result.error
}
</script>

<template>
  <section class="space-y-7" aria-labelledby="dashboard-title">
    <header class="flex flex-wrap items-end justify-between gap-4 mb-3">
      <div>
        <p class="mb-2 text-[0.68rem] font-bold tracking-[0.16em] text-emerald-300">LIVE OPERATIONS</p>
        <h1 id="dashboard-title" class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Production dashboard
        </h1>
        <p class="mt-2 text-sm text-slate-400">Real-time manufacturing performance · North Plant</p>
      </div>
      <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs font-medium text-emerald-300">
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
        </span>
        Telemetry live
      </div>
    </header>

    <section class="grid gap-4 rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-5 sm:grid-cols-2 sm:p-6" aria-label="Factory performance summary">
      <article class="flex items-center justify-between gap-4 border-b border-slate-700/70 pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Factory OEE</p>
          <p class="mt-2 text-3xl font-semibold tabular-nums text-white">{{ metrics.factoryOEE.toFixed(1) }}<span class="ml-1 text-lg text-slate-400">%</span></p>
          <p class="mt-1 text-xs text-slate-500">Availability × performance × estimated quality</p>
        </div>
        <div class="grid h-12 w-12 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-xl text-emerald-300" aria-hidden="true">◌</div>
      </article>
      <article class="flex items-center justify-between gap-4 sm:pl-6">
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Total defects logged</p>
          <p class="mt-2 text-3xl font-semibold tabular-nums text-white">{{ metrics.totalDefects.toLocaleString() }}</p>
          <p class="mt-1 text-xs text-slate-500">Across {{ productionLines.length }} production lines</p>
        </div>
        <div class="grid h-12 w-12 place-items-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-xl text-amber-200" aria-hidden="true">◇</div>
      </article>
    </section>

    <div v-if="actionError" class="flex items-start justify-between gap-4 rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
      <span>{{ actionError }}</span>
      <button class="rounded px-1 text-rose-200 hover:bg-rose-300/10" type="button" aria-label="Dismiss error" @click="actionError = null">×</button>
    </div>

    <section class="space-y-4" aria-labelledby="lines-title">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="mb-1 text-[0.65rem] font-bold tracking-[0.15em] text-slate-500">FACTORY FLOOR</p>
          <h2 id="lines-title" class="text-lg font-semibold text-slate-100">Production lines</h2>
        </div>
        <p class="text-xs text-slate-400">
          <span class="font-semibold text-slate-200">{{ metrics.activeProductionLines }}</span>
          of {{ productionLines.length }} lines operational
        </p>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <ProductionLineCard
          v-for="line in productionLines"
          :key="line.id"
          :line="line"
          @toggle-status="handleToggleStatus"
          @log-defect="handleLogDefect"
        />
      </div>
    </section>
  </section>
</template>
