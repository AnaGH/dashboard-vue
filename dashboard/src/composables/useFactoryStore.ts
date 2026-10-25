import { computed, ref } from 'vue'
import type {
  FactoryActionResult,
  FactoryEvent,
  FactoryMetrics,
  InventoryStatus,
  ProductionLine,
  QualityControlLog,
  QualityControlLogInput,
  WarehouseInventoryItem,
} from '@/types/manufacturing'

const MAX_RECENT_EVENTS = 100
const DEFAULT_SIMULATION_INTERVAL_MS = 5_000

const initialTimestamp = new Date().toISOString()
let nextId = 1
let simulationTimer: ReturnType<typeof setInterval> | undefined

const productionLines = ref<ProductionLine[]>([
  {
    id: 'line-01',
    name: 'Assembly Line 01',
    status: 'operational',
    unitsProducedToday: 684,
    targetUnits: 900,
    unitsPerHour: 86,
    lastUpdatedAt: initialTimestamp,
  },
  {
    id: 'line-02',
    name: 'Packaging Line 02',
    status: 'operational',
    unitsProducedToday: 512,
    targetUnits: 720,
    unitsPerHour: 64,
    lastUpdatedAt: initialTimestamp,
  },
  {
    id: 'line-03',
    name: 'Fabrication Line 03',
    status: 'maintenance',
    unitsProducedToday: 238,
    targetUnits: 600,
    unitsPerHour: 0,
    lastUpdatedAt: initialTimestamp,
  },
])

const inventoryItems = ref<WarehouseInventoryItem[]>([
  {
    id: 'stock-01',
    sku: 'MAT-AL-204',
    name: 'Aluminium alloy sheet',
    storageZone: 'A',
    quantity: 420,
    minThreshold: 100,
    unit: 'sheets',
    status: 'in-stock',
    lastUpdatedAt: initialTimestamp,
  },
  {
    id: 'stock-02',
    sku: 'MAT-BT-018',
    name: 'M8 fastening bolt',
    storageZone: 'B',
    quantity: 76,
    minThreshold: 120,
    unit: 'units',
    status: 'low-stock',
    lastUpdatedAt: initialTimestamp,
  },
  {
    id: 'stock-03',
    sku: 'PKG-CR-110',
    name: 'Reinforced shipping carton',
    storageZone: 'C',
    quantity: 0,
    minThreshold: 80,
    unit: 'cartons',
    status: 'out-of-stock',
    lastUpdatedAt: initialTimestamp,
  },
  {
    id: 'stock-04',
    sku: 'MAT-CB-032',
    name: 'Copper wiring spool',
    storageZone: 'A',
    quantity: 235,
    minThreshold: 60,
    unit: 'spools',
    status: 'in-stock',
    lastUpdatedAt: initialTimestamp,
  },
])

const qualityLogs = ref<QualityControlLog[]>([
  {
    id: 'quality-01',
    lineId: 'line-01',
    description: 'Surface finish variance',
    severity: 'medium',
    status: 'open',
    timestamp: initialTimestamp,
  },
  {
    id: 'quality-02',
    lineId: 'line-02',
    description: 'Seal alignment',
    severity: 'low',
    status: 'resolved',
    timestamp: initialTimestamp,
  },
])

const recentEvents = ref<FactoryEvent[]>([])
const simulationRunningState = ref(false)

const readonlyProductionLines = computed<readonly ProductionLine[]>(
  () => productionLines.value,
)
const readonlyInventoryItems = computed<readonly WarehouseInventoryItem[]>(
  () => inventoryItems.value,
)
const lowStockAlerts = computed<readonly WarehouseInventoryItem[]>(() =>
  inventoryItems.value.filter((item) => item.quantity < item.minThreshold),
)
const readonlyQualityLogs = computed<readonly QualityControlLog[]>(
  () => qualityLogs.value,
)
const readonlyRecentEvents = computed<readonly FactoryEvent[]>(
  () => recentEvents.value,
)
const simulationRunning = computed(() => simulationRunningState.value)

const metrics = computed<FactoryMetrics>(() => {
  const produced = productionLines.value.reduce(
    (total, line) => total + line.unitsProducedToday,
    0,
  )
  const target = productionLines.value.reduce(
    (total, line) => total + line.targetUnits,
    0,
  )
  const totalDefects = qualityLogs.value.length
  const availability =
    productionLines.value.length === 0
      ? 0
      : productionLines.value.filter((line) => line.status === 'operational')
          .length / productionLines.value.length
  const performance = target === 0 ? 0 : Math.min(produced / target, 1)
  const qualityRate =
    produced === 0 ? 1 : Math.max((produced - totalDefects) / produced, 0)

  return {
    factoryOEE: Math.round(availability * performance * qualityRate * 1_000) / 10,
    totalDefects,
    totalUnitsProducedToday: produced,
    activeProductionLines: productionLines.value.filter(
      (line) => line.status === 'operational',
    ).length,
    openQualityIssues: qualityLogs.value.filter((log) => log.status === 'open')
      .length,
    lowStockItems: inventoryItems.value.filter(
      (item) => item.status !== 'in-stock',
    ).length,
    productionTargetAttainment:
      target === 0 ? 0 : Math.round((produced / target) * 1_000) / 10,
  }
})

function createId(prefix: string): string {
  const id = `${prefix}-${nextId}`
  nextId += 1
  return id
}

function getInventoryStatus(
  quantity: number,
  minThreshold: number,
): InventoryStatus {
  if (quantity === 0) return 'out-of-stock'
  if (quantity < minThreshold) return 'low-stock'
  return 'in-stock'
}

function appendEvent(event: FactoryEvent): void {
  recentEvents.value.unshift(event)
  if (recentEvents.value.length > MAX_RECENT_EVENTS) {
    recentEvents.value.length = MAX_RECENT_EVENTS
  }
}

function success<T>(data: T): FactoryActionResult<T> {
  return { success: true, data }
}

function failure(error: string): FactoryActionResult<never> {
  return { success: false, error }
}

function recordProduction(
  lineId: string,
  quantity: number,
): FactoryActionResult<number> {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return failure('Production quantity must be a positive whole number.')
  }

  const line = productionLines.value.find((candidate) => candidate.id === lineId)
  if (!line) return failure(`Production line "${lineId}" was not found.`)
  if (line.status !== 'operational') {
    return failure(`Production line "${line.name}" is not operational.`)
  }

  const occurredAt = new Date().toISOString()
  productionLines.value = productionLines.value.map((candidate) =>
    candidate.id === lineId
      ? {
          ...candidate,
          unitsProducedToday: candidate.unitsProducedToday + quantity,
          lastUpdatedAt: occurredAt,
        }
      : candidate,
  )
  appendEvent({
    id: createId('event'),
    type: 'production-recorded',
    occurredAt,
    lineId,
    unitsProduced: quantity,
  })

  return success(quantity)
}

function toggleProductionLineStatus(lineId: string): FactoryActionResult<ProductionLine> {
  const line = productionLines.value.find((candidate) => candidate.id === lineId)
  if (!line) return failure(`Production line "${lineId}" was not found.`)

  const occurredAt = new Date().toISOString()
  const updatedLine: ProductionLine = {
    ...line,
    status: line.status === 'operational' ? 'downtime' : 'operational',
    lastUpdatedAt: occurredAt,
  }
  productionLines.value = productionLines.value.map((candidate) =>
    candidate.id === lineId ? updatedLine : candidate,
  )

  return success(updatedLine)
}

function logProductionLineDefect(lineId: string): FactoryActionResult<QualityControlLog> {
  const issueNumber = qualityLogs.value.length + 1
  return addQualityLog({
    lineId,
    description: `Manual inspection required (report ${issueNumber}).`,
    severity: 'medium',
  })
}

function adjustInventory(
  inventoryItemId: string,
  quantityDelta: number,
  reason: string,
): FactoryActionResult<number> {
  if (!Number.isSafeInteger(quantityDelta) || quantityDelta === 0) {
    return failure('Inventory adjustment must be a non-zero whole number.')
  }

  const item = inventoryItems.value.find(
    (candidate) => candidate.id === inventoryItemId,
  )
  if (!item) {
    return failure(`Inventory item "${inventoryItemId}" was not found.`)
  }

  const updatedQuantity = item.quantity + quantityDelta
  if (updatedQuantity < 0) {
    return failure(`Adjustment would make stock for "${item.sku}" negative.`)
  }

  const normalizedReason = reason.trim()
  if (normalizedReason.length === 0) {
    return failure('Inventory adjustment reason is required.')
  }

  const occurredAt = new Date().toISOString()
  inventoryItems.value = inventoryItems.value.map((candidate) =>
    candidate.id === inventoryItemId
      ? {
          ...candidate,
          quantity: updatedQuantity,
          status: getInventoryStatus(
            updatedQuantity,
            candidate.minThreshold,
          ),
          lastUpdatedAt: occurredAt,
        }
      : candidate,
  )
  appendEvent({
    id: createId('event'),
    type: 'inventory-adjusted',
    occurredAt,
    inventoryItemId,
    quantityDelta,
    reason: normalizedReason,
  })

  return success(updatedQuantity)
}

function restockInventory(
  sku: string,
  quantity: number = 100,
): FactoryActionResult<number> {
  const item = inventoryItems.value.find((candidate) => candidate.sku === sku)
  if (!item) return failure(`Inventory SKU "${sku}" was not found.`)
  return adjustInventory(item.id, quantity, `Manual restock of ${quantity} units`)
}

function addQualityLog(
  input: QualityControlLogInput,
): FactoryActionResult<QualityControlLog> {
  const lineExists = productionLines.value.some(
    (line) => line.id === input.lineId,
  )
  if (!lineExists) {
    return failure(`Production line "${input.lineId}" was not found.`)
  }
  const description = input.description.trim()
  if (description.length === 0) {
    return failure('A description is required for a quality issue.')
  }

  const timestamp = new Date().toISOString()
  const qualityLog: QualityControlLog = {
    id: createId('quality'),
    lineId: input.lineId,
    description,
    severity: input.severity,
    status: 'open',
    timestamp,
  }
  qualityLogs.value = [qualityLog, ...qualityLogs.value]
  appendEvent({
    id: createId('event'),
    type: 'quality-issue-logged',
    occurredAt: qualityLog.timestamp,
    qualityLogId: qualityLog.id,
  })

  return success(qualityLog)
}

function resolveQualityIssue(qualityLogId: string): FactoryActionResult<void> {
  const issue = qualityLogs.value.find((log) => log.id === qualityLogId)
  if (!issue) return failure(`Quality issue "${qualityLogId}" was not found.`)
  if (issue.status === 'resolved') {
    return failure(`Quality issue "${qualityLogId}" is already resolved.`)
  }

  const occurredAt = new Date().toISOString()
  qualityLogs.value = qualityLogs.value.map((log) =>
    log.id === qualityLogId ? { ...log, status: 'resolved' } : log,
  )
  appendEvent({
    id: createId('event'),
    type: 'quality-issue-resolved',
    occurredAt,
    qualityLogId,
  })

  return success(undefined)
}

function pickOne<T>(values: readonly T[]): T | undefined {
  if (values.length === 0) return undefined
  return values[Math.floor(Math.random() * values.length)]
}

function simulateFactoryEvent(): void {
  const eventType = Math.floor(Math.random() * 3)

  if (eventType === 0) {
    const operationalLines = productionLines.value.filter(
      (line) => line.status === 'operational',
    )
    const line = pickOne(operationalLines)
    if (line) recordProduction(line.id, Math.floor(Math.random() * 8) + 1)
    return
  }

  if (eventType === 1) {
    const item = pickOne(inventoryItems.value)
    if (item) {
      adjustInventory(item.id, -1, 'Simulated material consumption')
    }
    return
  }

  const line = pickOne(productionLines.value)
  if (!line) return
  addQualityLog({
    lineId: line.id,
    description: 'Automated inspection variance',
    severity: 'low',
  })
}

function startSimulation(
  intervalMs: number = DEFAULT_SIMULATION_INTERVAL_MS,
): FactoryActionResult<void> {
  if (!Number.isSafeInteger(intervalMs) || intervalMs <= 0) {
    return failure('Simulation interval must be a positive whole number.')
  }
  if (simulationTimer !== undefined) return success(undefined)

  simulationTimer = setInterval(simulateFactoryEvent, intervalMs)
  simulationRunningState.value = true
  return success(undefined)
}

function stopSimulation(): void {
  if (simulationTimer === undefined) return

  clearInterval(simulationTimer)
  simulationTimer = undefined
  simulationRunningState.value = false
}

export function useFactoryStore() {
  return {
    productionLines: readonlyProductionLines,
    inventoryItems: readonlyInventoryItems,
    inventory: readonlyInventoryItems,
    lowStockAlerts,
    qualityLogs: readonlyQualityLogs,
    recentEvents: readonlyRecentEvents,
    metrics,
    simulationRunning,
    recordProduction,
    toggleProductionLineStatus,
    logProductionLineDefect,
    adjustInventory,
    restockInventory,
    addQualityLog,
    logQualityIssue: addQualityLog,
    resolveQualityIssue,
    startSimulation,
    stopSimulation,
  }
}
