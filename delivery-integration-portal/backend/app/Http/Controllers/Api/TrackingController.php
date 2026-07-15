<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;

class TrackingController extends Controller
{
    // GET /api/track/{trackingNumber}  (public, no auth required)
    public function track($trackingNumber)
    {
        $delivery = Delivery::with(['partner:id,business_name', 'trackingEvents', 'driver.user:id,name,phone'])
            ->where('tracking_number', $trackingNumber)
            ->first();

        if (!$delivery) {
            return response()->json(['message' => 'No delivery found with that tracking number'], 404);
        }

        return response()->json([
            'tracking_number' => $delivery->tracking_number,
            'status' => $delivery->status,
            'company' => $delivery->partner->business_name ?? 'Unknown',
            'pickup_address' => $delivery->pickup_address,
            'dropoff_address' => $delivery->dropoff_address,
            'dropoff_contact_name' => $delivery->dropoff_contact_name,
            'driver' => $delivery->driver ? [
                'name' => $delivery->driver->user->name ?? null,
                'phone' => $delivery->driver->user->phone ?? null,
            ] : null,
            'timeline' => $delivery->trackingEvents->map(fn ($event) => [
                'status' => $event->status,
                'note' => $event->note,
                'timestamp' => $event->created_at,
            ]),
            'created_at' => $delivery->created_at,
            'updated_at' => $delivery->updated_at,
        ]);
    }
}
