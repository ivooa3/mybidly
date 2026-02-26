'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/Input'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
}

export function ImageUpload({ value, onChange, error, label = 'Product Image' }: ImageUploadProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect if value is a data URL (uploaded file) to set correct mode
  useEffect(() => {
    if (value && value.startsWith('data:')) {
      setMode('upload')
    }
  }, [value])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (file: File) => {
    setUploadError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB')
      return
    }

    setUploadedFile(file)
    setIsUploading(true)

    try {
      // Convert to base64 data URL for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        onChange(dataUrl)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setUploadError('Failed to read file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setUploadError('Failed to process image')
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setUploadedFile(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => {
            setMode('url')
            handleRemoveImage()
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Image URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upload File
        </button>
      </div>

      {/* URL Input Mode */}
      {mode === 'url' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          placeholder="https://example.com/image.jpg"
          helperText="Enter a direct link to your product image"
        />
      )}

      {/* File Upload Mode */}
      {mode === 'upload' && (
        <div>
          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>

              {isUploading && (
                <p className="mt-2 text-sm text-purple-600">
                  Processing...
                </p>
              )}
            </div>
          ) : (
            <div className="relative">
              <img
                src={value}
                alt="Product preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              {uploadedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </div>
      )}

      {/* Image Preview for URL mode */}
      {mode === 'url' && value && !value.startsWith('data:') && (
        <div className="relative">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
