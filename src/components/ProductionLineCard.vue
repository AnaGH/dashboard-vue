<script setup lang="ts">
import { computed } from 'vue'
import type {
  ProductionLine,
  ProductionLineStatus,
} from '@/types/manufacturing'

const props = defineProps<{ line: ProductionLine }>()

const emit = defineEmits<{
  (e: 'toggle-status', id: string): void
  (e: 'log-defect', id: string): void
}>()

const statusPresentation: Record<
  ProductionLineStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  operational: {
    label: 'Operational',
    badgeClass: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    dotClass: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
  },
  downtime: {
    label: 'Downtime',
    badgeClass: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    dotClass: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]',
  },
  maintenance: {
    label: 'Maintenance',
    badgeClass: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    dotClass: 'bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]',
  },
}

const progressPercent = computed(() => {
  if (props.line.targetUnits <= 0) return 0
  return Math.min(
    Math.round((props.line.unitsProducedToday / props.line.targetUnits) * 100),
    100,
  )
})

const progressClass = computed(() => {
  if (props.line.status === 'downtime') return 'bg-rose-400'
  if (props.line.status === 'maintenance') return 'bg-amber-300'
  return 'bg-emerald-400'
})

const status = computed(() => statusPresentation[props.line.status])
const nextStatusAction = computed(() =>
  props.line.status === 'operational' ? 'Stop line' : 'Resume line',
)
</script>

<template>
  <article
    class="group rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-xl hover:shadow-black/20"
    :aria-labelledby="`line-title-${line.id}`"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="mb-1 text-[0.65rem] font-bold tracking-[0.16em] text-slate-500">
          PRODUCTION LINE
        </p>
        <h2 :id="`line-title-${line.id}`" class="truncate text-base font-semibold text-slate-100">
          {{ line.name }}
        </h2>
      </div>
      <span
        class="inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium"
        :class="status.badgeClass"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="status.dotClass" aria-hidden="true"></span>
        {{ status.label }}
      </span>
    </div>

    <div class="mt-7 flex items-end justify-between gap-4">
      <div>
        <p class="text-xs text-slate-400">Today's output</p>
        <p class="mt-1 text-3xl font-semibold tracking-tight text-white">
          {{ line.unitsProducedToday.toLocaleString() }}
          <span class="text-sm font-normal text-slate-500">units</span>
        </p>
      </div>
      <p class="pb-1 text-right text-xs text-slate-400">
        <span class="block text-lg font-semibold text-slate-200">{{ line.unitsPerHour }}</span>
        units / hr
      </p>
    </div>

    <div class="mt-5">
      <div class="mb-2 flex items-center justify-between text-xs">
        <span class="text-slate-400">Daily target</span>
        <span class="font-medium tabular-nums text-slate-300">
          {{ progressPercent }}% <span class="text-slate-500">· {{ line.targetUnits.toLocaleString() }} units</span>
        </span>
      </div>
      <div
        class="h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        :aria-label="`${line.name} daily target progress`"
        :aria-valuenow="progressPercent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full rounded-full transition-[width] duration-500"
          :class="progressClass"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
      <p class="text-[0.7rem] text-slate-500">
        Updated {{ new Date(line.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </p>
      <div class="flex gap-2">
        <button
          class="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          type="button"
          @click="emit('log-defect', line.id)"
        >
          Log defect
        </button>
        <button
          class="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          type="button"
          :aria-label="`${nextStatusAction}: ${line.name}`"
          @click="emit('toggle-status', line.id)"
        >
          {{ nextStatusAction }}
        </button>
      </div>
    </div>
  </article>
</template>
