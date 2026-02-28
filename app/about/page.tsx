'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type Language } from '@/lib/translations/landing'

export default function AboutPage() {
  const [lang, setLang] = useState<Language>('en')

  const content = {
    en: {
      title: "About Us",
      subtitle: "The story behind myBidly",

      intro: "myBidly was born from a simple observation: online shops were leaving money on the table, every single day.",

      paulTitle: "Meet Paul",
      paulRole: "Innovation Lead at Next Commerce",
      paulStory: "Paul worked at Next Commerce building e-commerce solutions for clients. He noticed a pattern: shops invested heavily in driving traffic, only to watch customers disappear after checkout. \"We help them make the first sale,\" he'd say, \"but then we just let them leave.\" This frustrated him deeply.",

      sventjeTitle: "Meet Sventje",
      sventjeRole: "Product Strategist at Next Commerce",
      sventjeStory: "Sventje joined Next Commerce after running her own sustainable outdoor gear store. She experienced the post-checkout problem firsthand and tried every upsell tool available. They all felt pushy and killed conversions. She wanted something different - something that gave customers control.",

      meetingTitle: "The Internal Pitch",
      meetingStory: "At a Next Commerce team meeting, Sventje shared her idea: \"What if customers could bid on thank-you pages?\" Paul immediately saw the potential. Next Commerce encouraged internal innovation, so they pitched it. The leadership team gave them the green light to build it as an internal product. This was exactly what they'd always dreamed of - creating their own innovative solution.",

      resultTitle: "The Launch",
      resultStory: "They built the first version in three weeks and tested it with a pilot shop. First month: €2,400 in extra revenue. Customers loved it. It felt like a game, not a sales tactic. The Next Commerce team was thrilled. They gave Paul and Sventje full support to turn myBidly into a standalone product under the Next Commerce umbrella.",

      missionTitle: "Our Mission",
      missionText: "Today, myBidly helps hundreds of solo-preneurs and small businesses across Europe turn their thank-you pages into revenue engines. We built this for people like Sventje - passionate shop owners who care about their customers and want to grow sustainably.",

      differenceTitle: "What makes us different?",
      difference1: "We believe in customer empowerment",
      difference1Text: "Bidding gives customers control. It's not about tricking them into buying more - it's about giving them a fair chance to get products they actually want.",
      difference2: "We support the underdogs",
      difference2Text: "Big corporations have massive teams and budgets for optimization. Solo-preneurs and SMEs don't. We level the playing field by making sophisticated post-purchase strategies accessible to everyone.",
      difference3: "We're builders, not middlemen",
      difference3Text: "Paul and Sventje aren't investors or consultants. They're operators who understand the daily grind of running an online business. Every feature in myBidly was built to solve a real problem they've lived through.",

      closingTitle: "Our Promise",
      closingText: "We're here for the long haul. Every shop that trusts us with their post-purchase experience is helping us build something that truly makes a difference. Not just for businesses, but for customers who deserve better experiences.",

      ctaText: "Ready to join us?",
      ctaButton: "Start Your Journey",

      backToHome: "← Back to Home"
    },
    de: {
      title: "Über uns",
      subtitle: "Die Geschichte hinter myBidly",

      intro: "myBidly entstand aus einer einfachen Beobachtung: Online-Shops verschenkten jeden Tag Geld.",

      paulTitle: "Das ist Paul",
      paulRole: "Innovationsleiter bei Next Commerce",
      paulStory: "Paul arbeitete bei Next Commerce und baute E-Commerce-Lösungen für Kunden. Er bemerkte ein Muster: Shops investierten massiv in Traffic-Generierung, nur um zuzusehen, wie Kunden nach dem Checkout verschwanden. \"Wir helfen ihnen beim ersten Verkauf\", sagte er oft, \"aber dann lassen wir sie einfach gehen.\" Das frustrierte ihn zutiefst.",

      sventjeTitle: "Das ist Sventje",
      sventjeRole: "Produktstrategin bei Next Commerce",
      sventjeStory: "Sventje kam zu Next Commerce, nachdem sie ihren eigenen Shop für nachhaltige Outdoor-Ausrüstung geführt hatte. Sie erlebte das Post-Checkout-Problem am eigenen Leib und probierte jedes verfügbare Upsell-Tool aus. Alle fühlten sich aufdringlich an und töteten Konversionen. Sie wollte etwas anderes - etwas, das Kunden Kontrolle gibt.",

      meetingTitle: "Der interne Pitch",
      meetingStory: "Bei einem Next Commerce Team-Meeting teilte Sventje ihre Idee: \"Was, wenn Kunden auf Danke-Seiten bieten könnten?\" Paul sah sofort das Potenzial. Next Commerce förderte interne Innovation, also pitchten sie die Idee. Das Leadership-Team gab grünes Licht, es als internes Produkt zu entwickeln. Das war genau das, wovon sie immer geträumt hatten - ihre eigene innovative Lösung zu erschaffen.",

      resultTitle: "Der Launch",
      resultStory: "Sie bauten die erste Version in drei Wochen und testeten sie mit einem Pilot-Shop. Erster Monat: €2.400 zusätzlicher Umsatz. Kunden liebten es. Es fühlte sich wie ein Spiel an, nicht wie eine Verkaufstaktik. Das Next Commerce Team war begeistert. Sie gaben Paul und Sventje volle Unterstützung, myBidly zu einem eigenständigen Produkt unter dem Next Commerce Dach zu entwickeln.",

      missionTitle: "Unsere Mission",
      missionText: "Heute hilft myBidly Hunderten von Solopreneuren und kleinen Unternehmen in ganz Europa, ihre Dankesseiten in Umsatzmaschinen zu verwandeln. Wir haben dies für Menschen wie Sventje gebaut - leidenschaftliche Shop-Besitzer, die sich um ihre Kunden kümmern und nachhaltig wachsen wollen.",

      differenceTitle: "Was uns unterscheidet?",
      difference1: "Wir glauben an Kundenermächtigung",
      difference1Text: "Bieten gibt Kunden Kontrolle. Es geht nicht darum, sie auszutricksen, mehr zu kaufen - es geht darum, ihnen eine faire Chance zu geben, Produkte zu bekommen, die sie wirklich wollen.",
      difference2: "Wir unterstützen die Underdogs",
      difference2Text: "Große Konzerne haben massive Teams und Budgets für Optimierung. Solopreneure und KMUs nicht. Wir schaffen gleiche Bedingungen, indem wir ausgefeilte Post-Purchase-Strategien für jeden zugänglich machen.",
      difference3: "Wir sind Macher, keine Mittelsmänner",
      difference3Text: "Paul und Sventje sind keine Investoren oder Berater. Sie sind Betreiber, die den täglichen Kampf eines Online-Geschäfts verstehen. Jede Funktion in myBidly wurde entwickelt, um ein echtes Problem zu lösen, das sie selbst erlebt haben.",

      closingTitle: "Unser Versprechen",
      closingText: "Wir sind auf lange Sicht hier. Jeder Shop, der uns sein Post-Purchase-Erlebnis anvertraut, hilft uns, etwas aufzubauen, das wirklich einen Unterschied macht. Nicht nur für Unternehmen, sondern für Kunden, die bessere Erfahrungen verdienen.",

      ctaText: "Bereit, mitzumachen?",
      ctaButton: "Starte deine Reise",

      backToHome: "← Zurück zur Startseite"
    }
  }

  const t = content[lang]

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Language Toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-3">
        <Link
          href="/"
          className="bg-white rounded-lg shadow-lg px-6 py-2 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          {t.backToHome}
        </Link>

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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Introduction */}
          <p className="text-xl text-gray-700 leading-relaxed mb-16 text-center italic">
            {t.intro}
          </p>

          {/* Paul's Story */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                P
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{t.paulTitle}</h2>
                <p className="text-purple-600 font-semibold">{t.paulRole}</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.paulStory}
            </p>
          </div>

          {/* Sventje's Story */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                S
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{t.sventjeTitle}</h2>
                <p className="text-purple-600 font-semibold">{t.sventjeRole}</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.sventjeStory}
            </p>
          </div>

          {/* Mission */}
          <div className="mb-16 bg-slate-900 text-white rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">{t.missionTitle}</h2>
            <p className="text-lg leading-relaxed opacity-90">
              {t.missionText}
            </p>
          </div>

          {/* What Makes Us Different */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.differenceTitle}</h2>

            <div className="space-y-8">
              {/* Difference 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💜</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.difference1}</h3>
                  <p className="text-gray-700 leading-relaxed">{t.difference1Text}</p>
                </div>
              </div>

              {/* Difference 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.difference2}</h3>
                  <p className="text-gray-700 leading-relaxed">{t.difference2Text}</p>
                </div>
              </div>

              {/* Difference 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🛠️</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.difference3}</h3>
                  <p className="text-gray-700 leading-relaxed">{t.difference3Text}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Closing */}
          <div className="mb-16 border-l-4 border-purple-600 pl-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.closingTitle}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.closingText}
            </p>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            {t.ctaText}
          </h2>
          <Link
            href="/register"
            className="inline-block px-12 py-4 bg-white text-purple-600 text-xl font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            {t.ctaButton}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            {lang === 'en' ? '© 2026 myBidly. All rights reserved.' : '© 2026 myBidly. Alle Rechte vorbehalten.'}
          </p>
          <p className="text-sm mt-2">
            {lang === 'en' ? 'myBidly is a' : 'myBidly ist ein'}{' '}
            <a
              href="https://www.next-commerce.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition"
            >
              Next Commerce
            </a>
            {' '}{lang === 'en' ? 'company' : 'Unternehmen'}
          </p>
        </div>
      </footer>
    </div>
  )
}
