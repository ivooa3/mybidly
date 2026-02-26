'use client'

import { useState } from 'react'

const emailTypes = [
  { value: 'welcome', label: 'Welcome Email', hasLocale: true },
  { value: 'bid-confirmation', label: 'Bid Confirmation', hasLocale: true },
  { value: 'bid-accepted', label: 'Bid Accepted (Order Confirmation)', hasLocale: true },
  { value: 'bid-declined', label: 'Bid Declined (Refund)', hasLocale: true },
  { value: 'shop-owner', label: 'Shop Owner Order Notification', hasLocale: false },
]

export default function EmailPreviewPage() {
  const [selectedType, setSelectedType] = useState('welcome')
  const [locale, setLocale] = useState<'en' | 'de'>('en')

  const currentEmail = emailTypes.find(e => e.value === selectedType)

  const iframeUrl = `/api/email-preview?type=${selectedType}${currentEmail?.hasLocale ? `&locale=${locale}` : ''}`

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">📧 Email Template Preview</h1>
          <p className="text-gray-600 mt-2">Preview all myBidly email templates with sample data</p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Email Type Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {emailTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            {currentEmail?.hasLocale && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLocale('en')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      locale === 'en'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => setLocale('de')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      locale === 'de'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇩🇪 Deutsch
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Template Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Template Details:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{currentEmail?.label}</span>
              </div>
              {currentEmail?.hasLocale && (
                <div>
                  <span className="text-gray-600">Language:</span>
                  <span className="ml-2 font-medium">
                    {locale === 'en' ? 'English' : 'German (Deutsch)'}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Uses Sample Data:</span>
                <span className="ml-2 font-medium text-green-600">✓ Yes</span>
              </div>
              <div>
                <span className="text-gray-600">Responsive:</span>
                <span className="ml-2 font-medium text-green-600">✓ Yes</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> These templates use realistic sample data (John Doe, Premium Bicycle Helmet, etc.).
              The actual emails will use real customer and order data.
            </p>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3">
            <h2 className="font-semibold">Email Preview</h2>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow-inner" style={{ minHeight: '600px' }}>
              <iframe
                key={iframeUrl}
                src={iframeUrl}
                className="w-full border-0 rounded-lg"
                style={{ minHeight: '600px', height: '100vh' }}
                title="Email Preview"
              />
            </div>
          </div>
        </div>

        {/* Sample Data Reference */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Sample Data Used in Previews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Customer Info:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Name: John Doe</li>
                <li>• Email: customer@example.com</li>
                <li>• Bid Amount: €35.00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Product Info:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Product: Premium Bicycle Helmet</li>
                <li>• SKU: HELMET-001</li>
                <li>• Shop: My Awesome Shop</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Shipping Address:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 123 Main Street, Apt 4</li>
                <li>• 10115 Berlin</li>
                <li>• Germany (DE)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Branding:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Gradient header (purple → pink)</li>
                <li>• myBidly branding</li>
                <li>• "Powered by Next Commerce" footer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">🧪 Want to Send Test Emails?</h3>
          <p className="text-yellow-800 text-sm mb-4">
            You can send actual test emails to your inbox using the test endpoint.
          </p>
          <pre className="bg-yellow-100 border border-yellow-300 rounded p-3 text-xs overflow-x-auto">
{`curl -X POST http://localhost:3000/api/test-email \\
  -H "Content-Type: application/json" \\
  -d '{"type":"${selectedType}","email":"your@email.com"${currentEmail?.hasLocale ? `,"locale":"${locale}"` : ''}}'`}
          </pre>
        </div>
      </div>
    </div>
  )
}
