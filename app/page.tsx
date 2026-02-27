'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Testimonials } from '@/components/Testimonials'
import { FAQ } from '@/components/FAQ'
import { DemoPreview } from '@/components/DemoPreview'
import { landingTranslations, type Language } from '@/lib/translations/landing'

export default function Home() {
  const [lang, setLang] = useState<Language>('en')
  const t = landingTranslations[lang]

  return (
    <div className="min-h-screen bg-white">
      {/* German Banner - Fixed Top Left */}
      {lang === 'de' && (
        <div className="fixed top-4 left-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 animate-bounce">
          <span className="text-lg">🎉</span>
          <span className="text-sm font-semibold">
            Jetzt live in Deutschland, Österreich und Schweiz
          </span>
        </div>
      )}

      {/* Header - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50 flex gap-3">
        {/* Login Button */}
        <Link
          href="/login"
          className="bg-white rounded-lg shadow-lg px-6 py-2 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          {lang === 'en' ? 'Login' : 'Anmelden'}
        </Link>

        {/* Language Toggle */}
        <div className="flex gap-2 bg-white rounded-lg shadow-lg p-1 border border-gray-200">
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
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <h1 className="text-6xl sm:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                myBidly
              </span>
            </h1>

            {/* Main Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t.hero.title}
            </h2>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-lg font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                {t.hero.cta}
              </Link>
              <a
                href="#demo"
                className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg border-2 border-gray-300 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t.hero.trustBadge1}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t.hero.trustBadge2}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t.hero.trustBadge3}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl"></div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.problem.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.problem.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[t.problem.pain1, t.problem.pain2, t.problem.pain3].map((pain, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pain.title}</h3>
                <p className="text-gray-600">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[t.howItWorks.step1, t.howItWorks.step2, t.howItWorks.step3].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-3xl font-bold text-white">{idx + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                {/* Connector Arrow (desktop only) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-12 h-1 bg-purple-200 transform -translate-x-1/2">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <div id="demo">
        <DemoPreview lang={lang} />
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.benefits.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.benefits.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '💰', ...t.benefits.benefit1 },
              { icon: '⚡', ...t.benefits.benefit2 },
              { icon: '🤖', ...t.benefits.benefit3 },
              { icon: '📧', ...t.benefits.benefit4 },
              { icon: '📦', ...t.benefits.benefit5 },
              { icon: '🇪🇺', ...t.benefits.benefit6 },
            ].map((benefit, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials lang={lang} />

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-xl text-purple-100 mb-12">
            {t.pricing.subtitle}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pay-As-You-Go Plan */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.pricing.payg.name}
              </h3>
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {t.pricing.payg.price}
              </div>
              <div className="text-gray-600 text-sm mb-2">
                {t.pricing.payg.priceNote}
              </div>
              <div className="text-gray-500 text-sm mb-6">
                {t.pricing.payg.desc}
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {[t.pricing.payg.feature1, t.pricing.payg.feature2, t.pricing.payg.feature3, t.pricing.payg.feature4, t.pricing.payg.feature5].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-block w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {t.pricing.payg.cta}
              </Link>
              <p className="text-gray-500 text-xs mt-4">
                {t.pricing.payg.note}
              </p>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-8 border-4 border-yellow-400 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                {t.pricing.premium.badge}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.pricing.premium.name}
              </h3>
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {t.pricing.premium.price}
              </div>
              <div className="text-gray-600 text-sm mb-2">
                {t.pricing.premium.priceNote}
              </div>
              <div className="text-gray-500 text-sm mb-6">
                {t.pricing.premium.desc}
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {[t.pricing.premium.feature1, t.pricing.premium.feature2, t.pricing.premium.feature3, t.pricing.premium.feature4, t.pricing.premium.feature5].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-block w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {t.pricing.premium.cta}
              </Link>
              <p className="text-gray-500 text-xs mt-4">
                {t.pricing.premium.note}
              </p>
            </div>
          </div>

          <p className="text-white text-sm mt-8">
            {t.finalCta.guarantee}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <FAQ lang={lang} />

      {/* Final CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t.finalCta.title}
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            {t.finalCta.subtitle}
          </p>

          <Link
            href="/register"
            className="inline-block px-12 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xl font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all mb-4"
          >
            {t.finalCta.cta}
          </Link>

          <p className="text-slate-400 text-sm mt-4">
            ✓ {t.finalCta.guarantee}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
              <h4 className="font-semibold text-white mb-3">{t.footer.product}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-purple-400 transition">{t.footer.links.features}</Link></li>
                <li><Link href="/register" className="hover:text-purple-400 transition">{t.footer.links.pricing}</Link></li>
                <li><a href="#demo" className="hover:text-purple-400 transition">{t.footer.links.demo}</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-white mb-3">{t.footer.company}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="https://www.next-commerce.io" className="hover:text-purple-400 transition">{t.footer.links.about}</Link></li>
                <li><Link href="mailto:support@mybidly.io" className="hover:text-purple-400 transition">{t.footer.links.contact}</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-white mb-3">{t.footer.support}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-purple-400 transition">{t.footer.links.faq}</a></li>
                <li><Link href="mailto:support@mybidly.io" className="hover:text-purple-400 transition">{t.footer.links.docs}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>{t.footer.copyright}</p>
            <p className="mt-2 md:mt-0">
              {t.footer.poweredBy}{' '}
              <a
                href="https://www.next-commerce.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition"
              >
                Next Commerce
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
