<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Delivery;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    // GET /api/admin/companies
    public function companies(Request $request)
    {
        $query = Partner::with('user')->withCount('deliveries');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $companies = $query->orderByDesc('created_at')->paginate(15);

        return response()->json($companies);
    }

    // GET /api/admin/companies/{id}
    public function showCompany($id)
    {
        $partner = Partner::with('user', 'apiKeys')->withCount('deliveries')->find($id);

        if (!$partner) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        return response()->json(['company' => $partner]);
    }

    // PATCH /api/admin/companies/{id}/approve
    public function approveCompany(Request $request, $id)
    {
        $partner = Partner::find($id);

        if (!$partner) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $partner->update(['status' => 'active']);

        AuditLog::record($request->user()->id, 'company.approved', 'Partner', $partner->id, ['business_name' => $partner->business_name]);

        return response()->json(['message' => 'Company approved successfully', 'company' => $partner]);
    }

    // PATCH /api/admin/companies/{id}/reject
    public function rejectCompany(Request $request, $id)
    {
        $partner = Partner::find($id);

        if (!$partner) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $partner->update(['status' => 'suspended']);

        AuditLog::record($request->user()->id, 'company.rejected', 'Partner', $partner->id, ['business_name' => $partner->business_name]);

        return response()->json(['message' => 'Company rejected', 'company' => $partner]);
    }

    // PATCH /api/admin/companies/{id}/suspend
    public function suspendCompany(Request $request, $id)
    {
        $partner = Partner::find($id);

        if (!$partner) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $partner->update(['status' => 'suspended']);

        AuditLog::record($request->user()->id, 'company.suspended', 'Partner', $partner->id, ['business_name' => $partner->business_name]);

        return response()->json(['message' => 'Company suspended', 'company' => $partner]);
    }

    // PATCH /api/admin/companies/{id}/rate-limit
    public function updateRateLimit(Request $request, $id)
    {
        $partner = Partner::find($id);

        if (!$partner) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'rate_limit_per_minute' => 'required|integer|min:1|max:10000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldLimit = $partner->rate_limit_per_minute;
        $partner->update(['rate_limit_per_minute' => $request->rate_limit_per_minute]);

        AuditLog::record($request->user()->id, 'company.rate_limit_updated', 'Partner', $partner->id, [
            'business_name' => $partner->business_name,
            'old_limit' => $oldLimit,
            'new_limit' => $request->rate_limit_per_minute,
        ]);

        return response()->json(['message' => 'Rate limit updated', 'company' => $partner]);
    }

    // GET /api/admin/deliveries  (global view, all partners)
    public function deliveries(Request $request)
    {
        $query = Delivery::with('partner:id,business_name');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('partner_id') && $request->partner_id !== '') {
            $query->where('partner_id', $request->partner_id);
        }

        $deliveries = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($deliveries);
    }

    // PATCH /api/admin/deliveries/{id}/override-status
    public function overrideDeliveryStatus(Request $request, $id)
    {
        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,accepted,assigned,picked_up,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldStatus = $delivery->status;
        $delivery->update(['status' => $request->status]);

        AuditLog::record($request->user()->id, 'delivery.status_overridden', 'Delivery', $delivery->id, [
            'tracking_number' => $delivery->tracking_number,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
        ]);

        return response()->json(['message' => 'Delivery status overridden', 'delivery' => $delivery]);
    }

    // POST /api/admin/companies/{id}/impersonate
    public function impersonate(Request $request, $id)
    {
        $partner = Partner::with('user')->find($id);

        if (!$partner) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $targetUser = $partner->user;

        if (!$targetUser) {
            return response()->json(['message' => 'No user found for this company'], 404);
        }

        $token = $targetUser->createToken('impersonation_by_admin_' . $request->user()->id)->plainTextToken;

        AuditLog::record($request->user()->id, 'company.impersonated', 'Partner', $partner->id, [
            'business_name' => $partner->business_name,
            'impersonated_user_email' => $targetUser->email,
        ]);

        return response()->json([
            'message' => 'Impersonation token issued',
            'token' => $token,
            'user' => $targetUser,
        ]);
    }

    // GET /api/admin/audit-logs
    public function auditLogs(Request $request)
    {
        $logs = AuditLog::with('admin:id,name,email')
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($logs);
    }

    // GET /api/admin/analytics
    public function analytics(Request $request)
    {
        $totalRequests = \App\Models\ApiRequestLog::count();
        $successCount = \App\Models\ApiRequestLog::whereBetween('status_code', [200, 299])->count();
        $clientErrorCount = \App\Models\ApiRequestLog::whereBetween('status_code', [400, 499])->count();
        $serverErrorCount = \App\Models\ApiRequestLog::whereBetween('status_code', [500, 599])->count();
        $avgResponseTime = \App\Models\ApiRequestLog::avg('response_time_ms');

        $byPartner = \App\Models\ApiRequestLog::selectRaw('partner_id, count(*) as request_count, avg(response_time_ms) as avg_response_time')
            ->whereNotNull('partner_id')
            ->groupBy('partner_id')
            ->with('partner:id,business_name')
            ->orderByDesc('request_count')
            ->limit(10)
            ->get();

        $recentRequests = \App\Models\ApiRequestLog::with('partner:id,business_name')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return response()->json([
            'total_requests' => $totalRequests,
            'success_count' => $successCount,
            'client_error_count' => $clientErrorCount,
            'server_error_count' => $serverErrorCount,
            'avg_response_time_ms' => round($avgResponseTime ?? 0, 1),
            'by_partner' => $byPartner,
            'recent_requests' => $recentRequests,
        ]);
    }

    // GET /api/admin/stats  (global system stats)
    public function stats()
    {
        return response()->json([
            'total_companies' => Partner::count(),
            'pending_companies' => Partner::where('status', 'pending')->count(),
            'active_companies' => Partner::where('status', 'active')->count(),
            'total_deliveries' => Delivery::count(),
            'active_deliveries' => Delivery::whereIn('status', ['pending', 'accepted', 'assigned', 'picked_up'])->count(),
            'completed_deliveries' => Delivery::where('status', 'delivered')->count(),
        ]);
    }
}
