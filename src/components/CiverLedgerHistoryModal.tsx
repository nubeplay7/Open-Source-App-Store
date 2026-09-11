import React, { useState, useEffect } from 'react';
import { 
  History, 
  X, 
  Zap, 
  Building2, 
  Copy, 
  CheckCircle2, 
  ExternalLink,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { lightningPaymentService, PayoutReceipt } from '../services/lightningPaymentService';

interface CiverLedgerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CiverLedgerHistoryModal: React.FC<CiverLedgerHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [history, setHistory] = useState<PayoutReceipt[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(lightningPaymentService.getPayoutHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950/50">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Libro Mayor de Liquidaciones (Ledger Soberano)
              </h2>
              <p className="text-xs text-slate-400">
                Historial inmutable de pagos en Satoshis (Lightning) y transferencias SPEI Banxico
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

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No hay liquidaciones registradas en este dispositivo.</p>
              <p className="text-xs text-slate-500">Completa una misión de testing o cobra tus regalías para generar tu primer comprobante.</p>
            </div>
          ) : (
            history.map((tx) => (
              <div 
                key={tx.txId}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {tx.method === 'LIGHTNING_BOLT11' || tx.method === 'WEBLN' ? (
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{tx.memo}</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.timestamp).toLocaleString()} • ID: {tx.txId}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      +${tx.amountUsd.toFixed(2)} USD
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      ({tx.amountSats.toLocaleString()} sats)
                    </div>
                  </div>
                </div>

                {/* Proof & Details */}
                <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                  <div className="truncate max-w-sm">
                    Destino: <span className="text-slate-300">{tx.destination.substring(0, 32)}...</span>
                  </div>
                  <button
                    onClick={() => handleCopy(tx.proofOfPayment.preimage || tx.proofOfPayment.speiTrackingKey || tx.txId, tx.txId)}
                    className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedId === tx.txId ? '¡Copiado!' : 'Copiar Prueba'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verificación Criptográfica Local (IndexedDB / LocalStorage)</span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
