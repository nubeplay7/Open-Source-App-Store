<?php
/**
 * Plugin Name: Civer Visual Builder Engine (Clon Soberano Elementor FOSS)
 * Description: Constructor visual headless y motor de síntesis de componentes que compila esquemas JSON a Tailwind CSS para la Web y Jetpack Compose para Android.
 * Version: 1.0.0
 * Author: Civer Cloud Enterprise
 * Author URI: https://civer.cloud/builder
 * License: GPLv2 or later
 * Text Domain: civer-visual-builder
 */

declare(strict_types=1);

class CiverVisualBuilderEngine
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
            add_action('rest_api_init', [$this, 'registerEndpoints']);
        }
    }

    public function registerEndpoints(): void
    {
        if (!function_exists('register_rest_route')) return;

        register_rest_route('civer-builder/v1', '/widgets', [
            'methods' => 'GET',
            'callback' => [$this, 'getWidgetsList'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('civer-builder/v1', '/render', [
            'methods' => 'POST',
            'callback' => [$this, 'renderPageLayout'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function getWidgetsList(): array
    {
        require_once dirname(__DIR__, 2) . '/api/controllers/BuilderController.php';
        return BuilderController::getAvailableWidgets();
    }

    public function renderPageLayout(\WP_REST_Request $request): array
    {
        require_once dirname(__DIR__, 2) . '/api/controllers/BuilderController.php';
        $params = $request->get_json_params() ?: [];
        return BuilderController::renderLayout($params);
    }
}

// Inicializar motor
CiverVisualBuilderEngine::getInstance();
