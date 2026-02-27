/**
 * Detect which environment a user is from based on their shop URL or creation context
 */

export type Environment = 'local' | 'staging' | 'production' | 'unknown'

export function detectEnvironment(shopUrl: string | null, createdAt: Date): Environment {
  if (!shopUrl) {
    return 'unknown'
  }

  const url = shopUrl.toLowerCase()

  // Local environment
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.')) {
    return 'local'
  }

  // Staging environment
  if (url.includes('staging') || url.includes('vercel.app') || url.includes('preview')) {
    return 'staging'
  }

  // Production environment (mybidly.io or custom domains)
  if (url.includes('mybidly.io') || url.includes('bidupseller')) {
    return 'production'
  }

  // Fallback: if created before a certain date, assume production
  // If recent and no URL, might be testing
  const monthsOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (monthsOld > 1) {
    return 'production'
  }

  return 'unknown'
}

export function getEnvironmentBadgeColor(env: Environment): string {
  switch (env) {
    case 'local':
      return 'bg-gray-100 text-gray-800'
    case 'staging':
      return 'bg-yellow-100 text-yellow-800'
    case 'production':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function getEnvironmentLabel(env: Environment): string {
  switch (env) {
    case 'local':
      return 'Local'
    case 'staging':
      return 'Staging'
    case 'production':
      return 'Live'
    default:
      return 'Unknown'
  }
}
