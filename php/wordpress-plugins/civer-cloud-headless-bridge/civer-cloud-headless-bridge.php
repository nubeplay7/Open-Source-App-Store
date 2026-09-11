<?php
/**
 * Plugin Name: Civer Cloud Headless Bridge
 * Description: Conector oficial entre WordPress Headless y el clúster soberano Civer App Store (PWA, Android Shizuku y Lightning Network).
 * Version: 1.0.0
 * Author: Civer Cloud Enterprise
 * Author URI: https://civer.cloud
 * License: GPLv2 or later
 * Text Domain: civer-cloud-bridge
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    // Si se ejecuta en modo headless autónomo sin WordPress Core instalado
    define('CIVER_HEADLESS_STANDALONE', true);
}

class CiverCloudHeadlessBridge
{
    private static ?self $instance = null;

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct()
    {
        if (function_exists('add_action')) {
            add_action('rest_api_init', [$this, 'registerRestRoutes']);
        }
    }

    public function registerRestRoutes(): void
    {
        if (!function_exists('register_rest_route')) return;

        register_rest_route('civer/v1', '/catalog', [
            'methods' => 'GET',
            'callback' => [$this, 'handleGetCatalog'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('civer/v1', '/telemetry', [
            'methods' => 'GET',
            'callback' => [$this, 'handleGetTelemetry'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function handleGetCatalog(): array
    {
        return [
            'store' => 'Civer FOSS App Store',
            'total_apps' => 24,
            'source' => 'WordPress Headless Custom Post Types (cpt_foss_app)'
        ];
    }

    public function handleGetTelemetry(): array
    {
        return [
            'bridge_status' => 'ONLINE',
            'tailscale_node' => '100.68.236.36',
            'shizuku_privileged' => true
        ];
    }
}

// Iniciar Singleton
CiverCloudHeadlessBridge::getInstance();
