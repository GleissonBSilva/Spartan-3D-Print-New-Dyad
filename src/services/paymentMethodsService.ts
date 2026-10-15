export type PaymentMethodType = 'pix' | 'credito' | 'debito' | 'dinheiro';

export interface PaymentMethodItemConfig {
  enabled: boolean;
  name: string;
  type: PaymentMethodType;
  discountPercent?: number; // Desconto em % (ex: 5 para PIX ou Dinheiro)
  feePercent?: number;      // Taxa em % (ex: 3.5 para Crédito ou Débito)
  maxInstallments?: number; // Para crédito (ex: 12)
  installmentsWithoutInterest?: number; // Parcelas sem juros (ex: 3)
}

export interface FarmPaymentSettings {
  pixKeyType: 'cnpj' | 'cpf' | 'email' | 'telefone' | 'aleatoria';
  pixKey: string;
  pixBeneficiary: string;
  downPaymentPercent: number; // Porcentagem padrão de sinal para início (ex: 50%)
  methods: {
    pix: PaymentMethodItemConfig;
    credito: PaymentMethodItemConfig;
    debito: PaymentMethodItemConfig;
    dinheiro: PaymentMethodItemConfig;
  };
}

export interface PaymentCalculationResult {
  method: PaymentMethodType;
  methodName: string;
  originalPrice: number;
  adjustmentAmount: number; // Valor em R$ do desconto (-) ou taxa (+)
  adjustmentType: 'discount' | 'fee' | 'none';
  adjustmentPercent: number;
  finalPrice: number;
  installments: number;
  installmentValue: number;
  downPaymentPercent: number;
  downPaymentAmount: number; // Valor de entrada (sinal)
  balanceAmount: number;     // Valor restante na entrega
  summaryText: string;
}

export const DEFAULT_PAYMENT_SETTINGS: FarmPaymentSettings = {
  pixKeyType: 'telefone',
  pixKey: '+55 92 99146-3640',
  pixBeneficiary: 'Spartan 3D Print',
  downPaymentPercent: 50,
  methods: {
    pix: {
      enabled: true,
      name: 'Pix Instantâneo',
      type: 'pix',
      discountPercent: 5, // 5% de desconto padrão no Pix
      feePercent: 0,
    },
    credito: {
      enabled: true,
      name: 'Cartão de Crédito',
      type: 'credito',
      discountPercent: 0,
      feePercent: 0,
      maxInstallments: 12,
      installmentsWithoutInterest: 3,
    },
    debito: {
      enabled: true,
      name: 'Cartão de Débito',
      type: 'debito',
      discountPercent: 0,
      feePercent: 0,
    },
    dinheiro: {
      enabled: true,
      name: 'Dinheiro em Espécie',
      type: 'dinheiro',
      discountPercent: 5,
      feePercent: 0,
    },
  },
};

const STORAGE_KEY = 'spartan_payment_methods_config';

export class PaymentMethodsService {
  /**
   * Obtém as configurações de formas de pagamento salvas ou padrões
   */
  static getSettings(): FarmPaymentSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PAYMENT_SETTINGS,
          ...parsed,
          methods: {
            ...DEFAULT_PAYMENT_SETTINGS.methods,
            ...(parsed.methods || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Erro ao ler configurações de pagamento do localStorage:', e);
    }
    return DEFAULT_PAYMENT_SETTINGS;
  }

  /**
   * Salva as configurações de formas de pagamento no localStorage
   */
  static saveSettings(settings: FarmPaymentSettings): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event('spartan_payment_settings_updated'));
      return true;
    } catch (e) {
      console.error('Erro ao salvar configurações de pagamento:', e);
      return false;
    }
  }

  /**
   * Calcula o impacto financeiro da forma de pagamento selecionada no preço do orçamento
   */
  static calculatePaymentEffect(
    basePrice: number,
    method: PaymentMethodType = 'pix',
    installments = 1,
    customSettings?: FarmPaymentSettings
  ): PaymentCalculationResult {
    const settings = customSettings || this.getSettings();
    const methodConfig = settings.methods[method] || settings.methods.pix;
    const safePrice = Math.max(0, Number(basePrice) || 0);

    let adjustmentAmount = 0;
    let adjustmentType: 'discount' | 'fee' | 'none' = 'none';
    let adjustmentPercent = 0;

    if (safePrice > 0) {
      if ((methodConfig.discountPercent || 0) > 0) {
        adjustmentPercent = methodConfig.discountPercent || 0;
        adjustmentAmount = -Number(((safePrice * adjustmentPercent) / 100).toFixed(2));
        adjustmentType = 'discount';
      } else if ((methodConfig.feePercent || 0) > 0) {
        adjustmentPercent = methodConfig.feePercent || 0;
        adjustmentAmount = Number(((safePrice * adjustmentPercent) / 100).toFixed(2));
        adjustmentType = 'fee';
      }
    }

    const finalPrice = Math.max(0, Number((safePrice + adjustmentAmount).toFixed(2)));

    // Parcelamento (apenas para crédito)
    const safeInstallments = method === 'credito' ? Math.max(1, Math.min(installments || 1, methodConfig.maxInstallments || 12)) : 1;
    const installmentValue = safeInstallments > 0 ? Number((finalPrice / safeInstallments).toFixed(2)) : finalPrice;

    // Sinal de entrada (down payment)
    const downPercent = Math.max(0, Math.min(100, settings.downPaymentPercent || 50));
    const downPaymentAmount = Number(((finalPrice * downPercent) / 100).toFixed(2));
    const balanceAmount = Number((finalPrice - downPaymentAmount).toFixed(2));

    // Resumo textual
    let summaryText = '';
    if (method === 'pix') {
      summaryText = adjustmentPercent > 0 
        ? `Desconto Pix de ${adjustmentPercent}% aplicado (- R$ ${Math.abs(adjustmentAmount).toFixed(2)})`
        : 'Pagamento instantâneo via Pix';
    } else if (method === 'credito') {
      summaryText = safeInstallments > 1 
        ? `${safeInstallments}x de R$ ${installmentValue.toFixed(2)}`
        : '1x no Cartão de Crédito à vista';
    } else if (method === 'debito') {
      summaryText = 'Cartão de Débito à vista';
    } else if (method === 'dinheiro') {
      summaryText = adjustmentPercent > 0 
        ? `Desconto em dinheiro de ${adjustmentPercent}% (- R$ ${Math.abs(adjustmentAmount).toFixed(2)})`
        : 'Dinheiro em espécie no ato da entrega';
    }

    return {
      method,
      methodName: methodConfig.name,
      originalPrice: safePrice,
      adjustmentAmount,
      adjustmentType,
      adjustmentPercent,
      finalPrice,
      installments: safeInstallments,
      installmentValue,
      downPaymentPercent: downPercent,
      downPaymentAmount,
      balanceAmount,
      summaryText,
    };
  }

  /**
   * Retorna texto amigável com ícone para exibição rápida
   */
  static formatPaymentLabel(method: PaymentMethodType = 'pix', installments = 1): string {
    switch (method) {
      case 'pix':
        return 'Pix Instantâneo';
      case 'credito':
        return installments > 1 ? `Crédito (${installments}x)` : 'Crédito à vista';
      case 'debito':
        return 'Cartão de Débito';
      case 'dinheiro':
        return 'Dinheiro em Espécie';
      default:
        return 'Pix';
    }
  }
}
