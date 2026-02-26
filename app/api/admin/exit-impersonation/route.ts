import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear impersonation cookies
    cookieStore.delete('impersonating_as')
    cookieStore.delete('impersonating_from')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Exit impersonation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to exit impersonation' }, { status: 500 })
  }
}
