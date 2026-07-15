<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;

class CustomerDashboardController extends Controller
{
    public function index()
    {
        return view('customer.dashboard');
    }
}