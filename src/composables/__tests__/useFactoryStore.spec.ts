import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let cleanup: (() => void) | undefined

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useFactoryStore', () => {
  it('initializes production, inventory, and metrics with the expected defaults', async () => {
    const { useFactoryStore } = await import('../useFactoryStore')
    const store = useFactoryStore()

    expect(store.productionLines.value).toHaveLength(3)
    expect(store.productionLines.value.map((line) => line.status)).toEqual([
      'operational',
      'operational',
      'maintenance',
    ])
    expect(store.inventoryItems.value).toHaveLength(4)
    expect(store.metrics.value).toEqual({
      factoryOEE: 43,
      totalDefects: 2,
      totalUnitsProducedToday: 1434,
      activeProductionLines: 2,
      openQualityIssues: 1,
      lowStockItems: 2,
      productionTargetAttainment: 64.6,
    })
    expect(store.simulationRunning.value).toBe(false)
  })

  it('updates production output after a simulation tick', async () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const { useFactoryStore } = await import('../useFactoryStore')
    const store = useFactoryStore()
    cleanup = store.stopSimulation
    const initialOutput = store.metrics.value.totalUnitsProducedToday

    const result = store.startSimulation(1_000)

    expect(result.success).toBe(true)
    expect(store.simulationRunning.value).toBe(true)
    await vi.advanceTimersByTimeAsync(1_000)

    expect(store.metrics.value.totalUnitsProducedToday).toBe(initialOutput + 1)
    expect(store.productionLines.value[0]?.unitsProducedToday).toBe(685)
    expect(store.recentEvents.value[0]?.type).toBe('production-recorded')
  })

  it('recalculates metrics when a production line goes into downtime', async () => {
    const { useFactoryStore } = await import('../useFactoryStore')
    const store = useFactoryStore()

    const result = store.toggleProductionLineStatus('line-01')

    expect(result.success).toBe(true)
    expect(store.productionLines.value[0]?.status).toBe('downtime')
    expect(store.metrics.value.activeProductionLines).toBe(1)
    expect(store.metrics.value.factoryOEE).toBe(21.5)
  })

  it('updates stock status and metrics after restocking inventory', async () => {
    const { useFactoryStore } = await import('../useFactoryStore')
    const store = useFactoryStore()

    const result = store.restockInventory('MAT-BT-018', 50)

    expect(result).toEqual({ success: true, data: 126 })
    expect(
      store.inventoryItems.value.find((item) => item.sku === 'MAT-BT-018'),
    ).toMatchObject({ quantity: 126, status: 'in-stock' })
    expect(store.metrics.value.lowStockItems).toBe(1)
    expect(store.lowStockAlerts.value.map((item) => item.sku)).toEqual([
      'PKG-CR-110',
    ])
  })

  it('rejects invalid production quantities without changing totals', async () => {
    const { useFactoryStore } = await import('../useFactoryStore')
    const store = useFactoryStore()
    const totalBefore = store.metrics.value.totalUnitsProducedToday

    const result = store.recordProduction('line-01', 0)

    expect(result).toEqual({
      success: false,
      error: 'Production quantity must be a positive whole number.',
    })
    expect(store.metrics.value.totalUnitsProducedToday).toBe(totalBefore)
  })
})
