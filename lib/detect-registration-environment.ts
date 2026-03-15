/**
 * Detect the environment based on the request origin/host
 */

export type RegistrationEnvironment = 'local' | 'staging' | 'production'

export function detectRegistrationEnvironment(request: Request): RegistrationEnvironment {
  // Get the host from request headers
  const host = request.headers.get('host') || ''
  const origin = request.headers.get('origin') || ''
  const referer = request.headers.get('referer') || ''
  const xForwardedHost = request.headers.get('x-forwarded-host') || ''

  // Combine all sources to determine environment
  const urlSources = [host, origin, referer, xForwardedHost].join(' ').toLowerCase()

  // Log for debugging
  console.log('Environment detection sources:', { host, origin, referer, xForwardedHost, urlSources })

  // Check for local development
  if (
    urlSources.includes('localhost') ||
    urlSources.includes('127.0.0.1') ||
    urlSources.includes('192.168.') ||
    urlSources.includes(':3000') ||
    urlSources.includes(':3001')
  ) {
    return 'local'
  }

  // Check for staging (Vercel preview/staging)
  if (
    urlSources.includes('vercel.app') ||
    urlSources.includes('staging') ||
    urlSources.includes('preview')
  ) {
    return 'staging'
  }

  // Everything else is production (mybidly.io or custom domains)
  return 'production'
}

/**
 * Get environment label for display
 */
export function getEnvironmentDisplayName(env: RegistrationEnvironment | null): string {
  switch (env) {
    case 'local':
      return 'Local'
    case 'staging':
      return 'Dev'
    case 'production':
      return 'Live'
    default:
      return 'Unknown'
  }
}
