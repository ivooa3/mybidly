'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
        subheadline: "That widget on the thank-you page you just came from? It earns that shop extra revenue on every order — automatically. You can have one too.",
        cta: 'Get Started Free — No Credit Card Needed'
      },
      demo: {
        badge: 'LIVE DEMO',
        thankYou: 'Order confirmed!',
        productName: 'Premium Wireless Headphones',
        bidButton: 'Make Your Bid',
        bidConfirm: 'Thank you for your bid!',
        dashboardTitle: 'New bid received',
        accepted: 'Auto-accepted'
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
        subheadline: "Das Widget auf der Danke-Seite, von der Sie kamen? Es generiert für diesen Shop bei jeder Bestellung automatisch Zusatzumsatz. Das können Sie auch haben.",
        cta: 'Kostenlos starten — Keine Kreditkarte nötig'
      },
      demo: {
        badge: 'LIVE DEMO',
        thankYou: 'Bestellung bestätigt!',
        productName: 'Premium Wireless Kopfhörer',
        bidButton: 'Gebot abgeben',
        bidConfirm: 'Vielen Dank für Ihr Gebot!',
        dashboardTitle: 'Neues Gebot erhalten',
        accepted: 'Automatisch akzeptiert'
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .font-display {
          font-family: 'DM Serif Display', serif;
        }

        .font-sans {
          font-family: 'DM Sans', sans-serif;
        }

        /* Animated demo styles */
        @keyframes slideInWidget {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideSlider {
          from {
            left: 0%;
          }
          to {
            left: 60%;
          }
        }

        @keyframes pulseButton {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes greenPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
        }

        .demo-act-1 .widget {
          animation: slideInWidget 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .demo-act-2 .slider-thumb {
          animation: slideSlider 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.5s;
        }

        .demo-act-2 .bid-button {
          animation: pulseButton 0.6s ease-in-out 3;
          animation-delay: 2s;
        }

        .demo-act-2 .bid-confirm {
          animation: fadeInOut 2s ease-in-out forwards;
          animation-delay: 2.8s;
        }

        .demo-act-3 .confetti-piece {
          animation: confetti 1s ease-out forwards;
        }

        .demo-act-3 .dashboard-card {
          animation: greenPulse 1.5s ease-in-out;
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
          className={`px-4 py-2 rounded-md text-sm font-medium font-sans transition ${
            lang === 'en'
              ? 'bg-[#e0aa3e] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          🇬🇧 EN
        </button>
        <button
          onClick={() => setLang('de')}
          className={`px-4 py-2 rounded-md text-sm font-medium font-sans transition ${
            lang === 'de'
              ? 'bg-[#e0aa3e] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          🇩🇪 DE
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f0f0f] text-white pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-5xl font-display text-[#e0aa3e] mb-2">
              myBidly
            </h1>
            <p className="text-gray-400 font-sans text-lg">
              Turn Your Thank-You Page Into Revenue
            </p>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display mb-6 leading-tight">
            <span className="text-[#e0aa3e]">{content.hero.headline.split(' ')[0]}</span>{' '}
            {content.hero.headline.split(' ').slice(1).join(' ')}
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 font-sans mb-10 max-w-3xl mx-auto leading-relaxed">
            {content.hero.subheadline}
          </p>

          {/* CTA Button */}
          <Link
            href="https://www.mybidly.io/register"
            className="inline-block px-8 py-4 bg-[#e0aa3e] text-[#0f0f0f] text-lg font-bold font-sans rounded-lg hover:bg-[#d4a03a] hover:shadow-2xl transition-all transform hover:scale-105"
          >
            {content.hero.cta}
          </Link>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e0aa3e] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00819e] rounded-full opacity-5 blur-3xl"></div>
      </section>

      {/* Animated Product Demo */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <AnimatedDemo content={content.demo} />
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-gray-50 fade-in-scroll">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <p className="text-xl font-sans font-semibold text-gray-900">
                {content.valueProps.setup}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💶</div>
              <p className="text-xl font-sans font-semibold text-gray-900">
                {content.valueProps.pricing}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <p className="text-xl font-sans font-semibold text-gray-900">
                {content.valueProps.automated}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#0f0f0f] text-white fade-in-scroll">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-display mb-8 leading-tight">
            {content.cta.headline}
          </h3>

          <Link
            href="https://www.mybidly.io/register"
            className="inline-block px-12 py-5 bg-[#e0aa3e] text-[#0f0f0f] text-xl font-bold font-sans rounded-lg hover:bg-[#d4a03a] hover:shadow-2xl transition-all transform hover:scale-105 mb-4"
          >
            {content.cta.button}
          </Link>

          <p className="text-gray-400 font-sans text-sm">
            {content.cta.subtext}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-gray-500 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center font-sans text-sm">
          <p>
            {content.footer.company}{' '}
            <a
              href="https://www.next-commerce.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e0aa3e] hover:text-[#d4a03a] transition"
            >
              next-commerce.io
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function AnimatedDemo({ content }: { content: any }) {
  const [act, setAct] = useState<1 | 2 | 3>(1)
  const [sliderValue, setSliderValue] = useState(20)

  useEffect(() => {
    // Act 1: Show widget (2s)
    setAct(1)
    setSliderValue(20)

    const timer1 = setTimeout(() => {
      setAct(2) // Act 2: Slider moves and bid
    }, 2000)

    const timer2 = setTimeout(() => {
      setSliderValue(60)
    }, 2800)

    const timer3 = setTimeout(() => {
      setAct(3) // Act 3: Dashboard celebration
    }, 6000)

    const timer4 = setTimeout(() => {
      setAct(1) // Loop back
      setSliderValue(20)
    }, 9000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  // Restart loop
  useEffect(() => {
    if (act === 1) {
      const interval = setInterval(() => {
        setAct(1)
        setSliderValue(20)

        setTimeout(() => setAct(2), 2000)
        setTimeout(() => setSliderValue(60), 2800)
        setTimeout(() => setAct(3), 6000)
        setTimeout(() => {
          setAct(1)
          setSliderValue(20)
        }, 9000)
      }, 10500)

      return () => clearInterval(interval)
    }
  }, [act])

  return (
    <div className="relative">
      {/* LIVE DEMO Badge */}
      <div className="absolute -top-3 left-6 z-10 bg-red-500 text-white text-xs font-bold font-sans px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        {content.badge}
      </div>

      {/* Browser Chrome Frame */}
      <div className="bg-gray-100 rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Fake URL Bar */}
        <div className="bg-gray-200 px-4 py-3 flex items-center gap-2 border-b border-gray-300">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 ml-4">
            <div className="bg-white rounded px-3 py-1 text-sm text-gray-600 font-sans">
              mybidly.io/widget
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className={`relative bg-white h-[500px] md:h-[600px] overflow-hidden demo-act-${act}`}>
          {/* Act 1 & 2: Thank-you page with widget */}
          {(act === 1 || act === 2) && (
            <div className="absolute inset-0 flex flex-col">
              {/* Thank-you message */}
              <div className="bg-green-50 border-b border-green-200 px-6 py-8 text-center">
                <div className="text-green-600 text-5xl mb-2">✓</div>
                <h3 className="text-2xl font-bold font-display text-gray-900">
                  {content.thankYou}
                </h3>
              </div>

              {/* Widget slides in */}
              <div className="widget absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl rounded-t-2xl p-6">
                {/* Product Image */}
                <div className="mb-4">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <div className="text-6xl">🎧</div>
                  </div>
                </div>

                {/* Product Name */}
                <h4 className="text-xl font-bold font-sans text-gray-900 mb-4">
                  {content.productName}
                </h4>

                {/* Price Slider */}
                <div className="mb-6">
                  <div className="relative h-2 bg-gray-200 rounded-full mb-2">
                    <div
                      className="absolute h-full bg-[#e0aa3e] rounded-full transition-all duration-1000"
                      style={{ width: `${sliderValue}%` }}
                    ></div>
                    <div
                      className="slider-thumb absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#e0aa3e] rounded-full shadow-lg"
                      style={{ left: `${sliderValue}%`, transform: 'translate(-50%, -50%)' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-sans">
                    <span>€20</span>
                    <span className="text-xl font-bold text-[#e0aa3e]">
                      €{Math.round(20 + (sliderValue / 100) * 30)}
                    </span>
                    <span>€50</span>
                  </div>
                </div>

                {/* Bid Button */}
                <button className="bid-button w-full bg-gradient-to-r from-[#e0aa3e] to-[#d4a03a] text-white py-3 rounded-lg font-bold font-sans text-lg shadow-lg">
                  {content.bidButton}
                </button>

                {/* Bid Confirmation Overlay */}
                {act === 2 && (
                  <div className="bid-confirm absolute inset-0 bg-white/95 backdrop-blur flex items-center justify-center rounded-t-2xl">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold font-display text-gray-900">
                        {content.bidConfirm}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Act 3: Dashboard view */}
          {act === 3 && (
            <div className="absolute inset-0 bg-gray-50 p-6 flex items-center justify-center">
              <div className="dashboard-card bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-2 border-green-500 relative overflow-hidden">
                {/* Confetti */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="confetti-piece absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '50%',
                      backgroundColor: ['#e0aa3e', '#00819e', '#22c55e'][i % 3],
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}

                <div className="text-center relative z-10">
                  <div className="text-green-500 text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">
                    {content.dashboardTitle}
                  </h3>
                  <div className="text-4xl font-bold text-[#e0aa3e] mb-2">
                    €35.00
                  </div>
                  <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-sans font-semibold">
                    {content.accepted}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
