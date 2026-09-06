import { UserAppReview } from '../types';

export const INITIAL_REVIEWS: UserAppReview[] = [
  {
    id: 'rev-001',
    appId: 'droid-ify',
    author: 'Carlos Mendoza',
    avatarLetter: 'C',
    rating: 5,
    date: '28 de agosto de 2026',
    title: 'La mejor tienda F-Droid con diseño Material You fluido',
    content: 'Increíble rendimiento y consumo de memoria bajísimo en mi Pixel 8. La sincronización de índices V2 es instantánea y el soporte para Shizuku hace que las actualizaciones sean totalmente automáticas sin tocar nada.',
    helpfulCount: 42,
    deviceInfo: 'Google Pixel 8 Pro • Android 15',
    versionReviewed: 'v0.6.1'
  },
  {
    id: 'rev-002',
    appId: 'droid-ify',
    author: 'Lucía Fernández',
    avatarLetter: 'L',
    rating: 5,
    date: '20 de agosto de 2026',
    title: 'Imprescindible para alejarse de los servicios privativos',
    content: 'La interfaz es hermosa y muy parecida a la Play Store pero sin rastreadores. Excelente catálogo de repositorios predeterminados y cero consumo de batería en segundo plano.',
    helpfulCount: 19,
    deviceInfo: 'Xiaomi 14 Ultra • HyperOS',
    versionReviewed: 'v0.6.1'
  },
  {
    id: 'rev-003',
    appId: 'aurora-store',
    author: 'Javier Domínguez',
    avatarLetter: 'J',
    rating: 5,
    date: '25 de agosto de 2026',
    title: 'Acceso total al catálogo de Play Store de forma anónima',
    content: 'La función de cuentas anónimas y la compatibilidad con el instalador de sesiones de Android 14+ funcionan de maravilla. Gran herramienta para quienes no quieren registrar su cuenta de Google en ROMs desgoogleadas.',
    helpfulCount: 38,
    deviceInfo: 'Samsung Galaxy S24 Ultra',
    versionReviewed: 'v4.4.2'
  },
  {
    id: 'rev-004',
    appId: 'obtainium',
    author: 'Mateo Rivas',
    avatarLetter: 'M',
    rating: 5,
    date: '15 de agosto de 2026',
    title: 'El Santo Grial de las actualizaciones directas de GitHub',
    content: 'Descarga las APKs directamente de las Releases de GitHub o GitLab sin intermediarios ni demoras de aprobación. Es la app que siempre soñé tener en Android.',
    helpfulCount: 56,
    deviceInfo: 'OnePlus 12 • Android 14',
    versionReviewed: 'v1.1.22'
  },
  {
    id: 'rev-005',
    appId: 'vlc-android',
    author: 'Sofía Navarro',
    avatarLetter: 'S',
    rating: 5,
    date: '12 de agosto de 2026',
    title: 'Reproduce cualquier códec de audio y video sin publicidad',
    content: 'Llevo años usándolo y la versión FOSS es limpia, rápida y sin sorpresas. Soporta streaming por red local SMB/FTP y subtítulos automáticos a la perfección.',
    helpfulCount: 27,
    deviceInfo: 'Nothing Phone (2)',
    versionReviewed: 'v3.5.4'
  },
  {
    id: 'rev-006',
    appId: 'bitwarden',
    author: 'Alejandro Morales',
    avatarLetter: 'A',
    rating: 5,
    date: '18 de agosto de 2026',
    title: 'Gestor de contraseñas seguro, multiplataforma y confiable',
    content: 'La integración con el servicio de autocompletado de Android es instantánea y el soporte para Passkeys biométricas funciona impecable.',
    helpfulCount: 31,
    deviceInfo: 'Google Pixel 7',
    versionReviewed: 'v2024.7.1'
  }
];
