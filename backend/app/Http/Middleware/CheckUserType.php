<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserType
{
    public function handle(Request $request, Closure $next, ...$userTypes): Response
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $allowedTypes = array_map('intval', $userTypes);
        
        if (!in_array($request->user()->userType, $allowedTypes)) {
            return response()->json(['error' => 'Unauthorized. Insufficient permissions.'], 403);
        }

        return $next($request);
    }
}

