'use client'

import { useState } from 'react'
import { landingTranslations, type Language } from '@/lib/translations/landing'

interface DemoPreviewProps {
  lang: Language
}

export function DemoPreview({ lang }: DemoPreviewProps) {
  const t = landingTranslations[lang].demo
  const [bidAmount, setBidAmount] = useState(35)
  const [currentSlide, setCurrentSlide] = useState(1) // 0 = create, 1 = widget, 2 = thank you
  const minPrice = 25
  const maxPrice = 50

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(Number(e.target.value))
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
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

        <div className="max-w-md mx-auto relative">
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 0: Create Product Form */}
              <div className="w-full flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* myBidly Header Bar */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center justify-between">
                    <span className="text-white text-sm font-semibold">myBidly Dashboard</span>
                  </div>

                  {/* Create Product Form */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {lang === 'en' ? 'Create New Offer' : 'Neues Angebot erstellen'}
                    </h3>

                    <div className="space-y-4">
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {lang === 'en' ? 'Product Name' : 'Produktname'}
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          value="USB Type-C Kabel"
                          readOnly
                        />
                      </div>

                      {/* Product Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {lang === 'en' ? 'Product Image' : 'Produktbild'}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-2 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-gray-500">✓ Image uploaded</p>
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {lang === 'en' ? 'Min Price' : 'Mindestpreis'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">€</span>
                            <input
                              type="text"
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              value="25"
                              readOnly
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {lang === 'en' ? 'Max Price' : 'Maximalpreis'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">€</span>
                            <input
                              type="text"
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              value="50"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {lang === 'en' ? 'Stock Quantity' : 'Lagerbestand'}
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          value="100"
                          readOnly
                        />
                      </div>

                      {/* Create Button */}
                      <button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        {lang === 'en' ? 'Create Offer' : 'Angebot erstellen'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 1: Bidding Widget (Current) */}
              <div className="w-full flex-shrink-0">
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
                      USB Type-C Kabel
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      {lang === 'en' ? 'Want this product at a special price?' : 'Möchtest du dieses Produkt zum Sonderpreis?'}
                    </p>

                    {/* Bid Slider */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {lang === 'en' ? 'Your Bid' : 'Dein Gebot'}
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

                    {/* CTA Buttons */}
                    <div className="flex gap-3">
                      <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        {lang === 'en' ? 'Make Your Bid' : 'Gebot abgeben'}
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        {lang === 'en' ? 'Buy It Instantly' : 'Sofort kaufen'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Thank You Page */}
              <div className="w-full flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* myBidly Header Bar */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3">
                    <span className="text-white text-sm font-semibold">myBidly</span>
                  </div>

                  {/* Thank You Content */}
                  <div className="p-6 text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    {/* Thank You Message */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {lang === 'en' ? 'Thank You For Your Bid!' : 'Danke für Dein Gebot!'}
                    </h3>

                    <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-lg font-semibold text-purple-900 mb-1">
                        {lang === 'en' ? 'Your Bid:' : 'Dein Gebot:'}
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        €{bidAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {lang === 'en' ? 'USB Type-C Kabel' : 'USB Type-C Kabel'}
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-700 mb-2">
                        {lang === 'en'
                          ? 'We\'re reviewing your bid now.'
                          : 'Wir prüfen dein Gebot jetzt.'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {lang === 'en'
                          ? 'You\'ll receive a response shortly via email (10-20 minutes).'
                          : 'Du erhältst in Kürze eine Antwort per E-Mail (10-20 Minuten).'}
                      </p>
                    </div>

                    {/* Email Icon */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {lang === 'en' ? 'Check your email inbox' : 'Prüfe dein E-Mail-Postfach'}
                      </span>
                    </div>

                    {/* Continue Button */}
                    <button className="w-full bg-gradient-to-r from-slate-600 to-slate-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                      {lang === 'en' ? 'Continue Shopping' : 'Weiter einkaufen'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all"
            aria-label="Next slide"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'w-8 bg-purple-500'
                    : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-300 text-sm text-center">
              {currentSlide === 0 && (lang === 'en'
                ? '👈 Create your product offer in the dashboard'
                : '👈 Erstelle dein Produktangebot im Dashboard')}
              {currentSlide === 1 && (lang === 'en'
                ? '👆 This is what your customers will see on your Thank you page'
                : '👆 Das sehen deine Kunden auf deiner Dankesseite')}
              {currentSlide === 2 && (lang === 'en'
                ? '👉 Customers receive confirmation and wait for your decision'
                : '👉 Kunden erhalten Bestätigung und warten auf deine Entscheidung')}
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
