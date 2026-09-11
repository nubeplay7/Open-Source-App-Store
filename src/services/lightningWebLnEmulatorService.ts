/**
 * src/services/lightningWebLnEmulatorService.ts
 * Servicio Emulador de Pasarela Soberana Lightning Network (WebLN/BOLT11) & SPEI Banxico
 * Ecosistema Civer Work Marketplace & 0% Comisiones de Tienda
 */

import {
  LightningInvoiceRequest,
  LightningPaymentReceipt,
  SpeiTransferRequest,
  SpeiDisbursementReceipt
} from '../types';

export class SovereignPaymentGatewayService {
  /**
   * Genera un comprobante de pago Lightning con preimage SHA-256
   */
  public static async settleLightningInvoice(req: LightningInvoiceRequest): Promise<LightningPaymentReceipt> {
    const encoder = new TextEncoder();
    const entropy = `${Date.now()}-${req.amountSats}-${Math.random()}`;
    const preimageBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(`preimage-${entropy}`));
    const paymentHashBuffer = await crypto.subtle.digest('SHA-256', preimageBuffer);

    const preimage = Array.from(new Uint8Array(preimageBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const paymentHash = Array.from(new Uint8Array(paymentHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const bolt11Invoice = `lnbc${req.amountSats}u1p${paymentHash.substring(0, 32)}pp5${preimage.substring(0, 32)}`;
    
    // Calcular el 30% que cobraría una tienda tradicional (Google Play / App Store)
    const usdEquivalent = (req.amountSats / 100000000) * 65000; // Asumiendo $65k USD/BTC
    const savingsVsAppStoreUsd = Math.round(usdEquivalent * 0.30 * 100) / 100;

    return {
      paymentHash,
      preimage,
      bolt11Invoice,
      amountSats: req.amountSats,
      feeSats: 0, // Civer Store cobra 0% de comisión
      settledAt: new Date().toISOString(),
      savingsVsAppStoreUsd,
      status: 'SETTLED'
    };
  }

  /**
   * Valida la estructura y dígito verificador de una CLABE interbancaria de 18 dígitos
   */
  public static validateClabe(clabe: string): { isValid: boolean; bankName: string; error?: string } {
    const cleanClabe = clabe.trim().replace(/\s+/g, '');
    if (!/^\d{18}$/.test(cleanClabe)) {
      return { isValid: false, bankName: 'Desconocido', error: 'La CLABE debe contener exactamente 18 dígitos numéricos.' };
    }

    const bankCodes: Record<string, string> = {
      '012': 'BBVA México',
      '002': 'Banamex (Citibanamex)',
      '014': 'Santander México',
      '021': 'HSBC México',
      '072': 'Banorte',
      '127': 'Banco Azteca',
      '137': 'Bancoppel',
      '638': 'Nu México (Financiera Nu)',
      '646': 'STP (Sistema de Transferencias y Pagos)',
      '659': 'Oxxo (Financiera Spin)'
    };

    const bankCode = cleanClabe.substring(0, 3);
    const bankName = bankCodes[bankCode] || `Institución Bancaria (${bankCode})`;

    // Algoritmo de ponderación Banxico: factores 3, 7, 1 repetidos
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += (parseInt(cleanClabe[i], 10) * weights[i]) % 10;
    }
    const computedCheckDigit = (10 - (sum % 10)) % 10;
    const providedCheckDigit = parseInt(cleanClabe[17], 10);

    const isValid = computedCheckDigit === providedCheckDigit;
    return {
      isValid,
      bankName,
      error: isValid ? undefined : `Dígito verificador inválido: esperado ${computedCheckDigit}, recibido ${providedCheckDigit}.`
    };
  }

  /**
   * Dispersa una transferencia electrónica instantánea vía SPEI Banxico
   */
  public static disburseSpeiPayment(req: SpeiTransferRequest): SpeiDisbursementReceipt {
    const clabeCheck = this.validateClabe(req.clabe18Digits);
    const trackingFolio = `BNX${Date.now().toString().substring(4)}${Math.floor(Math.random() * 8999 + 1000)}`;
    const masked = `${req.clabe18Digits.substring(0, 4)}••••••••${req.clabe18Digits.substring(14)}`;

    return {
      trackingFolioBanxico: trackingFolio,
      destinationBank: clabeCheck.bankName,
      clabeMasked: masked,
      amountMxn: req.amountMxn,
      feeMxn: 0.00, // Cero comisiones de intermediación
      disbursedAt: new Date().toISOString(),
      cepUrl: `https://www.banxico.org.mx/cep/#/consulta?folio=${trackingFolio}`,
      status: clabeCheck.isValid ? 'DISBURSED_SETTLED' : 'REJECTED'
    };
  }
}
