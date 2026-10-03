import { describe, expect, it } from 'vitest';
import { PricingService } from './pricingService';

describe('PricingService', () => {
  it('calculates cost per gram and total material cost', () => {
    expect(PricingService.calculateMaterialItemCost(125, 100)).toEqual({ costPerGram: 0.1, totalCost: 12.5 });
  });

  it('includes failure, energy, depreciation, labor, and margin in project pricing', () => {
    const result = PricingService.calculateProjectPricing({
      materials: [{ id: 'm1', materialName: 'PLA', color: 'Blue', filamentType: 'PLA', weightGrams: 100, costPerGram: 0.1, totalCost: 10 }],
      printTimeHours: 2, printerPowerWatts: 350, kwhEnergyRate: 1, depreciationHourlyRate: 0.5,
      failureRatePercent: 10, laborCost: 5, otherCosts: 2, profitMarginPercent: 100,
    });
    expect(result.totalWeightGrams).toBe(100);
    expect(result.materialsWithFailureCost).toBe(11);
    expect(result.energyCost).toBe(0.7);
    expect(result.totalProductionCost).toBe(19.7);
    expect(result.suggestedPrice).toBe(39.4);
  });
});
