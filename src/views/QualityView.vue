<script setup lang="ts">
import { computed, ref } from 'vue'
import QualityLogTable from '@/components/QualityLogTable.vue'
import { useFactoryStore } from '@/composables/useFactoryStore'
import type { QualityControlLogInput, QualitySeverity } from '@/types/manufacturing'

interface QualityLogFormState {
  lineId: QualityControlLogInput['lineId']
  severity: QualitySeverity
  description: QualityControlLogInput['description']
}

const { productionLines, qualityLogs, metrics, addQualityLog } = useFactoryStore()
const activeProductionLines = computed(() =>
  productionLines.value.filter((line) => line.status === 'operational'),
)
const form = ref<QualityLogFormState>({
  lineId: '',
  severity: 'low',
  description: '',
})
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)
const canSubmit = computed(
  () =>
    activeProductionLines.value.some((line) => line.id === form.value.lineId) &&
    form.value.description.trim().length > 0,
)

function resetForm(): void {
  form.value = {
    lineId: '',
    severity: 'low',
    description: '',
  }
}

function submitLog(): void {
  if (!canSubmit.value) return

  const result = addQualityLog({
    lineId: form.value.lineId,
    severity: form.value.severity,
    description: form.value.description.trim(),
  })

  if (!result.success) {
    feedback.value = { kind: 'error', message: result.error }
    return
  }

  resetForm()
  feedback.value = { kind: 'success', message: 'Quality report submitted successfully.' }
}
</script>

<template>
  <section class="space-y-6" aria-labelledby="quality-title">
    <header class="flex flex-wrap items-end justify-between gap-4 mb-3">
      <div>
        <p class="mb-2 text-[0.68rem] font-bold tracking-[0.16em] text-emerald-300">INSPECTION &amp; COMPLIANCE</p>
        <h1 id="quality-title" class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Quality control</h1>
        <p class="mt-2 text-sm text-slate-400">Record production defects and keep a traceable inspection history.</p>
      </div>
      <div class="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
        <span class="font-semibold text-white">{{ metrics.openQualityIssues }}</span> open reports
      </div>
    </header>

    <form class="rounded-2xl border border-slate-700/70 bg-slate-900/75 p-5 sm:p-6" @submit.prevent="submitLog">
      <div class="mb-5">
        <p class="text-[0.65rem] font-bold tracking-[0.15em] text-slate-500">NEW INSPECTION REPORT</p>
        <h2 class="mt-1 text-base font-semibold text-slate-100">Lodge a quality issue</h2>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <label class="grid gap-2 text-sm font-medium text-slate-300" for="quality-line">
          Production line <span class="text-rose-300">*</span>
          <select
            id="quality-line"
            v-model="form.lineId"
            class="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
            required
          >
            <option disabled value="">Select an operational line</option>
            <option v-for="line in activeProductionLines" :key="line.id" :value="line.id">
              {{ line.name }} · {{ line.id }}
            </option>
          </select>
        </label>

        <label class="grid gap-2 text-sm font-medium text-slate-300" for="quality-severity">
          Severity <span class="text-rose-300">*</span>
          <select
            id="quality-severity"
            v-model="form.severity"
            class="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-3 text-sm capitalize text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="critical">Critical</option>
          </select>
        </label>

        <label class="grid gap-2 text-sm font-medium text-slate-300 md:col-span-2" for="quality-description">
          Defect description <span class="text-rose-300">*</span>
          <textarea
            id="quality-description"
            v-model="form.description"
            class="min-h-28 resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
            placeholder="Describe the defect, affected product, and any inspection findings…"
            required
            minlength="3"
            maxlength="500"
          ></textarea>
          <span class="text-right text-xs font-normal text-slate-500">{{ form.description.length }} / 500 characters</span>
        </label>
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
        <p class="text-xs text-slate-500">All fields are required. Select an operational line to submit a report.</p>
        <button
          class="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          type="submit"
          :disabled="!canSubmit"
        >
          Submit Log
        </button>
      </div>
    </form>

    <div
      v-if="feedback"
      class="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
      :class="feedback.kind === 'success'
        ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-200'
        : 'border-rose-400/25 bg-rose-400/10 text-rose-200'"
      :role="feedback.kind === 'error' ? 'alert' : 'status'"
    >
      <span>{{ feedback.message }}</span>
      <button class="rounded px-1 opacity-70 hover:opacity-100" type="button" aria-label="Dismiss message" @click="feedback = null">×</button>
    </div>

    <QualityLogTable :logs="qualityLogs" />
  </section>
</template>
