<script setup lang="ts">
import type { QualityControlLog, QualitySeverity } from '@/types/manufacturing'

defineProps<{
  logs: readonly QualityControlLog[]
}>()

const severityStyles: Record<QualitySeverity, string> = {
  low: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  medium: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
  critical:
    'border-rose-400/35 bg-rose-400/10 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.2)]',
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/75" aria-labelledby="quality-history-title">
    <div class="flex items-center justify-between gap-3 border-b border-slate-700/70 px-4 py-4 sm:px-5">
      <div>
        <p class="text-[0.65rem] font-bold tracking-[0.15em] text-slate-500">INSPECTION HISTORY</p>
        <h2 id="quality-history-title" class="mt-1 text-base font-semibold text-slate-100">Quality log</h2>
      </div>
      <span class="text-xs text-slate-400">{{ logs.length }} reports</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[620px] text-left">
        <thead class="bg-slate-950/35 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th class="px-5 py-3" scope="col">Description</th>
            <th class="px-4 py-3" scope="col">Production line</th>
            <th class="px-4 py-3" scope="col">Severity</th>
            <th class="px-5 py-3" scope="col">Reported</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/90">
          <tr v-for="log in logs" :key="log.id" class="transition-colors hover:bg-slate-800/35">
            <td class="px-5 py-4">
              <p class="max-w-md text-sm font-medium text-slate-100">{{ log.description }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ log.status === 'open' ? 'Awaiting review' : 'Resolved' }}</p>
            </td>
            <td class="px-4 py-4 font-mono text-xs text-slate-300">{{ log.lineId }}</td>
            <td class="px-4 py-4">
              <span class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium capitalize" :class="severityStyles[log.severity]">
                <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
                {{ log.severity }}
              </span>
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
              {{ new Date(log.timestamp).toLocaleString() }}
            </td>
          </tr>
          <tr v-if="logs.length === 0">
            <td class="px-5 py-10 text-center text-sm text-slate-500" colspan="4">
              No quality reports yet. New reports will appear here.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
