/**
 * src/services/lightningPaymentService.ts
 * Motor de Liquidación Criptográfica y Pagos Inmediatos (Lightning Network + SPEI)
 * Civer Work Marketplace ("Tu trabajo en línea que sí paga")
 */

export interface PayoutRequest {
  id: string;
  method: 'LIGHTNING_BOLT11' | 'SPEI_CLABE' | 'WEBLN';
  amountUsd: number;
  amountSats: number;
  destination: string; // Factura BOLT11, LNURL o CLABE de 18 dígitos
  beneficiaryName?: string;
  concept: string;
}

export interface PayoutReceipt {
  txId: string;
  timestamp: string;
  method: 'LIGHTNING_BOLT11' | 'SPEI_CLABE' | 'WEBLN';
  amountUsd: number;
  amountSats: number;
  feeSats: number;
  destination: string;
  status: 'SETTLED' | 'PENDING' | 'FAILED';
  proofOfPayment: {
    preimage?: string; // Preimage criptográfico SHA-256 para Lightning
    speiTrackingKey?: string; // Clave de rastreo Banxico para SPEI
    routingNode?: string;
  };
  memo: string;
}

const STORAGE_KEY = 'civer_lightning_ledger_v1';
const SATS_PER_USD = 1550; // Tasa de cambio de referencia

export const lightningPaymentService = {
  getExchangeRate(): number {
    return SATS_PER_USD;
  },

  usdToSats(usd: number): number {
    return Math.round(usd * SATS_PER_USD);
  },

  satsToUsd(sats: number): number {
    return Number((sats / SATS_PER_USD).toFixed(2));
  },

  validateClabe(clabe: string): { valid: boolean; bankName?: string } {
    const clean = clabe.replace(/\s+/g, '');
    if (!/^\d{18}$/.test(clean)) {
      return { valid: false };
    }
    const bankCode = clean.substring(0, 3);
    const bankMap: Record<string, string> = {
      '012': 'BBVA México',
      '002': 'Citibanamex',
      '014': 'Santander',
      '021': 'HSBC',
      '044': 'Scotiabank',
      '058': 'Banregio',
      '072': 'Banorte',
      '127': 'Azteca',
      '638': 'Nu México',
      '684': 'Mercado Pago Wallet',
      '677': 'Albo',
      '646': 'STP (Sistema de Transferencias y Pagos)'
    };
    return {
      valid: true,
      bankName: bankMap[bankCode] || 'Institución Financiera Registrada'
    };
  },

  async processPayout(req: PayoutRequest): Promise<PayoutReceipt> {
    // Simulación de liquidación criptográfica o bancaria en tiempo real (800ms)
    await new Promise(resolve => setTimeout(resolve, 800));

    const isLightning = req.method === 'LIGHTNING_BOLT11' || req.method === 'WEBLN';
    const txId = `tx-civer-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const receipt: PayoutReceipt = {
      txId,
      timestamp: new Date().toISOString(),
      method: req.method,
      amountUsd: req.amountUsd,
      amountSats: req.amountSats,
      feeSats: 0, // Cero comisiones al trabajador (absorbido por Civer Cloud)
      destination: req.destination,
      status: 'SETTLED',
      proofOfPayment: isLightning ? {
        preimage: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        routingNode: '023c0b11c385b23d94182ec5a8b7df945281439268f766e4a300a2d5ff0fbf7f4f@bene.civer.cloud'
      } : {
        speiTrackingKey: `SPEI${Date.now()}BANXICO`,
        routingNode: 'BANXICO-STP-PROD-GATEWAY'
      },
      memo: req.concept || 'Liquidación de Misión Civer Work'
    };

    // Persistir en LocalStorage
    try {
      const history = this.getPayoutHistory();
      history.unshift(receipt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
    } catch (e) {
      console.warn('No se pudo persistir el recibo en localStorage', e);
    }

    return receipt;
  },

  getPayoutHistory(): PayoutReceipt[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
};
