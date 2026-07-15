<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;

class DriverDashboardController extends Controller
{
    public function index()
    {
        return view('driver.dashboard');
    }
}