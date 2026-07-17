<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Delivery;
use App\Models\Partner;
use App\Models\Tracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PartnerController extends Controller
{
    public function register(Request $request)
    {
        $user = $request->user();
        if ($user->partner) {
            return response()->json(['message' => 'Partner profile already exists'], 422);
        }
        $validator = Validator::make($request->all(), [
            'business_name' => 'required|string|max:255',
            'business_email' => 'nullable|email',
            'business_phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $partner = Partner::create([
            'user_id' => $user->id,
            'business_name' => $request->business_name,
            'business_email' => $request->business_email,
            'business_phone' => $request->business_phone,
            'address' => $request->address,
            'status' => 'pending',
        ]);
        return response()->json(['partner' => $partner], 201);
    }

    public function me(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }
        return response()->json(['partner' => $partner]);
    }

    public function updateProfile(Request $request)
    {
        $partner = $request->user()->partner;

        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'business_name' => 'required|string|max:255',
            'business_email' => 'nullable|email',
            'business_phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $partner->update($validator->validated());

        return response()->json(['partner' => $partner]);
    }

    public function uploadProfilePicture(Request $request)
    {
        $partner = $request->user()->partner;

        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($partner->profile_picture_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($partner->profile_picture_path);
        }

        $path = $request->file('file')->store('profile-pictures', 'public');
        $partner->update(['profile_picture_path' => $path]);

        return response()->json([
            'message' => 'Profile picture updated',
            'profile_picture_url' => \Illuminate\Support\Facades\Storage::disk('public')->url($path),
        ]);
    }

    public function dashboard(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }
        $total = Delivery::where('partner_id', $partner->id)->count();
        $active = Delivery::where('partner_id', $partner->id)->whereIn('status', ['pending', 'accepted', 'assigned', 'picked_up'])->count();
        $completed = Delivery::where('partner_id', $partner->id)->where('status', 'delivered')->count();
        $cancelled = Delivery::where('partner_id', $partner->id)->where('status', 'cancelled')->count();
        $successRate = $total > 0 ? round(($completed / $total) * 100, 1) : 0;
        $recentActivity = Delivery::where('partner_id', $partner->id)->orderByDesc('updated_at')->limit(10)->get(['id', 'tracking_number', 'status', 'updated_at']);
        return response()->json([
            'total_deliveries' => $total,
            'active_deliveries' => $active,
            'completed_deliveries' => $completed,
            'cancelled_deliveries' => $cancelled,
            'success_rate' => $successRate,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function deliveries(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }
        $query = Delivery::where('partner_id', $partner->id);
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        $deliveries = $query->orderByDesc('created_at')->paginate(15);
        return response()->json($deliveries);
    }

    public function createManualDelivery(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }
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
            'status' => 'pending',
            'is_sandbox' => false,
        ]);
        Tracking::create(['delivery_id' => $delivery->id, 'status' => 'pending']);
        return response()->json(['delivery' => $delivery], 201);
    }

    public function cancelManualDelivery(Request $request, $id)
    {
        $partner = $request->user()->partner;
        $delivery = Delivery::where('partner_id', $partner->id)->find($id);
        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }
        if (in_array($delivery->status, ['picked_up', 'delivered', 'cancelled'])) {
            return response()->json(['message' => 'Delivery cannot be cancelled at this stage'], 422);
        }
        $delivery->update(['status' => 'cancelled']);
        Tracking::create(['delivery_id' => $delivery->id, 'status' => 'cancelled']);
        return response()->json(['message' => 'Delivery cancelled successfully']);
    }

    public function uploadDocument(Request $request)
    {
        $partner = $request->user()->partner;

        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'type' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $path = $file->store('partner-documents/' . $partner->id, 'local');

        $document = \App\Models\PartnerDocument::create([
            'partner_id' => $partner->id,
            'type' => $request->input('type', 'business_license'),
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Document uploaded successfully', 'document' => $document], 201);
    }

    public function listDocuments(Request $request)
    {
        $partner = $request->user()->partner;

        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }

        return response()->json(['documents' => $partner->documents()->orderByDesc('created_at')->get()]);
    }

    public function updateWebhook(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }
        $validator = Validator::make($request->all(), ['webhook_url' => 'required|url']);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $partner->update(['webhook_url' => $request->webhook_url]);
        return response()->json(['partner' => $partner]);
    }

    public function generateApiKey(Request $request)
    {
        if (!$request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Please verify your email before generating API keys'], 403);
        }
        $partner = $request->user()->partner;
        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'is_sandbox' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $apiKey = ApiKey::generate($partner->id, $request->boolean('is_sandbox'), $request->name);
        return response()->json([
            'message' => 'API key generated. Save it now, it will not be shown again.',
            'api_key' => $apiKey->key,
            'id' => $apiKey->id,
            'is_sandbox' => $apiKey->is_sandbox,
            'name' => $apiKey->name,
        ], 201);
    }

    public function listApiKeys(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return response()->json(['message' => 'No partner profile found'], 404);
        }
        $keys = $partner->apiKeys()->get()->map(function ($key) {
            return [
                'id' => $key->id,
                'name' => $key->name,
                'masked_key' => substr($key->key, 0, 12) . '...' . substr($key->key, -4),
                'is_sandbox' => $key->is_sandbox,
                'is_active' => $key->is_active,
                'last_used_at' => $key->last_used_at,
                'created_at' => $key->created_at,
            ];
        });
        return response()->json(['api_keys' => $keys]);
    }

    public function revokeApiKey(Request $request, $id)
    {
        $partner = $request->user()->partner;
        $key = ApiKey::where('partner_id', $partner->id)->find($id);
        if (!$key) {
            return response()->json(['message' => 'API key not found'], 404);
        }
        $key->update(['is_active' => false]);
        return response()->json(['message' => 'API key revoked successfully']);
    }
}
