<?php
/**
 * php/api/controllers/BuilderController.php
 * Motor de Renderizado Headless Visual Builder (Clon FOSS Soberano de Elementor)
 * Compila esquemas JSON a HTML + Tailwind CSS y Jetpack Compose para Android.
 */

declare(strict_types=1);

class BuilderController
{
    public static function getAvailableWidgets(): array
    {
        return [
            'engine' => 'CIVER_ELEMENTOR_CLONE_V1',
            'philosophy' => 'Headless Component Synthesizer',
            'widgets' => [
                [
                    'type' => 'HERO_BANNER',
                    'name' => 'Hero Banner Soberano',
                    'icon' => 'Sparkles',
                    'category' => 'Estructura',
                    'default_props' => [
                        'title' => 'La Play Store Open Source',
                        'subtitle' => 'Tu trabajo en línea que sí paga con IA ilimitada',
                        'badge' => 'CERO RASTREADORES',
                        'cta_text' => 'Explorar Catálogo',
                        'cta_link' => '#apps'
                    ]
                ],
                [
                    'type' => 'APP_GRID',
                    'name' => 'Grilla de Aplicaciones FOSS',
                    'icon' => 'Grid',
                    'category' => 'Contenido',
                    'default_props' => [
                        'columns' => 3,
                        'category_filter' => 'ALL',
                        'show_sha256' => true,
                        'show_shizuku_badge' => true
                    ]
                ],
                [
                    'type' => 'TELEMETRY_HUD',
                    'name' => 'Barra de Telemetría Multi-Nodo',
                    'icon' => 'Activity',
                    'category' => 'Infraestructura',
                    'default_props' => [
                        'nodes' => ['ASUS_MASTER', 'THINKPAD_PEER', 'SAMSUNG_A06', 'CLOUDFLARE_EDGE'],
                        'refresh_interval_sec' => 30
                    ]
                ],
                [
                    'type' => 'PAYOUT_CARD',
                    'name' => 'Tarjeta de Retiro Lightning / SPEI',
                    'icon' => 'Zap',
                    'category' => 'Fintech',
                    'default_props' => [
                        'currency' => 'SATS',
                        'instant_settlement' => true,
                        'fee_percent' => 0.0
                    ]
                ],
                [
                    'type' => 'CTA_CONVOCATION',
                    'name' => 'Convocatoria de Trabajo Remunerado',
                    'icon' => 'Briefcase',
                    'category' => 'Comunidad',
                    'default_props' => [
                        'hours_per_day' => 2,
                        'role' => 'Vibe Coder / QA Tester',
                        'reward_monthly_usd' => 450
                    ]
                ]
            ]
        ];
    }

    public static function renderLayout(array $payload): array
    {
        $blocks = $payload['blocks'] ?? [];
        $title = htmlspecialchars((string)($payload['title'] ?? 'Página Civer'));

        $htmlOutput = "<div class=\"civer-builder-page space-y-8 w-full max-w-7xl mx-auto p-4\">\n";
        $composeOutput = "// Jetpack Compose Layout Generado por Civer Elementor Engine (PHP Headless)\n";
        $composeOutput .= "@Composable\nfun GeneratedLayout() {\n    Column(\n        modifier = Modifier.fillMaxSize().padding(16.dp),\n        verticalArrangement = Arrangement.spacedBy(16.dp)\n    ) {\n";

        foreach ($blocks as $index => $block) {
            $type = $block['type'] ?? 'UNKNOWN';
            $props = $block['props'] ?? [];

            switch ($type) {
                case 'HERO_BANNER':
                    $hTitle = htmlspecialchars((string)($props['title'] ?? 'Civer Cloud'));
                    $hSubtitle = htmlspecialchars((string)($props['subtitle'] ?? 'Ecosistema de Software Libre'));
                    $hBadge = htmlspecialchars((string)($props['badge'] ?? 'FOSS'));

                    $htmlOutput .= <<<HTML
    <!-- Block #{$index}: HERO_BANNER -->
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 p-8 shadow-2xl text-white">
        <div class="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">{$hBadge}</div>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-2">{$hTitle}</h1>
        <p class="text-slate-300 text-sm max-w-2xl leading-relaxed">{$hSubtitle}</p>
    </section>

HTML;
                    $composeOutput .= "        // Block {$index}: HeroBanner\n        SovereignHeroBanner(title = \"{$hTitle}\", subtitle = \"{$hSubtitle}\")\n";
                    break;

                case 'TELEMETRY_HUD':
                    $htmlOutput .= <<<HTML
    <!-- Block #{$index}: TELEMETRY_HUD -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300">💻 ASUS Master: <span class="text-emerald-400 font-bold">ONLINE</span></div>
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300">📡 ThinkPad Node: <span class="text-emerald-400 font-bold">REACHABLE</span></div>
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300">📱 Samsung A06: <span class="text-emerald-400 font-bold">ADB CONNECTED</span></div>
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300">🐘 Laguna PHP: <span class="text-sky-400 font-bold">ACTIVE</span></div>
    </div>

HTML;
                    $composeOutput .= "        // Block {$index}: TelemetryHud\n        ClusterTelemetryBarRow()\n";
                    break;

                case 'PAYOUT_CARD':
                    $htmlOutput .= <<<HTML
    <!-- Block #{$index}: PAYOUT_CARD -->
    <div class="p-6 rounded-3xl bg-slate-900/95 border border-slate-800 flex items-center justify-between shadow-xl">
        <div>
            <div class="text-xs uppercase font-mono text-slate-400">Liquidación Inmediata</div>
            <div class="text-lg font-black text-amber-400">⚡ Lightning Network & 🏦 SPEI</div>
        </div>
        <button class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg">Cobrar en Satoshis</button>
    </div>

HTML;
                    $composeOutput .= "        // Block {$index}: PayoutCard\n        PayoutInstantCard(onWithdrawClick = { /* BOLT11 */ })\n";
                    break;

                default:
                    $htmlOutput .= "    <!-- Custom Block #{$index}: {$type} -->\n    <div class=\"p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400\">Bloque personalizado: {$type}</div>\n";
                    $composeOutput .= "        CustomGenericBlock(type = \"{$type}\")\n";
                    break;
            }
        }

        $htmlOutput .= "</div>";
        $composeOutput .= "    }\n}";

        return [
            'status' => 'SUCCESS',
            'engine' => 'PHP_ELEMENTOR_CLONE_HEADLESS',
            'blocks_processed' => count($blocks),
            'compiled_html' => $htmlOutput,
            'compiled_jetpack_compose' => $composeOutput,
            'timestamp' => date('c')
        ];
    }
}
