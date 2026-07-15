<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Tracking;
use App\Services\WebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryController extends Controller
{
    protected WebhookService $webhooks;

    public function __construct(WebhookService $webhooks)
    {
        $this->webhooks = $webhooks;
    }

    // POST /api/v1/deliveries
    public function store(Request $request)
    {
        $partner = $request->attributes->get('partner');
        $isSandbox = $request->attributes->get('is_sandbox');

        $validator = Validator::make($request->all(), [
            'pickup.contact_person_name' => 'required|string',
            'pickup.contact_person_number' => 'required|string',
            'pickup.address' => 'required|string',
            'pickup.latitude' => 'required|numeric',
            'pickup.longitude' => 'required|numeric',
            'dropoff.contact_person_name' => 'required|string',
            'dropoff.contact_person_number' => 'required|string',
            'dropoff.address' => 'required|string',
            'dropoff.latitude' => 'required|numeric',
            'dropoff.longitude' => 'required|numeric',
            'parcel_category_id' => 'required|integer',
            'charge_payer' => 'required|in:sender,receiver',
            'third_party_reference_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $delivery = Delivery::create([
            'partner_id' => $partner->id,
            'pickup_contact_name' => $request->input('pickup.contact_person_name'),
            'pickup_contact_number' => $request->input('pickup.contact_person_number'),
            'pickup_address' => $request->input('pickup.address'),
            'pickup_latitude' => $request->input('pickup.latitude'),
            'pickup_longitude' => $request->input('pickup.longitude'),
            'dropoff_contact_name' => $request->input('dropoff.contact_person_name'),
            'dropoff_contact_number' => $request->input('dropoff.contact_person_number'),
            'dropoff_address' => $request->input('dropoff.address'),
            'dropoff_latitude' => $request->input('dropoff.latitude'),
            'dropoff_longitude' => $request->input('dropoff.longitude'),
            'parcel_category_id' => $request->parcel_category_id,
            'charge_payer' => $request->charge_payer,
            'tracking_number' => (string) random_int(10000, 99999999),
            'third_party_reference_id' => $request->third_party_reference_id,
            'status' => 'pending',
            'is_sandbox' => $isSandbox,
        ]);

        Tracking::create([
            'delivery_id' => $delivery->id,
            'status' => 'pending',
        ]);

        $this->webhooks->dispatch($delivery, 'pending');

        return response()->json([
            'delivery_id' => $delivery->id,
            'tracking_number' => $delivery->tracking_number,
            'status' => $delivery->status,
            'third_party_reference_id' => $delivery->third_party_reference_id,
            'is_sandbox' => $delivery->is_sandbox,
        ], 201);
    }

    // GET /api/v1/deliveries/{id}
    public function show(Request $request, $id)
    {
        $partner = $request->attributes->get('partner');

        $delivery = Delivery::where('partner_id', $partner->id)
            ->with('driver')
            ->find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        return response()->json([
            'delivery_id' => $delivery->id,
            'tracking_number' => $delivery->tracking_number,
            'status' => $delivery->status,
            'third_party_reference_id' => $delivery->third_party_reference_id,
            'pickup' => [
                'address' => $delivery->pickup_address,
                'contact_person_name' => $delivery->pickup_contact_name,
                'contact_person_number' => $delivery->pickup_contact_number,
            ],
            'dropoff' => [
                'address' => $delivery->dropoff_address,
                'contact_person_name' => $delivery->dropoff_contact_name,
                'contact_person_number' => $delivery->dropoff_contact_number,
            ],
            'delivery_charge' => $delivery->delivery_charge,
            'delivery_man' => $delivery->driver ? [
                'name' => $delivery->driver->user->name ?? null,
                'phone' => $delivery->driver->user->phone ?? null,
            ] : null,
            'created_at' => $delivery->created_at,
            'updated_at' => $delivery->updated_at,
        ]);
    }

    // GET /api/v1/deliveries
    public function index(Request $request)
    {
        $partner = $request->attributes->get('partner');

        $query = Delivery::where('partner_id', $partner->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $deliveries = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'current_page' => $deliveries->currentPage(),
            'data' => $deliveries->getCollection()->map(function ($d) {
                return [
                    'id' => $d->id,
                    'order_status' => $d->status,
                    'third_party_reference_id' => $d->third_party_reference_id,
                    'created_at' => $d->created_at,
                ];
            }),
            'total' => $deliveries->total(),
        ]);
    }

    // PATCH /api/v1/deliveries/{id}/cancel
    public function cancel(Request $request, $id)
    {
        $partner = $request->attributes->get('partner');

        $delivery = Delivery::where('partner_id', $partner->id)->find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        if (in_array($delivery->status, ['picked_up', 'delivered', 'cancelled'])) {
            return response()->json(['message' => 'Delivery cannot be cancelled at this stage'], 422);
        }

        $delivery->update(['status' => 'cancelled']);

        Tracking::create([
            'delivery_id' => $delivery->id,
            'status' => 'cancelled',
        ]);

        $this->webhooks->dispatch($delivery, 'cancelled');

        return response()->json(['message' => 'Delivery request cancelled successfully']);
    }

    // POST /api/v1/deliveries/{id}/simulate
    public function simulate(Request $request, $id)
    {
        $partner = $request->attributes->get('partner');
        $isSandbox = $request->attributes->get('is_sandbox');

        if (!$isSandbox) {
            return response()->json(['message' => 'Simulation is only available with a sandbox/test API key'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:assigned,picked_up,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $delivery = Delivery::where('partner_id', $partner->id)
            ->where('is_sandbox', true)
            ->find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Sandbox delivery not found'], 404);
        }

        $delivery->update(['status' => $request->status]);

        Tracking::create([
            'delivery_id' => $delivery->id,
            'status' => $request->status,
        ]);

        $this->webhooks->dispatch($delivery, $request->status);

        return response()->json([
            'message' => 'Sandbox delivery status updated successfully',
            'delivery_id' => $delivery->id,
            'status' => $delivery->status,
        ]);
    }
}