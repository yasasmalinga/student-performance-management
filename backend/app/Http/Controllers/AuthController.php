<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Handle user login
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by username
        $user = User::where('userName', $request->username)->first();

        // Check if user exists and password matches
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid username or password'
            ], 401);
        }

        // Return user data (in a real app, you'd generate a token here)
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'userId' => $user->userId,
                'userName' => $user->userName,
                'userType' => $user->userType,
                'userEmail' => $user->userEmail,
                'userContact' => $user->userContact,
            ]
        ], 200);
    }

    /**
     * Handle user logout
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // In a real app with tokens, you'd invalidate the token here
        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }

    /**
     * Get current authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        // In a real app, you'd get the user from the authenticated session/token
        // For now, we'll require the userId in the request
        $validator = Validator::make($request->all(), [
            'userId' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'User ID required',
            ], 422);
        }

        $user = User::find($request->userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'userId' => $user->userId,
                'userName' => $user->userName,
                'userType' => $user->userType,
                'userEmail' => $user->userEmail,
                'userContact' => $user->userContact,
            ]
        ], 200);
    }
}
