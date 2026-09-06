import { AppCatalogItem } from '../types';

export const STRESS_TEST_STRINGS = {
  shortTitle: 'FOSS Store Client Supercalifragilisticexpialidocious Ultra Long Application Name Version 999.88.77-alpha.build.ci.reproducible.signed.v4',
  unbrokenUrl: 'https://cdn.foss-matrix-internal-nexus-decentralized-distribution-registry.org/v2/repositories/enterprise/packages/applications/security/com.example.superlongpackagenamethatexceedsallnormalboundariesandmustnotoverflowhorizontally/releases/binaries/app-universal-release-unsigned-debuggable-signed-v4-checksum-sha512-9847198274198247192847198274918274918274192874198274918274918274.apk',
  deepDescription: 'Esta es una descripción de prueba de esfuerzo de volumen extremo diseñada específicamente para verificar que el contenedor responda con un salto de línea elástico y sin romper las rejillas CSS ni generar barras de scroll horizontales indeseadas. Contiene texto repetido, bloques técnicos extensos, especificaciones criptográficas detalladas y anidamientos continuos para forzar el comportamiento de word-break, flex-wrap y auto-fit en pantallas de 320px, 390px, 640px, 768px, 1024px, 1280px y 1536px. Los márgenes y paddings deben conservar sus proporciones áureas matemáticas y el interlineado debe mantener la legibilidad estándar sin colisionar con elementos adyacentes ni tarjetas superpuestas.',
  longTags: [
    'SuperLongTagWithoutSpacesTestingFluidBadgeWrappingAndResponsiveness',
    'Android15-VanillaIceCream-APISpecificationLevel35-ComplianceVerified',
    'CryptographicSignatureSchemeVersion4-WithECDSA-P384-HardwareKeystore',
    'ReproducibleBuilds-DeterministicCompilation-ZeroTimestampDiffs',
    'F-Droid-PrivilegedExtension-DirectSideloading-AutomatedBackgroundUpdates',
    'Anti-Tracker-ExodusPrivacy-ZeroTelemetry-GDPR-CCPA-FullAuditPass',
    'Universal-Bento-Grid-Nested-Card-Overflow-Safety-Stress-Test-Pass-100%'
  ]
};

/**
 * Transforms an array of AppCatalogItem with stress-test payload when enabled
 */
export function applyStressTestToApps(apps: AppCatalogItem[], isActive: boolean, level: 'mild' | 'heavy' | 'extreme' = 'heavy'): AppCatalogItem[] {
  if (!isActive) return apps;

  return apps.map((app, index) => {
    // Modify every app or selected apps depending on index
    const shouldStress = index % 2 === 0;
    if (!shouldStress) return app;

    const multiplier = level === 'extreme' ? 3 : level === 'heavy' ? 2 : 1;
    const extraTags = STRESS_TEST_STRINGS.longTags.slice(0, level === 'extreme' ? 7 : level === 'heavy' ? 4 : 2);

    return {
      ...app,
      name: `${app.name} [STRESS TEST] ${STRESS_TEST_STRINGS.shortTitle.slice(0, 35 * multiplier)}`,
      tagline: `${app.tagline} • ${STRESS_TEST_STRINGS.deepDescription.slice(0, 120 * multiplier)}`,
      description: `${app.description}\n\n${STRESS_TEST_STRINGS.deepDescription.repeat(multiplier)}\n\nRepositorio de Descarga Sin Espacios:\n${STRESS_TEST_STRINGS.unbrokenUrl}`,
      badgeTag: extraTags[0] || app.badgeTag,
      packageName: `com.stress.test.${app.packageName}.${'verylongsubdomainsegment.'.repeat(multiplier)}release`,
      version: `${app.version}-stress-${'v'.repeat(multiplier * 4)}`
    };
  });
}

