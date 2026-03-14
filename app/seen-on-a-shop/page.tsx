'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FAQ } from '@/components/FAQ'
import { landingTranslations } from '@/lib/translations/landing'

export default function SeenOnAShopPage() {
  const [lang, setLang] = useState<'en' | 'de'>('en')

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('de')) {
      setLang('de')
    }
  }, [])

  const t = {
    en: {
      hero: {
        headline: 'You just saw myBidly in action.',
        subheadline: "That widget on the thank-you page you just came from? It earns that shop extra revenue on every order — automatically.",
        onlyPayWhenYouSell: "Only pay when you sell.",
        cta: "Get started for free",
        ctaSubtext: "Only pay 8% for successful orders.",
        seePricing: "See pricing"
      },
      demo: {
        badge: 'LIVE DEMO',
        specialOffer: 'Special Offer only for our Customers',
        productName: 'USB Type-C Cable',
        productQuestion: 'Want this product at a special price?',
        yourBid: 'Your Bid',
        inclVat: 'incl. VAT',
        makeYourBid: 'Make Your Bid',
        buyInstantly: 'Buy It Instantly',
        thankYouTitle: 'Thank You For Your Bid!',
        yourBidLabel: 'Your Bid:',
        reviewingBid: 'We\'re reviewing your bid now.',
        emailNotice: 'You\'ll receive a response shortly via email (10-20 minutes).',
        checkEmail: 'Check your email inbox',
        continueShopping: 'Continue Shopping',
        helperSlide1: '👆 This is what your customers see on your thank-you page',
        helperSlide2: '👉 Customers receive confirmation and wait for your decision',
        thankYouOrder: 'Thanks for your order!'
      },
      valueProps: {
        setup: 'Setup in 5 minutes',
        pricing: 'Pay only when you sell (8% per transaction)',
        automated: 'Fully automated — bids, emails, refunds'
      },
      cta: {
        headline: 'Ready to turn your thank-you page into a revenue channel?',
        button: 'Start Free Today',
        subtext: 'No monthly fee. No credit card. Cancel anytime.'
      },
      footer: {
        company: 'myBidly is a Next Commerce company'
      }
    },
    de: {
      hero: {
        headline: 'Sie haben myBidly gerade in Aktion gesehen.',
        subheadline: "Das Widget auf der Danke-Seite, von der Sie kamen? Es generiert für diesen Shop bei jeder Bestellung automatisch Zusatzumsatz.",
        onlyPayWhenYouSell: "Zahle nur bei Verkauf.",
        cta: 'Kostenlos starten',
        ctaSubtext: 'Nur 8% für erfolgreiche Bestellungen bezahlen.',
        seePricing: 'Preise ansehen'
      },
      demo: {
        badge: 'LIVE DEMO',
        specialOffer: 'Sonderangebot nur für unsere Kunden',
        productName: 'USB Type-C Kabel',
        productQuestion: 'Möchtest du dieses Produkt zum Sonderpreis?',
        yourBid: 'Dein Gebot',
        inclVat: 'inkl. MwSt.',
        makeYourBid: 'Gebot abgeben',
        buyInstantly: 'Sofort kaufen',
        thankYouTitle: 'Danke für Dein Gebot!',
        yourBidLabel: 'Dein Gebot:',
        reviewingBid: 'Wir prüfen dein Gebot jetzt.',
        emailNotice: 'Du erhältst in Kürze eine Antwort per E-Mail (10-20 Minuten).',
        checkEmail: 'Prüfe dein E-Mail-Postfach',
        continueShopping: 'Weiter einkaufen',
        helperSlide1: '👆 Das sehen deine Kunden auf deiner Dankesseite',
        helperSlide2: '👉 Kunden erhalten Bestätigung und warten auf deine Entscheidung',
        thankYouOrder: 'Danke für Deine Bestellung!'
      },
      valueProps: {
        setup: 'Einrichtung in 5 Minuten',
        pricing: 'Zahlen Sie nur bei Verkauf (8% pro Transaktion)',
        automated: 'Vollautomatisch — Gebote, E-Mails, Rückerstattungen'
      },
      cta: {
        headline: 'Bereit, Ihre Danke-Seite in einen Umsatzkanal zu verwandeln?',
        button: 'Kostenlos starten',
        subtext: 'Keine monatliche Gebühr. Keine Kreditkarte. Jederzeit kündbar.'
      },
      footer: {
        company: 'myBidly ist ein Unternehmen von Next Commerce'
      }
    }
  }

  const content = t[lang]

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
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

        .fade-in-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Language Toggle - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white/90 backdrop-blur rounded-lg shadow-lg p-1 border border-gray-200">
        <button
          onClick={() => setLang('en')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            lang === 'en'
              ? 'bg-purple-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          🇬🇧 EN
        </button>
        <button
          onClick={() => setLang('de')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            lang === 'de'
              ? 'bg-purple-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          🇩🇪 DE
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo/Brand */}
            <h1 className="text-6xl sm:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                myBidly
              </span>
            </h1>

            {/* Main Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {content.hero.headline}
            </h2>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              {content.hero.subheadline}
            </p>

            {/* Only Pay When You Sell */}
            <p className="text-xl sm:text-2xl font-bold text-purple-600 mb-10 max-w-3xl mx-auto">
              {content.hero.onlyPayWhenYouSell}
            </p>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-3 mb-12">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-lg font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                {content.hero.cta}
              </Link>
              <p className="text-sm text-gray-600">
                {content.hero.ctaSubtext}{' '}
                <a
                  href="/#pricing"
                  className="text-purple-600 hover:text-purple-700 underline font-medium"
                >
                  {content.hero.seePricing}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl"></div>
      </section>

      {/* Interactive Product Demo */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              {lang === 'en' ? 'See It In Action' : 'In Aktion sehen'}
            </h2>
            <p className="text-xl text-slate-300">
              {lang === 'en'
                ? 'Try the interactive demo — drag the slider, place a bid'
                : 'Probiere die interaktive Demo — ziehe den Slider, gib ein Gebot ab'}
            </p>
          </div>

          <InteractiveDemo content={content.demo} lang={lang} />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ lang={lang} />

      {/* Final CTA Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
            {content.cta.headline}
          </h3>

          <Link
            href="/register"
            className="inline-block px-12 py-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xl font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all mb-4"
          >
            {content.cta.button}
          </Link>

          <p className="text-gray-400 text-sm">
            {content.cta.subtext}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-4">
                myBidly
              </h3>
              <p className="text-sm text-slate-500">
                {lang === 'en' ? 'Turn Thank-You Pages Into More Sales' : 'Verwandeln Sie Danke-Seiten in mehr Verkäufe'}
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white mb-3">{landingTranslations[lang].footer.product}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/#pricing" className="hover:text-purple-400 transition">{landingTranslations[lang].footer.links.pricing}</a></li>
                <li><a href="/#demo" className="hover:text-purple-400 transition">{landingTranslations[lang].footer.links.demo}</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-white mb-3">{landingTranslations[lang].footer.company}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-purple-400 transition">{landingTranslations[lang].footer.links.about}</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-white mb-3">{landingTranslations[lang].footer.support}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-purple-400 transition">{landingTranslations[lang].footer.links.faq}</a></li>
                <li><Link href="mailto:support@mybidly.io" className="hover:text-purple-400 transition">{landingTranslations[lang].footer.links.contact}</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-white mb-3">{lang === 'en' ? 'Legal' : 'Rechtliches'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms-of-service" className="hover:text-purple-400 transition">{lang === 'en' ? 'Terms of Service' : 'AGB'}</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-purple-400 transition">{lang === 'en' ? 'Privacy Policy' : 'Datenschutz'}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>{landingTranslations[lang].footer.copyright}</p>
            <p className="mt-2 md:mt-0">
              {landingTranslations[lang].footer.poweredBy}{' '}
              <a
                href="https://www.next-commerce.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition"
              >
                {landingTranslations[lang].footer.companyName}
              </a>
              {' '}{landingTranslations[lang].footer.companyText}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function InteractiveDemo({ content, lang }: { content: any; lang: 'en' | 'de' }) {
  const [currentSlide, setCurrentSlide] = useState(0) // 0 = widget, 1 = thank you
  const [bidAmount, setBidAmount] = useState(35)
  const minPrice = 25
  const maxPrice = 50

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(Number(e.target.value))
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 2)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="relative">
      {/* LIVE DEMO Badge */}
      <div className="absolute -top-3 left-6 z-10 bg-red-500 text-white text-xs font-bold font-sans px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        {content.badge}
      </div>

      {/* Browser Chrome Frame */}
      <div className="bg-gray-100 rounded-xl shadow-2xl overflow-hidden border border-gray-200 max-w-md mx-auto">
        {/* Fake URL Bar */}
        <div className="bg-gray-200 px-4 py-3 flex items-center gap-2 border-b border-gray-300">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 ml-4">
            <div className="bg-white rounded px-3 py-1 text-sm text-gray-600 font-sans">
              yourshop.com/thank-you
            </div>
          </div>
        </div>

        {/* Demo Content - Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 0: Bidding Widget */}
            <div className="w-full flex-shrink-0">
              <div className="bg-white">
                {/* Thank You Header (context for widget placement) */}
                <div className="bg-green-50 border-b border-green-200 px-6 py-6 text-center">
                  <div className="text-green-600 text-4xl mb-2">✓</div>
                  <h3 className="text-xl font-bold font-sans text-gray-900">
                    {content.thankYouOrder}
                  </h3>
                </div>

                {/* myBidly Widget */}
                <div className="border-t-2 border-purple-200 bg-white">
                  {/* Widget Content */}
                  <div className="p-6">
                    {/* Special Offer Headline */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      {content.specialOffer}
                    </h2>
                    {/* Product Image */}
                    <div className="mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden aspect-video flex items-center justify-center p-8">
                      <img
                        src="/mybidly-product-demo.png"
                        alt={content.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {content.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      {content.productQuestion}
                    </p>

                    {/* Bid Slider */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {content.yourBid}
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
                        {content.inclVat}
                      </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={nextSlide}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {content.makeYourBid}
                      </button>
                      <button
                        onClick={nextSlide}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {content.buyInstantly}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 1: Thank You Page */}
            <div className="w-full flex-shrink-0">
              <div className="bg-white">
                {/* myBidly Header Bar */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3">
                  <span className="text-white text-sm font-semibold">myBidly</span>
                </div>

                {/* Thank You Content */}
                <div className="p-6 text-center min-h-[500px] flex flex-col justify-center">
                  {/* Success Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  {/* Thank You Message */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {content.thankYouTitle}
                  </h3>

                  <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-lg font-semibold text-purple-900 mb-1">
                      {content.yourBidLabel}
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      €{bidAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      {content.productName}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                      {content.reviewingBid}
                    </p>
                    <p className="text-sm text-gray-600">
                      {content.emailNotice}
                    </p>
                  </div>

                  {/* Email Icon */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{content.checkEmail}</span>
                  </div>

                  {/* Continue Button */}
                  <button className="w-full bg-gradient-to-r from-slate-600 to-slate-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                    {content.continueShopping}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {[0, 1].map((index) => (
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
          {currentSlide === 0 && content.helperSlide1}
          {currentSlide === 1 && content.helperSlide2}
        </p>
      </div>
    </div>
  )
}
