import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  HardDrive,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Download,
  Share2,
  ShieldCheck,
  Sparkles,
  QrCode,
  Key,
  Layers,
  X,
  ArrowRight,
  Clock,
  Radio
} from 'lucide-react';
import { ConnectedDevice, DeviceType, CrossDeviceSyncState, AppCatalogItem, UserProfile } from '../types';
import { deviceFleetSyncService } from '../services/deviceFleetSyncService';
import { APPS_CATALOG } from '../data/appsCatalogData';

interface CrossDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddToast?: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
  onOpenAppDetail?: (app: AppCatalogItem) => void;
}

export const CrossDeviceSyncModal: React.FC<CrossDeviceSyncModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onAddToast,
  onOpenAppDetail
}) => {
  const [syncState, setSyncState] = useState<CrossDeviceSyncState>(deviceFleetSyncService.getState());
  const [activeTab, setActiveTab] = useState<'DEVICES' | 'REMOTE_INSTALL' | 'SETTINGS' | 'PAIR_NEW'>('DEVICES');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('dev-pixel9-pro');
  const [syncProgressMessage, setSyncProgressMessage] = useState<string | null>(null);
  const [selectedAppForRemote, setSelectedAppForRemote] = useState<AppCatalogItem>(APPS_CATALOG[0]);
  const [targetDeviceForInstall, setTargetDeviceForInstall] = useState<string>('dev-galaxy-tab-s9');

  // Pair new device inputs
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('PHONE');

  useEffect(() => {
    const unsub = deviceFleetSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleTriggerFullSync = async () => {
    try {
      await deviceFleetSyncService.performFullSync(userProfile, (step) => {
        setSyncProgressMessage(step);
      });
      setSyncProgressMessage(null);
      if (onAddToast) {
        onAddToast({
          title: 'Sincronización Multidispositivo Completa',
          description: `Se han sincronizado ${syncState.activeFleet.length} dispositivos mediante Civer ID y token seguro.`,
          type: 'success'
        });
      }
    } catch (err) {
      setSyncProgressMessage(null);
      if (onAddToast) {
        onAddToast({
          title: 'Error de sincronización',
          description: 'No se pudo contactar a la flota de dispositivos.',
          type: 'error'
        });
      }
    }
  };

  const handleRemotePushInstall = () => {
    if (!selectedAppForRemote || !targetDeviceForInstall) return;
    const targetDev = syncState.activeFleet.find((d) => d.id === targetDeviceForInstall);

    deviceFleetSyncService.triggerRemoteInstall(targetDeviceForInstall, selectedAppForRemote, (status) => {
      if (status.status === 'INSTALLED') {
        if (onAddToast) {
          onAddToast({
            title: `Instalación remota completada`,
            description: `${selectedAppForRemote.name} se instaló correctamente en ${targetDev?.name}.`,
            type: 'success'
          });
        }
      }
    });

    if (onAddToast) {
      onAddToast({
        title: 'Orden de instalación remota enviada',
        description: `Enviando ${selectedAppForRemote.name} a "${targetDev?.name}" (estilo Google Play Store).`,
        type: 'info'
      });
    }
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const dev = deviceFleetSyncService.pairNewDevice(
      newDeviceName.trim(),
      `${newDeviceName.trim()} (${newDeviceType})`,
      newDeviceType
    );

    setNewDeviceName('');
    setActiveTab('DEVICES');
    setSelectedDeviceId(dev.id);

    if (onAddToast) {
      onAddToast({
        title: 'Nuevo Dispositivo Vinculado',
        description: `"${dev.name}" se sincronizó exitosamente con tu cuenta ${userProfile.email}.`,
        type: 'success'
      });
    }
  };

  const handleUnlink = (deviceId: string, devName: string) => {
    if (confirm(`¿Estás seguro de desvincular el dispositivo "${devName}"? Dejará de recibir actualizaciones y sincronizaciones automáticas.`)) {
      deviceFleetSyncService.unlinkDevice(deviceId);
      if (onAddToast) {
        onAddToast({
          title: 'Dispositivo desvinculado',
          description: `Se removió "${devName}" de tu flota de dispositivos conectados.`,
          type: 'info'
        });
      }
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'PHONE':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'TABLET':
        return <Tablet className="w-5 h-5 text-purple-400" />;
      case 'DESKTOP':
        return <Laptop className="w-5 h-5 text-blue-400" />;
      case 'TV':
        return <Tv className="w-5 h-5 text-amber-400" />;
      default:
        return <Smartphone className="w-5 h-5 text-slate-400" />;
    }
  };

  const selectedDevice = syncState.activeFleet.find((d) => d.id === selectedDeviceId) || syncState.activeFleet[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950">
              <RefreshCw className={`w-6 h-6 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Sincronización Multidispositivo</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  Google Play & App Store Style
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestiona y sincroniza todos tus teléfonos, tablets, PCs y TVs vinculados a <span className="text-emerald-400 font-semibold">{userProfile.email}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerFullSync}
              disabled={syncState.isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-950"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncState.isSyncing ? 'Sincronizando...' : 'Sincronizar Todo Ahora'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync banner if in progress */}
        {syncProgressMessage && (
          <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
            <Radio className="w-4 h-4 animate-ping" />
            <span>{syncProgressMessage}</span>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DEVICES')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'DEVICES'
                ? 'border-emerald-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Dispositivos Conectados ({syncState.activeFleet.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REMOTE_INSTALL')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'REMOTE_INSTALL'
                ? 'border-emerald-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Instalar en Otros Dispositivos</span>
          </button>
          <button
            onClick={() => setActiveTab('PAIR_NEW')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'PAIR_NEW'
                ? 'border-emerald-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Vincular Nuevo Dispositivo</span>
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
              activeTab === 'SETTINGS'
                ? 'border-emerald-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Ajustes de Sincronización</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CONNECTED DEVICES */}
          {activeTab === 'DEVICES' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Device Cards List */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>DISPOSITIVOS CON TU CUENTA</span>
                  <span className="font-mono text-emerald-400">{syncState.activeFleet.filter((d) => d.isOnline).length} EN LÍNEA</span>
                </div>

                <div className="space-y-2">
                  {syncState.activeFleet.map((dev) => {
                    const isSelected = dev.id === selectedDeviceId;
                    return (
                      <div
                        key={dev.id}
                        onClick={() => setSelectedDeviceId(dev.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-950/40'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              {getDeviceIcon(dev.deviceType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-white">{dev.name}</h4>
                                {dev.isCurrentDevice && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-600">
                                    Este Dispositivo
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono">{dev.model}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {dev.isOnline ? (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Online
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                                Inactivo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                          <div className="flex items-center gap-1">
                            {dev.isCharging ? (
                              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Battery className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>{dev.batteryPercent}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{dev.storageAvailableGb.toFixed(0)} GB Libres</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end text-emerald-400">
                            <span>{dev.installedAppIds.length} Apps FOSS</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Device Detail & Actions */}
              {selectedDevice && (
                <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                          {getDeviceIcon(selectedDevice.deviceType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{selectedDevice.name}</h3>
                            {selectedDevice.isCurrentDevice && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                Dispositivo Local
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{selectedDevice.osVersion}</p>
                        </div>
                      </div>
                      {!selectedDevice.isCurrentDevice && (
                        <button
                          onClick={() => handleUnlink(selectedDevice.id, selectedDevice.name)}
                          className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition border border-rose-900/50 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Desvincular</span>
                        </button>
                      )}
                    </div>

                    {/* Telemetry Detail Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Batería</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm font-bold text-white">{selectedDevice.batteryPercent}%</span>
                          {selectedDevice.isCharging && <span className="text-[10px] text-emerald-400 font-mono">(Cargando)</span>}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Almacenamiento</span>
                        <p className="text-sm font-bold text-white mt-1">
                          {selectedDevice.storageAvailableGb.toFixed(0)} / {selectedDevice.storageTotalGb} GB
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Última Sincronización</span>
                        <p className="text-xs font-bold text-slate-300 mt-1 font-mono">
                          {new Date(selectedDevice.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Estado P2P</span>
                        <p className="text-xs font-bold text-emerald-400 mt-1">Soberano Civer ID</p>
                      </div>
                    </div>

                    {/* Installed Apps on this device */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span>APLICACIONES INSTALADAS EN ESTE DISPOSITIVO</span>
                        <span className="text-slate-400 font-mono">{selectedDevice.installedAppIds.length} apps</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                        {selectedDevice.installedAppIds.map((appId) => {
                          const appItem = APPS_CATALOG.find((a: AppCatalogItem) => a.id === appId);
                          return (
                            <div
                              key={appId}
                              onClick={() => appItem && onOpenAppDetail && onOpenAppDetail(appItem)}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2 cursor-pointer transition"
                            >
                              <div className={`w-7 h-7 rounded-md ${appItem?.iconBg || 'bg-slate-800'} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                                {appItem?.name.charAt(0) || 'A'}
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold text-white truncate">{appItem?.name || appId}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{appItem?.version || 'v1.0'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pending Remote Installs if any */}
                    {selectedDevice.pendingRemoteInstalls.length > 0 && (
                      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          Cola de Instalación Remota en Curso
                        </span>
                        {selectedDevice.pendingRemoteInstalls.map((item) => (
                          <div key={item.appId} className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <span>{item.appName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900 text-cyan-300 border border-cyan-700">
                              {item.status} ({item.progressPercent}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Remote action bar */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Token de Flota: {syncState.syncToken.substring(0, 18)}...
                    </span>
                    <button
                      onClick={() => {
                        setTargetDeviceForInstall(selectedDevice.id);
                        setActiveTab('REMOTE_INSTALL');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Instalar app en este dispositivo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REMOTE INSTALL (GOOGLE PLAY STYLE) */}
          {activeTab === 'REMOTE_INSTALL' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3">
                <Download className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Instalar en más dispositivos (Estilo Google Play Store)</h4>
                  <p className="text-xs text-cyan-200/90 mt-1 leading-relaxed">
                    Al igual que en la Google Play Store y App Store, puedes enviar cualquier aplicación de tu catálogo para que se descargue e instale silenciosamente en tu Tablet, Smart TV o Laptop secundaria vinculada a tu cuenta Civer ID.
                  </p>
                </div>
              </div>

              {/* Step 1: Select Target Device */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">1. SELECCIONA EL DISPOSITIVO DE DESTINO</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {syncState.activeFleet.map((dev) => (
                    <div
                      key={dev.id}
                      onClick={() => setTargetDeviceForInstall(dev.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        targetDeviceForInstall === dev.id
                          ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        {getDeviceIcon(dev.deviceType)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{dev.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{dev.storageAvailableGb.toFixed(0)} GB Libres</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Application to Push */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">2. SELECCIONA LA APLICACIÓN A ENVIAR</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {APPS_CATALOG.slice(0, 10).map((app: AppCatalogItem) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppForRemote(app)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        selectedAppForRemote.id === app.id
                          ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-950/40'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg ${app.iconBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {app.name.charAt(0)}
                      </div>
                      <div className="flex-1 truncate">
                        <h5 className="text-xs font-bold text-white truncate">{app.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{app.packageName} • {app.version}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">{app.apkSizeMb} MB</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Action */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">
                    Enviar {selectedAppForRemote.name} ({selectedAppForRemote.version})
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Destino: {syncState.activeFleet.find((d) => d.id === targetDeviceForInstall)?.name}
                  </p>
                </div>
                <button
                  onClick={handleRemotePushInstall}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-950"
                >
                  <Download className="w-4 h-4" />
                  <span>Enviar e Instalar Remotamente</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PAIR NEW DEVICE */}
          {activeTab === 'PAIR_NEW' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-600/70 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Vincular un Nuevo Dispositivo</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Escanea el código QR desde tu otro dispositivo o introduce el nombre para agregarlo a tu flota y sincronizar todas tus apps automáticamente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 items-center">
                {/* QR Code Demo Box */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner text-slate-900">
                  <QrCode className="w-36 h-36" />
                  <p className="text-[10px] font-mono font-bold mt-2 text-slate-700 uppercase">CIVER-PAIR: {syncState.syncToken.substring(0, 12)}</p>
                </div>

                {/* Form */}
                <form onSubmit={handlePairSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Dispositivo</label>
                    <input
                      type="text"
                      placeholder="Ej. Galaxy Fold 6, Steam Deck OLED"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Dispositivo</label>
                    <select
                      value={newDeviceType}
                      onChange={(e) => setNewDeviceType(e.target.value as DeviceType)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="PHONE">Teléfono (Smartphone Android / LineageOS)</option>
                      <option value="TABLET">Tablet (Android / iPadOS / E-ink)</option>
                      <option value="DESKTOP">Computadora (Linux / macOS / Windows)</option>
                      <option value="TV">Smart TV (Android TV / Google TV)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Confirmar Vinculación</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: SYNC SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">PREFERENCIAS DE SINCRONIZACIÓN EN LA NUBE</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-white">Sincronizar Aplicaciones Instaladas</p>
                      <p className="text-[11px] text-slate-400">Mantener sincronizado el catálogo y versiones entre todos tus equipos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncState.preferences.syncInstalledApps}
                      onChange={(e) => deviceFleetSyncService.updatePreferences({ syncInstalledApps: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-white">Sincronizar Lista de Deseos (Wishlist)</p>
                      <p className="text-[11px] text-slate-400">Apps marcadas con estrella disponibles en todos tus dispositivos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncState.preferences.syncWishlist}
                      onChange={(e) => deviceFleetSyncService.updatePreferences({ syncWishlist: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-white">Sincronizar Repositorios Personalizados F-Droid</p>
                      <p className="text-[11px] text-slate-400">URLs y llaves de repositorios FOSS agregados manualmente</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncState.preferences.syncCustomRepos}
                      onChange={(e) => deviceFleetSyncService.updatePreferences({ syncCustomRepos: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-white">Sincronizar Puntos Civer & Insignias</p>
                      <p className="text-[11px] text-slate-400">Nivel de reputación, Play Points FOSS y claves de firma Ed25519</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncState.preferences.syncPlayPoints}
                      onChange={(e) => deviceFleetSyncService.updatePreferences({ syncPlayPoints: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Flota protegida con cifrado local Ed25519 de extremo a extremo sin telemetría externa.</span>
          </div>
          <span className="font-mono text-slate-500">{syncState.activeFleet.length} dispositivos enlazados</span>
        </div>
      </div>
    </div>
  );
};
