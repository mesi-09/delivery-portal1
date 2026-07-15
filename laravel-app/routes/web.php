<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Driver\DriverDashboardController;
use App\Http\Controllers\Customer\CustomerDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    return match (auth()->user()->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'driver' => redirect()->route('driver.dashboard'),
        'customer' => redirect()->route('customer.dashboard'),
        default => redirect()->route('login'),
    };
});


Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');
});

Route::middleware(['auth', 'role:driver'])->group(function () {
    Route::get('/driver', [DriverDashboardController::class, 'index'])
        ->name('driver.dashboard');
});

Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('/customer', [CustomerDashboardController::class, 'index'])
        ->name('customer.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
