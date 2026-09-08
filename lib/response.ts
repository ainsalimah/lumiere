/**
 * Centralized API response helpers for Next.js Route Handlers.
 * Returns Web API Response objects (not Express res.json calls).
 */
export class ApiResponse {
  private static json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  static ok<T>(data: T) {
    return ApiResponse.json(data, 200)
  }

  static created<T>(data: T) {
    return ApiResponse.json(data, 201)
  }

  static message(message: string, extra?: Record<string, unknown>) {
    return ApiResponse.json({ success: true, message, ...extra }, 200)
  }

  static badRequest(error: string) {
    return ApiResponse.json({ error }, 400)
  }

  static unauthorized(error = 'Authentication required.') {
    return ApiResponse.json({ error }, 401)
  }

  static forbidden(error = 'Access denied.') {
    return ApiResponse.json({ error }, 403)
  }

  static notFound(error = 'Resource not found.') {
    return ApiResponse.json({ error }, 404)
  }

  static serverError(error = 'Internal server error.') {
    return ApiResponse.json({ error }, 500)
  }
}
