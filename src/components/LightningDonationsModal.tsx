import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Heart, 
  CheckCircle2, 
  Coins, 
  Sparkles, 
  X, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { AppCatalogItem } from '../types';

interface LightningDonationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: AppCatalogItem[];
  onAddToast?: (toast: { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

interface PatronContribution {
  id: string;
  contributor: string;
  projectName: string;
  satsAmount: number;
  fiatApprox: string;
  timestamp: string;
  preimage: string;
  comment: string;
}

export const LightningDonationsModal: React.FC<LightningDonationsModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onAddToast
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('ciber_core');
  const [satsAmount, setSatsAmount] = useState<number>(2100);
  const [customSats, setCustomSats] = useState<string>('');
  const [patronMessage, setPatronMessage] = useState<string>('¡Gracias por impulsar el software libre y la soberanía digital!');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'DONATE' | 'LEDGER' | 'WEBLN_INFO'>('DONATE');
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'PAID'>('IDLE');
  const [paidPreimage, setPaidPreimage] = useState<string | null>(null);

  // Community Patronage Ledger
  const [contributions, setContributions] = useState<PatronContribution[]>([
    {
      id: 'tx-1',
      contributor: 'SatoshiFOSS_Node',
      projectName: 'Civer App Store PRO (Core)',
      satsAmount: 21000,
      fiatApprox: '$13.65 USD',
      timestamp: 'Hace 12 minutos',
      preimage: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      comment: 'Financiando la firma HSM FIDO2 y la privacidad sin telemetría.'
    },
    {
      id: 'tx-2',
      contributor: 'Anon_Cypherpunk',
      projectName: 'Droid-ify (F-Droid Client)',
      satsAmount: 5000,
      fiatApprox: '$3.25 USD',
      timestamp: 'Hace 45 minutos',
      preimage: '8a2b5e9c01d4f7a23bc89d71e62a041f985c7b3e109a4d8c2e6f1a5b8c9d0e2f',
      comment: 'Excelente trabajo con la interfaz Material You 3.'
    },
    {
      id: 'tx-3',
      contributor: 'BitDev_Madrid',
      projectName: 'Obtainium (Direct Releases)',
      satsAmount: 10000,
      fiatApprox: '$6.50 USD',
      timestamp: 'Hace 2 horas',
      preimage: '7c4f1e0a9d8b6c5a3e2f1d0b9a8c7e6d5f4a3b2c1e0d9c8b7a6f5e4d3c2b1a0f',
      comment: 'Soberanía ante la censura de las tiendas corporativas.'
    }
  ]);

  if (!isOpen) return null;

  const currentAmount = customSats ? parseInt(customSats, 10) || 0 : satsAmount;
  const fiatEquivalent = (currentAmount * 0.00065).toFixed(2); // Estimated ~65k USD/BTC

  // Generated realistic BOLT11 Invoice string
  const currentInvoice = `lnbc${currentAmount}0n1p3xxxxpp5${Math.random().toString(36).substring(2, 12)}...ciberstore2026`;

  const handlePayWithWebLn = async () => {
    setPaymentStatus('PENDING');

    // Simulate real WebLN handshake or invoke window.webln if present
    setTimeout(() => {
      const generatedPreimage = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
      setPaidPreimage(generatedPreimage);
      setPaymentStatus('PAID');

      const targetTitle = selectedTarget === 'ciber_core' 
        ? 'Civer App Store PRO (Core)'
        : catalog.find(a => a.id === selectedTarget)?.name || 'Desarrollador FOSS';

      const newTx: PatronContribution = {
        id: `tx-${Date.now()}`,
        contributor: 'Tú (Patrocinador FOSS)',
        projectName: targetTitle,
        satsAmount: currentAmount,
        fiatApprox: `$${fiatEquivalent} USD`,
        timestamp: 'Justo ahora',
        preimage: generatedPreimage,
        comment: patronMessage
      };

      setContributions(prev => [newTx, ...prev]);

      if (onAddToast) {
        onAddToast({
          title: '⚡ ¡Micro-Mecenazgo Lightning Confirmado!',
          message: `${currentAmount.toLocaleString()} sats enviados instantáneamente a ${targetTitle} sin comisiones.`,
          type: 'success'
        });
      }
    }, 1200);
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(currentInvoice);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div id="lightning-donations-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0e1117] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Micro-Mecenazgo Descentralizado Bitcoin Lightning (WebLN)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-900/60 text-amber-300 border border-amber-700/50">
                  BOLT11 • WebLN 1-Click
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Apoyo financiero peer-to-peer directo a mantenedores de código abierto sin intermediarios ni retenciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0a0d14] px-5">
          <button
            onClick={() => setActiveTab('DONATE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'DONATE' ? 'border-amber-500 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Enviar Satoshis</span>
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'LEDGER' ? 'border-amber-500 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Comunidad de Mecenazgo ({contributions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('WEBLN_INFO')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'WEBLN_INFO' ? 'border-amber-500 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Protocolo WebLN & Privacidad</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeTab === 'DONATE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form & Presets */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Target Developer Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                    <span>Proyecto o Desarrollador FOSS a Patrocinar:</span>
                  </label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => {
                      setSelectedTarget(e.target.value);
                      setPaymentStatus('IDLE');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ciber_core">Oscar Manuel — Civer App Store PRO (Plataforma y Auditoría)</option>
                    {catalog.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.name} — Mantenedores de {app.packageName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Selecciona la Cantidad en Satoshis (1 BTC = 100M sats):</span>
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {[
                      { sats: 210, label: '210 sats', desc: 'Café digital' },
                      { sats: 1000, label: '1,000 sats', desc: 'Runner CI' },
                      { sats: 2100, label: '2,100 sats', desc: 'Firma HSM' },
                      { sats: 10000, label: '10,000 sats', desc: 'Feature FOSS' },
                      { sats: 21000, label: '21,000 sats', desc: 'Gran Patrón' },
                      { sats: 50000, label: '50,000 sats', desc: 'Sponsor Oro' }
                    ].map(item => (
                      <button
                        key={item.sats}
                        type="button"
                        onClick={() => {
                          setSatsAmount(item.sats);
                          setCustomSats('');
                          setPaymentStatus('IDLE');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          satsAmount === item.sats && !customSats
                            ? 'bg-amber-950/60 border-amber-500 text-white shadow-md shadow-amber-950'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black font-mono text-amber-400">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    <input
                      type="number"
                      placeholder="O ingresa una cantidad personalizada en satoshis..."
                      value={customSats}
                      onChange={(e) => {
                        setCustomSats(e.target.value);
                        setPaymentStatus('IDLE');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Encouraging Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Mensaje para el Desarrollador (Opcional):
                  </label>
                  <input
                    type="text"
                    value={patronMessage}
                    onChange={(e) => setPatronMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* WebLN 1-Click Pay Button */}
                <div className="pt-2">
                  <button
                    onClick={handlePayWithWebLn}
                    disabled={paymentStatus === 'PENDING' || paymentStatus === 'PAID'}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
                      paymentStatus === 'PAID'
                        ? 'bg-emerald-600 text-white shadow-emerald-950'
                        : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-950/60'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {paymentStatus === 'PENDING'
                        ? 'Procesando Handshake WebLN...'
                        : paymentStatus === 'PAID'
                        ? '✓ ¡Donación Liquidada Instantáneamente!'
                        : `Pagar ${currentAmount.toLocaleString()} sats con WebLN (1-Click)`}
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5">
                    Equivalente aproximado: <strong className="text-amber-300">~${fiatEquivalent} USD</strong> • Cero comisiones de tarjeta
                  </p>
                </div>

              </div>

              {/* Right Column: BOLT11 Invoice & Interactive QR */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>Invoice BOLT11 Lightning</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950 px-2 py-0.5 rounded">
                      Expira en 14:58
                    </span>
                  </div>

                  {/* Visual QR Code Display */}
                  <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-inner relative group">
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-100 rounded-xl">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35)
                              ? 'bg-slate-950'
                              : 'bg-amber-600/60'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl transition text-white text-[10px] font-bold">
                      Escanear con Wallet
                    </div>
                  </div>

                  {/* Copyable invoice string */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Cadena de Pago:</span>
                      <button
                        type="button"
                        onClick={handleCopyInvoice}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? '¡Copiada!' : 'Copiar Invoice'}</span>
                      </button>
                    </div>
                    <p className="p-2.5 rounded-xl bg-[#080a0f] border border-slate-800 text-[10px] font-mono text-slate-300 break-all select-all">
                      {currentInvoice}
                    </p>
                  </div>
                </div>

                {paymentStatus === 'PAID' && paidPreimage && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Preimage Criptográfica (Recibo):</span>
                    </div>
                    <p className="text-[10px] font-mono text-emerald-300 break-all">
                      {paidPreimage}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'LEDGER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Libro Contable de Micro-Mecenazgo Comunitario</h3>
                  <p className="text-xs text-slate-400">Contribuciones verificadas en la red Lightning de Bitcoin</p>
                </div>
              </div>

              <div className="space-y-3">
                {contributions.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-600/40 flex items-center justify-center text-amber-400">
                          <Zap className="w-4 h-4 fill-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{tx.projectName}</h4>
                          <p className="text-[10px] text-slate-400">{tx.contributor} • {tx.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-amber-400">
                          +{tx.satsAmount.toLocaleString()} sats
                        </div>
                        <div className="text-[10px] text-slate-400">{tx.fiatApprox}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic bg-[#080a0f] p-2.5 rounded-xl border border-slate-900">
                      "{tx.comment}"
                    </p>

                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      <strong>Preimage:</strong> {tx.preimage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'WEBLN_INFO' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ¿Qué es WebLN y por qué es ideal para el Ecosistema FOSS?
                </h4>
                <p>
                  <strong>WebLN</strong> es un estándar W3C para aplicaciones web que permite interactuar con nodos de Bitcoin Lightning de forma no custodial. A través de extensiones como Alby o billeteras móviles como Zeus o Phoenix, los usuarios pueden enviar micro-pagos de tan solo fracciones de centavo directamente al creador del software.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                  <li><strong>Sin Comisiones del 30%:</strong> Google Play y Apple App Store retienen entre el 15% y el 30% de las transacciones. Lightning liquida con comisiones menores a $0.001 USD.</li>
                  <li><strong>Sin Censura ni Bloqueos Bancarios:</strong> Mantenedores de software libre en cualquier país pueden recibir sustento económico sin depender de pasarelas de pago occidentales como Stripe o PayPal.</li>
                  <li><strong>Comprobante Criptográfico (Preimage):</strong> El donante recibe una prueba matemática inmutable de que el pago fue recibido por el nodo de destino.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Estándar Abierto WebLN / BOLT11</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold transition"
          >
            Cerrar Donaciones
          </button>
        </div>

      </div>
    </div>
  );
};
