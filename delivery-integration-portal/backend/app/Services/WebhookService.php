<?php

namespace App\Services;

use App\Models\Delivery;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    protected array $eventMap = [
        'pending' => 'delivery.created',
        'assigned' => 'delivery.assigned',
        'picked_up' => 'delivery.picked_up',
        'delivered' => 'delivery.delivered',
        'cancelled' => 'delivery.cancelled',
    ];

    public function dispatch(Delivery $delivery, string $status): void
    {
        $partner = $delivery->partner;

        if (!$partner || !$partner->webhook_url) {
            return;
        }

        $event = $this->eventMap[$status] ?? null;

        if (!$event) {
            return;
        }

        $payload = [
            'event' => $event,
            'delivery_id' => $delivery->id,
            'tracking_number' => $delivery->tracking_number,
            'status' => $delivery->status,
            'third_party_reference_id' => $delivery->third_party_reference_id,
            'timestamp' => now()->toIso8601String(),
        ];

        try {
            Http::timeout(5)->post($partner->webhook_url, $payload);
        } catch (\Throwable $e) {
            Log::warning('Webhook dispatch failed', [
                'partner_id' => $partner->id,
                'delivery_id' => $delivery->id,
                'url' => $partner->webhook_url,
                'error' => $e->getMessage(),
            ]);
        }
    }
}