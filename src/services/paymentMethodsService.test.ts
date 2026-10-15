import { describe, expect, it } from 'vitest';
import { PaymentMethodsService, FarmPaymentSettings } from './paymentMethodsService';

describe('PaymentMethodsService', () => {
  const mockSettings: FarmPaymentSettings = {
    pixKeyType: 'telefone',
    pixKey: '92991463640',
    pixBeneficiary: 'Farm Teste',
    downPaymentPercent: 50,
    methods: {
      pix: { enabled: true, name: 'Pix', type: 'pix', discountPercent: 10, feePercent: 0 },
      credito: { enabled: true, name: 'Crédito', type: 'credito', discountPercent: 0, feePercent: 5, maxInstallments: 12, installmentsWithoutInterest: 3 },
      debito: { enabled: true, name: 'Débito', type: 'debito', discountPercent: 0, feePercent: 2 },
      dinheiro: { enabled: true, name: 'Dinheiro', type: 'dinheiro', discountPercent: 5, feePercent: 0 },
    },
  };

  it('calculates PIX discount and 50% down payment correctly', () => {
    const res = PaymentMethodsService.calculatePaymentEffect(100, 'pix', 1, mockSettings);
    expect(res.originalPrice).toBe(100);
    expect(res.adjustmentAmount).toBe(-10);
    expect(res.adjustmentType).toBe('discount');
    expect(res.finalPrice).toBe(90);
    expect(res.downPaymentAmount).toBe(45);
    expect(res.balanceAmount).toBe(45);
  });

  it('calculates Cartão de Crédito with fee and installments correctly', () => {
    const res = PaymentMethodsService.calculatePaymentEffect(100, 'credito', 3, mockSettings);
    expect(res.originalPrice).toBe(100);
    expect(res.adjustmentAmount).toBe(5);
    expect(res.adjustmentType).toBe('fee');
    expect(res.finalPrice).toBe(105);
    expect(res.installments).toBe(3);
    expect(res.installmentValue).toBe(35);
  });

  it('handles 0 or empty base price safely without crashing', () => {
    const res = PaymentMethodsService.calculatePaymentEffect(0, 'pix', 1, mockSettings);
    expect(res.finalPrice).toBe(0);
    expect(res.adjustmentAmount).toBe(0);
    expect(res.downPaymentAmount).toBe(0);
  });
});
