<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Models\ApiRequestLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AuthenticatePartnerApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        $key = $request->bearerToken();

        if (!$key) {
            return $this->logAndReturn($request, $start, null, response()->json(['message' => 'API key missing'], 401));
        }

        $apiKey = ApiKey::where('key', $key)->where('is_active', true)->first();

        if (!$apiKey) {
            return $this->logAndReturn($request, $start, null, response()->json(['message' => 'Invalid API key'], 401));
        }

        $partner = $apiKey->partner;
        $limit = $partner->rate_limit_per_minute ?? 60;
        $rateLimitKey = 'partner-api:' . $partner->id;

        if (RateLimiter::tooManyAttempts($rateLimitKey, $limit)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            $response = response()->json([
                'message' => 'Rate limit exceeded. Try again in ' . $seconds . ' seconds.',
            ], 429)->header('Retry-After', $seconds);
            return $this->logAndReturn($request, $start, $partner->id, $response);
        }

        RateLimiter::hit($rateLimitKey, 60);

        $apiKey->update(['last_used_at' => now()]);

        $request->attributes->set('partner', $partner);
        $request->attributes->set('is_sandbox', $apiKey->is_sandbox);

        $response = $next($request);

        return $this->logAndReturn($request, $start, $partner->id, $response);
    }

    protected function logAndReturn(Request $request, float $start, ?int $partnerId, Response $response): Response
    {
        $elapsedMs = (int) ((microtime(true) - $start) * 1000);

        try {
            ApiRequestLog::create([
                'partner_id' => $partnerId,
                'method' => $request->method(),
                'path' => $request->path(),
                'status_code' => $response->getStatusCode(),
                'response_time_ms' => $elapsedMs,
            ]);
        } catch (\Throwable $e) {
            // Never let logging failures break the actual API response.
        }

        return $response;
    }
}
