<script setup lang="ts">
import { ref } from 'vue'
import { useFactoryStore } from '@/composables/useFactoryStore'

const { inventory, lowStockAlerts, restockInventory } = useFactoryStore()
const actionMessage = ref<string | null>(null)

function restockSku(sku: string): void {
  const result = restockInventory(sku)
  actionMessage.value = result.success
    ? `Restocked ${sku} by 100 units.`
    : result.error
}
</script>

<template>
  <section class="space-y-6" aria-labelledby="warehouse-title">
    <header class="flex flex-wrap items-end justify-between gap-4 mb-3">
      <div>
        <p class="mb-2 text-[0.68rem] font-bold tracking-[0.16em] text-emerald-300">SUPPLY &amp; MATERIALS</p>
        <h1 id="warehouse-title" class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Warehouse inventory</h1>
        <p class="mt-2 text-sm text-slate-400">Stock levels, storage locations, and replenishment signals.</p>
      </div>
      <div class="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
        <span class="font-semibold text-white">{{ inventory.length }}</span> tracked SKUs
      </div>
    </header>

    <section
      v-if="lowStockAlerts.length > 0"
      class="relative overflow-hidden rounded-2xl border border-rose-400/35 bg-rose-950/35 p-4 shadow-[0_0_30px_rgba(244,63,94,0.12)] sm:p-5"
      role="alert"
      aria-live="polite"
      aria-labelledby="stock-alert-title"
    >
      <div class="absolute inset-y-0 left-0 w-1 bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.9)]" aria-hidden="true"></div>
      <div class="flex items-start gap-3 pl-1">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-rose-300/20 bg-rose-400/10 text-lg text-rose-300" aria-hidden="true">!</span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 id="stock-alert-title" class="font-semibold text-rose-100">Stock threshold alert</h2>
            <span class="rounded-full bg-rose-400/15 px-2 py-0.5 text-[0.68rem] font-semibold text-rose-200">{{ lowStockAlerts.length }} item{{ lowStockAlerts.length === 1 ? '' : 's' }} below minimum</span>
          </div>
          <p class="mt-1 text-sm text-rose-100/70">Replenishment is recommended for the following materials:</p>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li v-for="item in lowStockAlerts" :key="item.id" class="rounded-lg border border-rose-300/15 bg-rose-400/5 px-2.5 py-1.5 text-xs text-rose-100">
              <span class="font-semibold">{{ item.sku }}</span><span class="mx-1.5 text-rose-200/50">·</span>{{ item.quantity }} / {{ item.minThreshold }} {{ item.unit }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <div v-if="actionMessage" class="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200" role="status">
      <span>{{ actionMessage }}</span>
      <button class="rounded px-1 text-emerald-200/70 hover:text-emerald-100" type="button" aria-label="Dismiss message" @click="actionMessage = null">×</button>
    </div>

    <section class="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/75" aria-labelledby="inventory-title">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 px-4 py-4 sm:px-5">
        <div>
          <p class="text-[0.65rem] font-bold tracking-[0.15em] text-slate-500">MATERIALS MANAGEMENT</p>
          <h2 id="inventory-title" class="mt-1 text-base font-semibold text-slate-100">Inventory register</h2>
        </div>
        <span class="text-xs text-slate-400">{{ inventory.length }} records</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] table-auto text-left">
          <thead class="bg-slate-950/35 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th class="px-5 py-3" scope="col">Part name</th>
              <th class="px-4 py-3" scope="col">SKU code</th>
              <th class="px-4 py-3" scope="col">Storage zone</th>
              <th class="px-4 py-3" scope="col">Current quantity</th>
              <th class="px-4 py-3" scope="col">Minimum</th>
              <th class="px-5 py-3 text-right" scope="col">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/90">
            <tr v-for="item in inventory" :key="item.id" class="transition-colors hover:bg-slate-800/35">
              <td class="px-5 py-4">
                <div class="font-medium text-slate-100">{{ item.name }}</div>
                <div class="mt-0.5 text-xs text-slate-500">Unit: {{ item.unit }}</div>
              </td>
              <td class="px-4 py-4 font-mono text-xs text-slate-300">{{ item.sku }}</td>
              <td class="px-4 py-4">
                <span class="inline-grid h-7 w-7 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300">{{ item.storageZone }}</span>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums"
                  :class="item.quantity < item.minThreshold
                    ? 'border-rose-400/30 bg-rose-400/10 text-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.16)]'
                    : 'border-slate-700 bg-slate-800/80 text-slate-200'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="item.quantity < item.minThreshold ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]' : 'bg-slate-500'" aria-hidden="true"></span>
                  {{ item.quantity.toLocaleString() }} {{ item.unit }}
                </span>
              </td>
              <td class="px-4 py-4 text-xs tabular-nums text-slate-400">{{ item.minThreshold.toLocaleString() }} {{ item.unit }}</td>
              <td class="px-5 py-4 text-right">
                <button
                  class="whitespace-nowrap rounded-lg border border-emerald-400/25 bg-emerald-400/5 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:bg-emerald-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                  type="button"
                  :aria-label="`Restock ${item.name} (${item.sku}) by 100 units`"
                  @click="restockSku(item.sku)"
                >
                  + Restock
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">Quantity warnings activate when on-hand stock falls below the item minimum.</p>
    </section>
  </section>
</template>
