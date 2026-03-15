import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: error.flatten().fieldErrors
    },
    { status: 400 }
  )
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}

export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  )
}

export function serverErrorResponse(error: unknown) {
  console.error('Server error:', error)

  // Enhanced error logging for debugging
  if (error && typeof error === 'object') {
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
      // Prisma-specific error info
      ...(('code' in error) && { prismaCode: (error as any).code }),
      ...(('meta' in error) && { prismaMeta: (error as any).meta }),
    })
  }

  // Only show error details in development mode
  const showDetails = process.env.NODE_ENV === 'development'

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      // Include error message in development only
      ...(showDetails && {
        details: (error as Error)?.message || 'Unknown error',
        errorType: (error as Error)?.name || 'Error',
        ...(error && typeof error === 'object' && 'code' in error && {
          prismaCode: (error as any).code
        })
      })
    },
    { status: 500 }
  )
}
