/**
 * Handles authentication-related errors, particularly JWT token expiration.
 * Redirects to login page when session is invalid or expired.
 */

export function handleAuthError(error: any) {
  const isTokenExpired = 
    error?.status === 401 ||
    error?.message?.toLowerCase().includes('jwt') ||
    error?.message?.toLowerCase().includes('expired') ||
    error?.message?.toLowerCase().includes('unauthorized')

  if (isTokenExpired) {
    // Clear any stored auth data
    if (typeof window !== 'undefined') {
      // Redirect to login with return URL
      const returnUrl = window.location.pathname
      window.location.href = `/auth?expired=true&return=${encodeURIComponent(returnUrl)}`
    }
    return true
  }

  return false
}

export async function fetchWithAuthCheck(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options)

  if (response.status === 401) {
    const error = await response.json()
    handleAuthError(error)
  }

  return response
}
