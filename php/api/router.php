<?php
/**
 * php/api/router.php
 * Laguna PHP Headless - Enrutador API REST Soberano
 * Ecosistema de Ríos y Lagunas de Civer Cloud Enterprise
 */

declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Civer-Cluster-Key');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/controllers/HealthController.php';
require_once __DIR__ . '/controllers/BuilderController.php';
require_once __DIR__ . '/controllers/CommerceController.php';
require_once __DIR__ . '/controllers/WordPressBridgeController.php';

$rawUri = php_sapi_name() === 'cli' 
    ? ($argv[1] ?? '/health') 
    : ($_SERVER['REQUEST_URI'] ?? '/');

$requestUri = parse_url($rawUri, PHP_URL_PATH);

// Normalizar ruta eliminando prefijo si se invoca desde subdirectorio
$route = preg_replace('#^/api(?:/v1)?#', '', (string)$requestUri);
$route = '/' . trim((string)$route, '/');

try {
    switch ($route) {
        case '/':
        case '/health':
            if ($method === 'GET') {
                echo json_encode(HealthController::getHealthStatus(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                exit(0);
            }
            break;

        case '/builder/widgets':
            if ($method === 'GET') {
                echo json_encode(BuilderController::getAvailableWidgets(), JSON_PRETTY_PRINT);
                exit(0);
            }
            break;

        case '/builder/render':
            $raw = file_get_contents('php://input') ?: ($argv[2] ?? '');
            $data = json_decode((string)$raw, true) ?: [
                'blocks' => [
                    ['type' => 'HERO_BANNER', 'props' => ['title' => 'Civer Cloud FOSS Store', 'subtitle' => 'Play Store Open Source']],
                    ['type' => 'FEATURE_MATRIX', 'props' => ['columns' => 3]],
                    ['type' => 'CTA_CONVERSION', 'props' => ['label' => 'Instalar App APK', 'action' => 'DOWNLOAD_DIRECT']]
                ]
            ];
            echo json_encode(BuilderController::renderLayout($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit(0);

        case '/commerce/products':
            echo json_encode(CommerceController::getProducts(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit(0);

        case '/commerce/checkout':
        case '/commerce/order':
            $raw = file_get_contents('php://input') ?: ($argv[2] ?? '');
            $data = json_decode((string)$raw, true) ?: [
                'productId' => 'prod-app-dev-pass',
                'paymentMethod' => 'LIGHTNING_BOLT11',
                'customerEmail' => 'developer@civer.cloud'
            ];
            echo json_encode(CommerceController::processCheckout($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit(0);

        case '/plugins/list':
        case '/wordpress/plugins':
            echo json_encode(WordPressBridgeController::getInstalledPlugins(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit(0);

        case '/wordpress/sync':
            if ($method === 'POST') {
                $raw = file_get_contents('php://input');
                $data = json_decode($raw, true) ?: [];
                echo json_encode(WordPressBridgeController::syncWithCluster($data), JSON_PRETTY_PRINT);
                exit(0);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'status' => 'ERROR',
                'message' => "Ruta '{$route}' no encontrada en la Laguna PHP Headless",
                'available_endpoints' => [
                    'GET  /api/v1/health',
                    'GET  /api/v1/builder/widgets',
                    'POST /api/v1/builder/render',
                    'GET  /api/v1/commerce/products',
                    'POST /api/v1/commerce/checkout',
                    'GET  /api/v1/wordpress/plugins',
                    'POST /api/v1/wordpress/sync'
                ]
            ], JSON_PRETTY_PRINT);
            exit(0);
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'EXCEPTION',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
