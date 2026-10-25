export type ProductionLineStatus = 'operational' | 'downtime' | 'maintenance'

export interface ProductionLine {
  readonly id: string
  readonly name: string
  readonly status: ProductionLineStatus
  readonly unitsProducedToday: number
  readonly targetUnits: number
  readonly unitsPerHour: number
  readonly lastUpdatedAt: string
}

export type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock'
export type StorageZone = 'A' | 'B' | 'C'

export interface WarehouseInventoryItem {
  readonly id: string
  readonly sku: string
  readonly name: string
  readonly storageZone: StorageZone
  readonly quantity: number
  readonly minThreshold: number
  readonly unit: string
  readonly status: InventoryStatus
  readonly lastUpdatedAt: string
}

export type QualitySeverity = 'low' | 'medium' | 'critical'
export type QualityIssueStatus = 'open' | 'resolved'

export interface QualityControlLog {
  readonly id: string
  readonly lineId: string
  readonly description: string
  readonly severity: QualitySeverity
  readonly status: QualityIssueStatus
  readonly timestamp: string
}

export type QualityControlLogInput = Pick<
  QualityControlLog,
  'lineId' | 'description' | 'severity'
>

export type FactoryEvent =
  | {
      readonly id: string
      readonly type: 'production-recorded'
      readonly occurredAt: string
      readonly lineId: string
      readonly unitsProduced: number
    }
  | {
      readonly id: string
      readonly type: 'inventory-adjusted'
      readonly occurredAt: string
      readonly inventoryItemId: string
      readonly quantityDelta: number
      readonly reason: string
    }
  | {
      readonly id: string
      readonly type: 'quality-issue-logged'
      readonly occurredAt: string
      readonly qualityLogId: string
    }
  | {
      readonly id: string
      readonly type: 'quality-issue-resolved'
      readonly occurredAt: string
      readonly qualityLogId: string
    }

export interface FactoryMetrics {
  readonly factoryOEE: number
  readonly totalDefects: number
  readonly totalUnitsProducedToday: number
  readonly activeProductionLines: number
  readonly openQualityIssues: number
  readonly lowStockItems: number
  readonly productionTargetAttainment: number
}

export type FactoryActionResult<T = undefined> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string }
