import { describe, expect, it } from 'vitest'
import { useFactoryStore } from '../useFactoryStore'

describe('useFactoryStore', () => {
  it('rejects invalid production quantities without changing totals', () => {
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
