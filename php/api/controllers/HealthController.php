<?php
/**
 * php/api/controllers/HealthController.php
 * Controlador de Salud y Telemetría de la Laguna PHP
 */

declare(strict_types=1);

class HealthController
{
    public static function getHealthStatus(): array
    {
        $opcacheEnabled = function_exists('opcache_get_status') && (opcache_get_status()['opcache_enabled'] ?? false);
        $memoryUsage = memory_get_usage(true);
        $peakMemory = memory_get_peak_usage(true);

        return [
            'lagoon' => 'LAGUNA_PHP_HEADLESS',
            'version' => PHP_VERSION,
            'status' => 'ONLINE',
            'timestamp' => date('c'),
            'sapi' => PHP_SAPI,
            'os' => PHP_OS_FAMILY,
            'extensions' => [
                'curl' => extension_loaded('curl'),
                'json' => extension_loaded('json'),
                'mbstring' => extension_loaded('mbstring'),
                'openssl' => extension_loaded('openssl'),
                'pdo' => extension_loaded('pdo'),
                'sqlite3' => extension_loaded('sqlite3') || extension_loaded('pdo_sqlite'),
                'zip' => extension_loaded('zip'),
                'opcache' => $opcacheEnabled
            ],
            'memory' => [
                'current_formatted' => round($memoryUsage / 1024 / 1024, 2) . ' MB',
                'peak_formatted' => round($peakMemory / 1024 / 1024, 2) . ' MB',
                'current_bytes' => $memoryUsage,
                'limit' => ini_get('memory_limit')
            ],
            'hydrology_mesh' => [
                'upstream_river' => 'Antigravity TypeScript Cluster (:3000 / :3080)',
                'downstream_estuary' => 'Samsung Galaxy A06 (Shizuku & Android Native)',
                'wordpress_sublagoon' => 'Headless WP REST API Engine'
            ]
        ];
    }
}
