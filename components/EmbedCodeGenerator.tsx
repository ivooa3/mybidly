'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLanguage } from '@/contexts/LanguageContext'

interface EmbedCodeGeneratorProps {
  shopId: string
}

export function EmbedCodeGenerator({ shopId }: EmbedCodeGeneratorProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [showAdvancedOption, setShowAdvancedOption] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'

  // Basic embed URL (without productId - for preview)
  const embedUrl = `${baseUrl}/widget?shopId=${shopId}`

  // Simplified iframe code without productId (MVP version)
  const iframeCode = '<!-- myBidly Widget -->\n' +
    '<iframe\n' +
    '  src="' + baseUrl + '/widget?shopId=' + shopId + '"\n' +
    '  width="100%"\n' +
    '  height="800"\n' +
    '  frameborder="0"\n' +
    '  style="border: none; max-width: 1200px; margin: 0 auto; display: block;"\n' +
    '></iframe>'

  // Simplified script code without productId (MVP version)
  const widgetBaseUrl = baseUrl + '/widget?shopId=' + shopId
  const scriptCode = '<!-- myBidly Widget -->\n' +
    '<div id="bidly-widget"></div>\n' +
    '<script>\n' +
    '(function() {\n' +
    '  var iframe = document.createElement(\'iframe\');\n' +
    '  iframe.src = \'' + widgetBaseUrl + '\';\n' +
    '  iframe.width = \'100%\';\n' +
    '  iframe.height = \'800\';\n' +
    '  iframe.frameBorder = \'0\';\n' +
    '  iframe.style.border = \'none\';\n' +
    '  iframe.style.maxWidth = \'1200px\';\n' +
    '  iframe.style.margin = \'0 auto\';\n' +
    '  iframe.style.display = \'block\';\n' +
    '  document.getElementById(\'bidly-widget\').appendChild(iframe);\n' +
    '})();\n' +
    '</script>'

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.embed.preview}</h3>

        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            width="100%"
            height="700"
            frameBorder="0"
            style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* Embed Code - Highlighted */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🎯</span>
          <div>
            <h3 className="text-xl font-bold text-purple-900">{t.embed.yourEmbedCode}</h3>
            <p className="text-sm text-purple-700">{t.embed.copyInstruction}</p>
          </div>
        </div>

        {/* Main iframe code - highlighted */}
        <div className="bg-white rounded-lg p-5 border-2 border-purple-400">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 text-lg">{t.embed.iframeEmbed}</h4>
              <span className="text-xs font-bold text-white bg-green-600 px-3 py-1 rounded-full">✓ {t.embed.recommended}</span>
            </div>
            <Button
              onClick={() => handleCopy(iframeCode)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              size="sm"
            >
              {copied ? `✓ ${t.embed.copied}` : `📋 ${t.embed.copyCode}`}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <strong>👉 {t.embed.thisIsAllYouNeed}</strong> {t.embed.justCopyPaste}
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono border-2 border-gray-700">
            <code>{iframeCode}</code>
          </pre>
        </div>

        {/* Advanced option - collapsible */}
        <div className="mt-6">
          <button
            onClick={() => setShowAdvancedOption(!showAdvancedOption)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-lg">{showAdvancedOption ? '▼' : '▶'}</span>
            <span className="font-medium">{t.embed.advanced}</span>
            <span className="text-xs text-gray-500">{t.embed.advancedNote}</span>
          </button>

          {showAdvancedOption && (
            <div className="mt-4 space-y-4">
              {/* Comparison guide */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">❓ {t.embed.whichOption}</h3>
                <p className="text-sm text-purple-800 mb-4">
                  {t.embed.notSure}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Option 1 Card */}
                  <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <span className="text-2xl mr-2">✅</span>
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">{t.embed.option1Title}</h4>
                        <span className="text-xs font-medium text-white bg-green-600 px-2 py-1 rounded">{t.embed.recommended}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>{t.embed.bestFor}:</strong> {t.embed.mostPlatforms}
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-3">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>{t.embed.easiestInstall}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>{t.embed.worksEverywhere}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>{t.embed.noTechnical}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>{t.embed.safeSecure}</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 italic">
                      💡 {t.embed.likeYoutube}
                    </p>
                  </div>

                  {/* Option 2 Card */}
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <span className="text-2xl mr-2">⚙️</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{t.embed.option2Title}</h4>
                        <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded">{t.embed.advancedUsers}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>{t.embed.bestFor}:</strong> {t.embed.platformsNoHTML}
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 mb-3">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{t.embed.createsDynamic}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{t.embed.sameResponsive}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{t.embed.requiresJS}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{t.embed.usefulIfBlocked}</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 italic">
                      💡 {t.embed.sameResult}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-900">
                    <strong>{t.embed.stillUnsure}</strong> {t.embed.startWithOption1}
                  </p>
                </div>
              </div>

              {/* JavaScript embed code */}
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{t.embed.option2Title}</h4>
                    <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded">{t.embed.advancedUsers}</span>
                  </div>
                  <Button
                    onClick={() => handleCopy(scriptCode)}
                    variant="secondary"
                    size="sm"
                  >
                    {copied ? `✓ ${t.embed.copied}` : t.embed.copyCode}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {t.embed.advancedNote}
                </p>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
                  <code>{scriptCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 {t.embed.quickSetup}</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>{t.embed.step1}</li>
          <li>{t.embed.step2}</li>
          <li>{t.embed.step3}</li>
          <li>{t.embed.step4}</li>
          <li>{t.embed.step5}</li>
        </ol>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
          <p className="text-sm text-yellow-900 mb-2">
            <strong>🔒 {t.embed.securityNote}</strong> {t.embed.securityText}
          </p>
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-900">
            <strong>✓ {t.embed.thatsIt}</strong> {t.embed.autoShow}
          </p>
        </div>

        <div className="mt-4 p-4 bg-white rounded border border-blue-300">
          <p className="text-sm font-medium text-blue-900 mb-2">{t.embed.yourShopId}</p>
          <code className="text-sm text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded">
            {shopId}
          </code>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.embed.technicalDetails}</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-40">{t.embed.widgetUrl}</span>
            <code className="flex-1 text-purple-600 break-all">{embedUrl}</code>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-40">{t.embed.dimensions}</span>
            <span>{t.embed.dimensionsValue}</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-40">{t.embed.security}</span>
            <span>{t.embed.securityValue}</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-40">{t.embed.payment}</span>
            <span>{t.embed.paymentValue}</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-40">{t.embed.language}</span>
            <span>{t.embed.languageValue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
