<?php
/**
 * Plugin Name: Civer Commerce Engine (Clon Soberano WooCommerce FOSS)
 * Description: Motor de comercio electrónico desacoplado y sin comisiones para la venta de aplicaciones móviles, micropagos y suscripciones con pagos en Lightning Network y SPEI.
 * Version: 1.0.0
 * Author: Civer Cloud Enterprise
 * Author URI: https://civer.cloud/commerce
 * License: GPLv2 or later
 * Text Domain: civer-commerce
 */

declare(strict_types=1);

class CiverCommerceEngine
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

        register_rest_route('civer-commerce/v1', '/products', [
            'methods' => 'GET',
            'callback' => [$this, 'getProductsList'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('civer-commerce/v1', '/checkout', [
            'methods' => 'POST',
            'callback' => [$this, 'handleCheckout'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function getProductsList(): array
    {
        require_once dirname(__DIR__, 2) . '/api/controllers/CommerceController.php';
        return CommerceController::getProducts();
    }

    public function handleCheckout(\WP_REST_Request $request): array
    {
        require_once dirname(__DIR__, 2) . '/api/controllers/CommerceController.php';
        $params = $request->get_json_params() ?: [];
        return CommerceController::processCheckout($params);
    }
}

// Inicializar motor
CiverCommerceEngine::getInstance();
