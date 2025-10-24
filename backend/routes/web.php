<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Student Performance Monitoring System API',
        'version' => '1.0.0',
        'documentation' => '/api',
    ]);
});

