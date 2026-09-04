<?php

use Illuminate\Support\Facades\Route;

// Serve Angular Single Page Application for all web routes
Route::get('/{any?}', function () {
    return response(file_get_contents(public_path('index.html')), 200, [
        'Content-Type' => 'text/html'
    ]);
})->where('any', '^(?!api).*$');
