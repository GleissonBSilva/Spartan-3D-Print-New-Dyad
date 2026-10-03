import { PricingService } from '../services/pricingService';

describe('PricingService', () => {
  describe('calculateProjectPricing', () => {
    it('calculates basic pricing correctly', () => {
      const result = PricingService.calculateProjectPricing({
        materials: [
          {
            id: '1',
            materialName: 'PLA Preto',
            weightGrams: 100,
            costPerGram: 0.095,
            totalCost: 9.5,
          },
        ],
        printTimeHours: 2,
        printerPowerWatts: 350,
        kwhEnergyRate: 0.85,
        depreciationHourlyRate: 0.50,
        failureRatePercent: 10,
        laborCost: 15.0,
        otherCosts: 0,
        profitMarginPercent: 140,
      });

      expect(result.totalWeightGrams).toBe(100);
      expect(result.materialCost).toBe(9.5);
      expect(result.energyCost).toBeGreaterThan(0);
      expect(result.suggestedPrice).toBeGreaterThan(0);
    });

    it('calculates with multiple materials', () => {
      const result = PricingService.calculateProjectPricing({
        materials: [
          {
            id: '1',
            materialName: 'PLA Preto',
            weightGrams: 100,
            costPerGram: 0.095,
            totalCost: 9.5,
          },
          {
            id: '2',
            materialName: 'PLA Branco',
            weightGrams: 50,
            costPerGram: 0.105,
            totalCost: 5.25,
          },
        ],
        printTimeHours: 2,
        printerPowerWatts: 350,
        kwhEnergyRate: 0.85,
        depreciationHourlyRate: 0.50,
        failureRatePercent: 10,
        laborCost: 15.0,
        otherCosts: 0,
        profitMarginPercent: 140,
      });

      expect(result.totalWeightGrams).toBe(150);
      expect(result.materialCost).toBe(14.75);
    });

    it('includes failure rate in material cost', () => {
      const result = PricingService.calculateProjectPricing({
        materials: [
          {
            id: '1',
            materialName: 'PLA Preto',
            weightGrams: 100,
            costPerGram: 0.095,
            totalCost: 9.5,
          },
        ],
        printTimeHours: 2,
        printerPowerWatts: 350,
        kwhEnergyRate: 0.85,
        depreciationHourlyRate: 0.50,
        failureRatePercent: 20, // 20% failure rate
        laborCost: 15.0,
        otherCosts: 0,
        profitMarginPercent: 140,
      });

      expect(result.materialsWithFailureCost).toBeGreaterThan(result.materialCost);
    });
  });

  describe('generateMaterialVariations', () => {
    it('generates single color variation', () => {
      const materials = [
        {
          id: '1',
          materialName: 'PLA Preto',
          weightGrams: 100,
          costPerGram: 0.095,
          totalCost: 9.5,
        },
      ];

      const variations = PricingService.generateMaterialVariations(materials, {
        printTimeHours: 2,
        printerPowerWatts: 350,
        kwhEnergyRate: 0.85,
        depreciationHourlyRate: 0.50,
        failureRatePercent: 10,
        laborCost: 15.0,
        otherCosts: 0,
        profitMarginPercent: 140,
      });

      expect(variations).toHaveLength(1);
      expect(variations[0].materialCount).toBe(1);
    });

    it('generates multiple color variations', () => {
      const materials = [
        {
          id: '1',
          materialName: 'PLA Preto',
          weightGrams: 100,
          costPerGram: 0.095,
          totalCost: 9.5,
        },
        {
          id: '2',
          materialName: 'PLA Branco',
          weightGrams: 50,
          costPerGram: 0.105,
          totalCost: 5.25,
        },
      ];

      const variations = PricingService.generateMaterialVariations(materials, {
        printTimeHours: 2,
        printerPowerWatts: 350,
        kwhEnergyRate: 0.85,
        depreciationHourlyRate: 0.50,
        failureRatePercent: 10,
        laborCost: 15.0,
        otherCosts: 0,
        profitMarginPercent: 140,
      });

      expect(variations.length).toBeGreaterThan(1);
    });
  });
});