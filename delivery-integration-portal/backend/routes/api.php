<?php
use App\Http\Controllers\Api\TrackingController;

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\V1\DeliveryController;
use Illuminate\Support\Facades\Route;

Route::get('/track/{trackingNumber}', [TrackingController::class, 'track']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/email/resend', [EmailVerificationController::class, 'resend']);

    Route::prefix('partner')->group(function () {
        Route::post('/register', [PartnerController::class, 'register']);
        Route::get('/me', [PartnerController::class, 'me']);
        Route::patch('/profile', [PartnerController::class, 'updateProfile']);
        Route::post('/profile-picture', [PartnerController::class, 'uploadProfilePicture']);
        Route::get('/dashboard', [PartnerController::class, 'dashboard']);
        Route::get('/deliveries', [PartnerController::class, 'deliveries']);
        Route::post('/deliveries/manual', [PartnerController::class, 'createManualDelivery']);
        Route::post('/documents', [PartnerController::class, 'uploadDocument']);
        Route::get('/documents', [PartnerController::class, 'listDocuments']);
        Route::patch('/deliveries/{id}/cancel', [PartnerController::class, 'cancelManualDelivery']);
        Route::patch('/webhook', [PartnerController::class, 'updateWebhook']);
        Route::post('/api-keys', [PartnerController::class, 'generateApiKey']);
        Route::get('/api-keys', [PartnerController::class, 'listApiKeys']);
        Route::delete('/api-keys/{id}', [PartnerController::class, 'revokeApiKey']);
    });

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::post('/companies/{id}/impersonate', [AdminController::class, 'impersonate']);
        Route::get('/companies', [AdminController::class, 'companies']);
        Route::get('/approval-requests', [AdminController::class, 'approvalRequests']);
        Route::get('/companies/{id}', [AdminController::class, 'showCompany']);
        Route::patch('/companies/{id}/approve', [AdminController::class, 'approveCompany']);
        Route::patch('/companies/{id}/reject', [AdminController::class, 'rejectCompany']);
        Route::patch('/companies/{id}/suspend', [AdminController::class, 'suspendCompany']);
        Route::patch('/companies/{id}/rate-limit', [AdminController::class, 'updateRateLimit']);
        Route::get('/companies/{id}/documents', [AdminController::class, 'documentsForCompany']);
        Route::post('/companies/{id}/documents', [AdminController::class, 'uploadDocumentForCompany']);
        Route::get('/documents/{id}/download', [AdminController::class, 'downloadDocument']);
        Route::patch('/documents/{id}/approve', [AdminController::class, 'approveDocument']);
        Route::patch('/documents/{id}/reject', [AdminController::class, 'rejectDocument']);
        Route::get('/deliveries', [AdminController::class, 'deliveries']);
        Route::patch('/deliveries/{id}/override-status', [AdminController::class, 'overrideDeliveryStatus']);
    });
});

Route::prefix('v1')->middleware('partner.api')->group(function () {
    Route::post('/deliveries', [DeliveryController::class, 'store']);
    Route::get('/deliveries', [DeliveryController::class, 'index']);
    Route::get('/deliveries/{id}', [DeliveryController::class, 'show']);
    Route::patch('/deliveries/{id}/cancel', [DeliveryController::class, 'cancel']);
    Route::post('/deliveries/{id}/simulate', [DeliveryController::class, 'simulate']);
});
