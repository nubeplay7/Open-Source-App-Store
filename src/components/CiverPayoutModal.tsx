import React, { useState } from 'react';
import { 
  Zap, 
  Building2, 
  CheckCircle2, 
  X, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  Wallet,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { lightningPaymentService, PayoutReceipt } from '../services/lightningPaymentService';

interface CiverPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsd: number;
  availableSats: number;
  onPayoutSuccess: (amountUsd: number, amountSats: number) => void;
}

export const CiverPayoutModal: React.FC<CiverPayoutModalProps> = ({
  isOpen,
  onClose,
  availableUsd,
  availableSats,
  onPayoutSuccess
}) => {
  const [method, setMethod] = useState<'LIGHTNING' | 'SPEI'>('LIGHTNING');
  const [withdrawAmountUsd, setWithdrawAmountUsd] = useState<number>(availableUsd);
  const [destination, setDestination] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PayoutReceipt | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const withdrawSats = lightningPaymentService.usdToSats(withdrawAmountUsd);
  const speiInfo = method === 'SPEI' ? lightningPaymentService.validateClabe(destination) : null;

  const handleSetPercent = (pct: number) => {
    const val = Number(((availableUsd * pct) / 100).toFixed(2));
    setWithdrawAmountUsd(val);
  };

  const handleCopyProof = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmountUsd <= 0 || withdrawAmountUsd > availableUsd) return;
    if (!destination.trim()) return;

    if (method === 'SPEI' && (!speiInfo?.valid || !beneficiaryName.trim())) {
      alert('Por favor introduce una CLABE interbancaria válida de 18 dígitos y el nombre del titular.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await lightningPaymentService.processPayout({
        id: `payout-${Date.now()}`,
        method: method === 'LIGHTNING' ? 'LIGHTNING_BOLT11' : 'SPEI_CLABE',
        amountUsd: withdrawAmountUsd,
        amountSats: withdrawSats,
        destination: destination.trim(),
        beneficiaryName: method === 'SPEI' ? beneficiaryName.trim() : undefined,
        concept: 'Liquidación Inmediata Civer Work Marketplace'
      });
      setReceipt(res);
      onPayoutSuccess(withdrawAmountUsd, withdrawSats);
    } catch (e) {
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-950/50">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Cobro de Recompensas y Regalías
              </h2>
              <p className="text-xs text-slate-400">
                Liquidación instantánea a tu billetera o cuenta bancaria
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          /* Recibo de Liquidación Exitosa */
          <div className="py-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">¡Liquidación Completada con Éxito!</h3>
              <p className="text-xs text-slate-400">
                Fondos enviados instantáneamente sin comisiones retenidas
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>ID Transacción</span>
                <span className="text-slate-200">{receipt.txId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Monto Liquidado</span>
                <span className="text-emerald-400 font-bold font-sans text-sm">
                  ${receipt.amountUsd.toFixed(2)} USD ({receipt.amountSats.toLocaleString()} sats)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Método</span>
                <span className="text-amber-400">{receipt.method}</span>
              </div>
              {receipt.proofOfPayment.preimage && (
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px]">Preimage Criptográfico (Prueba SHA-256)</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] break-all text-emerald-300 select-all">
                    {receipt.proofOfPayment.preimage}
                  </div>
                </div>
              )}
              {receipt.proofOfPayment.speiTrackingKey && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Clave de Rastreo Banxico</span>
                  <span className="text-cyan-300">{receipt.proofOfPayment.speiTrackingKey}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCopyProof(receipt.proofOfPayment.preimage || receipt.proofOfPayment.speiTrackingKey || receipt.txId)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? '¡Copiado!' : 'Copiar Comprobante'}</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-950/50"
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Retiro */
          <form onSubmit={handleExecutePayout} className="py-6 space-y-5">
            
            {/* Selector de Método */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setMethod('LIGHTNING')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition ${
                  method === 'LIGHTNING'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 fill-current text-amber-400" />
                <span>Lightning (Sats)</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('SPEI')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition ${
                  method === 'SPEI'
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>SPEI (Banco MX)</span>
              </button>
            </div>

            {/* Saldo y Selector de Monto */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Saldo Disponible en Billetera</span>
                <span className="text-emerald-400 font-bold">
                  ${availableUsd.toFixed(2)} USD ({availableSats.toLocaleString()} sats)
                </span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Monto a Retirar (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    max={availableUsd}
                    value={withdrawAmountUsd}
                    onChange={(e) => setWithdrawAmountUsd(Number(e.target.value))}
                    className="w-full pl-8 pr-28 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-400">
                    ≈ {withdrawSats.toLocaleString()} sats
                  </div>
                </div>
              </div>

              {/* Botones de Porcentaje */}
              <div className="flex gap-2">
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSetPercent(pct)}
                    className="flex-1 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-[11px] font-mono font-medium text-slate-300 transition"
                  >
                    {pct === 100 ? 'Todo' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos Específicos por Método */}
            {method === 'LIGHTNING' ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Factura Lightning BOLT11 / Dirección LNURL</span>
                  <span className="text-[10px] text-amber-400">Cero comisiones de red</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="lnbc2750u1p3... o usuario@stacker.news"
                  className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500">
                  Compatible con Wallet of Satoshi, Phoenix, Blink, Muun, Alby y nodos propios.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Nombre del Titular de la Cuenta</label>
                  <input
                    type="text"
                    required
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    placeholder="Nombre Completo tal como figura en el banco"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                    <span>CLABE Interbancaria (18 dígitos)</span>
                    {speiInfo?.bankName && (
                      <span className="text-[10px] text-emerald-400 font-bold">{speiInfo.bankName}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="012180001234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Garantía de Seguridad */}
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-300/90">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Liquidación garantizada con fondos custodiados en la tesorería soberana de Civer Cloud. Recibirás tu comprobante criptográfico al instante.
              </span>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isProcessing || withdrawAmountUsd <= 0 || withdrawAmountUsd > availableUsd || !destination.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Liquidando Transacción en Tiempo Real...</span>
                </>
              ) : (
                <>
                  <span>Retirar ${withdrawAmountUsd.toFixed(2)} USD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
