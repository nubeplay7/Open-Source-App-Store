import React from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  Layers, 
  Key, 
  RefreshCw, 
  Lock, 
  FolderGit2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const EcosystemGuideView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-sans">
              Guía de Arquitectura del Ecosistema Android FOSS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conceptos clave sobre firmas de paquetes, protocolos de sincronización y métodos de instalación desatendida.
            </p>
          </div>
        </div>
      </div>

      {/* Guide Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module 1: Package Signing Paradigms */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Key className="w-4 h-4" />
            1. El Dilema de las Firmas APK
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            F-Droid Centralizado vs. Firma del Desarrollador
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Android exige que las actualizaciones de una app lleven la <strong>misma firma criptográfica</strong> que el APK instalado originalmente.
          </p>
          <ul className="text-xs text-slate-400 space-y-2">
            <li>
              <strong className="text-slate-200">F-Droid Oficial:</strong> Descarga el código fuente y lo compila en sus propios servidores firmando con la clave de F-Droid. Si instalas una app de F-Droid, no podrás actualizarla directamente desde GitHub sin desinstalarla primero.
            </li>
            <li>
              <strong className="text-slate-200">Obtainium & IzzyOnDroid & Accrescent:</strong> Utilizan las APKs firmadas con la clave privada del autor original. Permite interoperabilidad directa con releases de GitHub.
            </li>
          </ul>
        </div>

        {/* Module 2: Installation Methods & Shizuku */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            2. Instalación Desatendida sin Root
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            ¿Cómo actualizar en segundo plano sin pulsar "Aceptar"?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Históricamente se requería Root. Hoy en día existen métodos modernos limpios:
          </p>
          <ul className="text-xs text-slate-400 space-y-2">
            <li>
              <strong className="text-slate-200">Session Installer (Android 12+):</strong> Si la tienda fue la que instaló la app originalmente, Android le permite actualizarla en segundo plano sin pedir confirmación al usuario.
            </li>
            <li>
              <strong className="text-slate-200">Shizuku (ADB inalámbrico):</strong> Proporciona a apps como Droid-ify o Obtainium permisos de gestor de paquetes (PackageInstaller) a través del daemon ADB, permitiendo actualizaciones desatendidas incluso si la app fue instalada por otra fuente.
            </li>
          </ul>
        </div>

        {/* Module 3: F-Droid Index V2 Specification */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4" />
            3. Protocolo F-Droid Index V2
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            De descargas de 15MB de XML a sincronizaciones de 100KB
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            El formato clásico <code className="text-slate-300 bg-slate-950 px-1 rounded">index-v1.jar</code> obligaba al móvil a descargar y parsear un gigantesco archivo XML cada vez que se actualizaba la lista de apps.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Index V2</strong> divide los metadatos en fragmentos JSON diferenciales con firmas por separado. Clientes como <strong>Droid-ify</strong> y <strong>Neo Store</strong> solo descargan las diferencias, reduciendo el consumo de batería y datos en más del 85%.
          </p>
        </div>

        {/* Module 4: Split APKs & App Bundles */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            4. Split APKs y App Bundles (AAB)
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            Instalación de paquetes fragmentados por arquitectura
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Google Play distribuye apps en múltiples APKs independientes (<code className="text-slate-300 bg-slate-950 px-1 rounded">base.apk</code>, <code className="text-slate-300 bg-slate-950 px-1 rounded">split_config.arm64_v8a.apk</code>, etc.).
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Clientes como <strong>Aurora Store</strong>, <strong>Obtainium</strong> y <strong>App Manager</strong> integran soporte para reconstruir y enviar estos paquetes en una sola sesión atómica de instalación usando la API nativa de Android.
          </p>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Recomendaciones de Seguridad para Usuarios FOSS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 mt-3">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
            <strong className="text-slate-100 block mb-1">1. Activa Shizuku</strong>
            Configura Shizuku mediante depuración inalámbrica en Ajustes de desarrollador para permitir actualizaciones automáticas sin abrir prompts.
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
            <strong className="text-slate-100 block mb-1">2. Habilita IzzyOnDroid</strong>
            En Droid-ify o Neo Store, ve a Ajustes → Repositorios y activa el repositorio de IzzyOnDroid para acceder a 1.100+ apps adicionales.
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
            <strong className="text-slate-100 block mb-1">3. Monitorea con Exodus</strong>
            Usa la integración de Exodus Privacy de Aurora Store o Neo Store para comprobar qué librerías de analítica contienen las apps antes de instalarlas.
          </div>
        </div>
      </div>
    </div>
  );
};
