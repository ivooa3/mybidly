'use client'

import { useState } from 'react'
import { landingTranslations, type Language } from '@/lib/translations/landing'

interface DemoPreviewProps {
  lang: Language
}

export function DemoPreview({ lang }: DemoPreviewProps) {
  const t = landingTranslations[lang].demo
  const [bidAmount, setBidAmount] = useState(35)
  const minPrice = 25
  const maxPrice = 50

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(Number(e.target.value))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-slate-300 mb-2">
            {t.subtitle}
          </p>
          <p className="text-sm text-purple-400">
            {t.note}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Demo Widget Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* myBidly Header Bar */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3">
              <span className="text-white text-sm font-semibold">myBidly</span>
            </div>

            {/* Widget Content */}
            <div className="p-6">
              {/* Product Image */}
              <div className="mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden aspect-video flex items-center justify-center p-8">
                <img
                  src="/mybidly-product-demo.png"
                  alt="USB Type-C Cable"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Product Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {lang === 'en' ? 'USB Type-C Kabel' : 'USB Type-C Kabel'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {lang === 'en' ? 'Want this product at a special price?' : 'Möchten Sie dieses Produkt zum Sonderpreis?'}
              </p>

              {/* Bid Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {lang === 'en' ? 'Your Bid' : 'Ihr Gebot'}
                </label>

                <div className="mb-3">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    step="0.5"
                    value={bidAmount}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${((bidAmount - minPrice) / (maxPrice - minPrice)) * 100}%, rgb(233 213 255) ${((bidAmount - minPrice) / (maxPrice - minPrice)) * 100}%, rgb(233 213 255) 100%)`
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">€{minPrice}</span>
                  <span className="text-2xl font-bold text-purple-600">€{bidAmount.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">€{maxPrice}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {lang === 'en' ? 'incl. VAT' : 'inkl. MwSt.'}
                </p>
              </div>

              {/* CTA Button */}
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                {lang === 'en' ? 'Submit Your Bid' : 'Gebot abgeben'}
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-300 text-sm text-center">
              {lang === 'en'
                ? '👆 This is what your customers will see on your Thank you page'
                : '👆 Das sehen Ihre Kunden auf Ihrer Dankesseite'}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(147 51 234);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(147 51 234);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </section>
  )
}
