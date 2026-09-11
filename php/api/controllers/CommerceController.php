<?php
/**
 * php/api/controllers/CommerceController.php
 * Motor de Comercio Headless (Clon Soberano FOSS de WooCommerce)
 * Procesa compras in-app, licencias de software libre y microtransacciones con 0% comisiones.
 */

declare(strict_types=1);

class CommerceController
{
    private static array $products = [
        [
            'id' => 'prod-civer-vip-pass',
            'name' => 'Pase de Acceso Civer Cloud VIP (IA Ilimitada)',
            'description' => 'Acceso permanente al clúster de OmniRouter con 48 cuentas de Google Cloud y GPU Kaggle 30GB.',
            'price_usd' => 12.00,
            'price_sats' => 18600,
            'sku' => 'CC-VIP-001',
            'type' => 'DIGITAL_SUBSCRIPTION',
            'in_stock' => true
        ],
        [
            'id' => 'prod-app-pro-license',
            'name' => 'Certificado de Firma APK de Desarrollador',
            'description' => 'Firma digital Scheme v2/v3 con Keystore de 4096-bits para distribución soberana en Civer Store.',
            'price_usd' => 5.00,
            'price_sats' => 7750,
            'sku' => 'CC-KEY-002',
            'type' => 'DIGITAL_DOWNLOAD',
            'in_stock' => true
        ],
        [
            'id' => 'prod-hardware-testing-bounty',
            'name' => 'Depósito de Garantía para Misiones de QA en Samsung A06',
            'description' => 'Financiamiento directo a la bolsa de probadores humanos para auditar apps en hardware real.',
            'price_usd' => 25.00,
            'price_sats' => 38750,
            'sku' => 'CC-QA-POOL',
            'type' => 'COMMUNITY_BOUNTY',
            'in_stock' => true
        ]
    ];

    public static function getProducts(): array
    {
        return [
            'engine' => 'CIVER_WOOCOMMERCE_CLONE_V1',
            'currency' => 'USD / SATS / MXN',
            'fee_structure' => [
                'platform_fee_percent' => 0.0, // CERO COMISIÓN vs 30% Google Play
                'developer_share_percent' => 100.0
            ],
            'products' => self::$products
        ];
    }

    public static function processCheckout(array $payload): array
    {
        $items = $payload['items'] ?? [];
        $paymentMethod = $payload['payment_method'] ?? 'LIGHTNING';
        $customerEmail = filter_var($payload['customer_email'] ?? 'vibe-coder@civer.cloud', FILTER_SANITIZE_EMAIL);

        $totalUsd = 0.0;
        $totalSats = 0;
        $processedItems = [];

        foreach ($items as $item) {
            $prodId = $item['product_id'] ?? '';
            $qty = max(1, (int)($item['quantity'] ?? 1));

            $found = null;
            foreach (self::$products as $p) {
                if ($p['id'] === $prodId) {
                    $found = $p;
                    break;
                }
            }

            if ($found) {
                $subtotalUsd = $found['price_usd'] * $qty;
                $subtotalSats = $found['price_sats'] * $qty;
                $totalUsd += $subtotalUsd;
                $totalSats += $subtotalSats;

                $processedItems[] = [
                    'product_id' => $prodId,
                    'name' => $found['name'],
                    'quantity' => $qty,
                    'unit_price_usd' => $found['price_usd'],
                    'subtotal_usd' => $subtotalUsd,
                    'subtotal_sats' => $subtotalSats
                ];
            }
        }

        $orderId = 'ORD-' . strtoupper(bin2hex(random_bytes(5)));
        $isLightning = strtoupper($paymentMethod) === 'LIGHTNING';

        return [
            'status' => 'PENDING_PAYMENT',
            'order_id' => $orderId,
            'timestamp' => date('c'),
            'customer_email' => $customerEmail,
            'items' => $processedItems,
            'totals' => [
                'amount_usd' => round($totalUsd, 2),
                'amount_sats' => $totalSats,
                'fee_saved_vs_playstore_usd' => round($totalUsd * 0.30, 2)
            ],
            'payment_instructions' => [
                'method' => $paymentMethod,
                'lightning_invoice' => $isLightning ? 'lnbc' . $totalSats . 'u1p3civer' . bin2hex(random_bytes(16)) : null,
                'spei_clabe' => !$isLightning ? '012180001234567890 (BBVA - Civer Cloud Tesorería)' : null,
                'expiry_seconds' => 900
            ],
            'download_grant' => [
                'token' => bin2hex(random_bytes(24)),
                'access_url' => "https://bene.civer.cloud/api/v1/downloads/{$orderId}"
            ]
        ];
    }
}
