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
      paulRole: "Co-Founder & Tech Visionary",
      paulStory: "Paul spent years building e-commerce platforms for enterprise clients. He watched them pour thousands into driving traffic, only to see customers disappear after checkout. \"We're solving the hardest problem - getting people to buy,\" he'd say, \"but then we just... let them leave.\" The waste frustrated him. He knew there had to be a better way.",

      sventjeTitle: "Meet Sventje",
      sventjeRole: "Co-Founder & Customer Champion",
      sventjeStory: "Sventje ran a small online store selling sustainable outdoor gear. She experienced the same problem firsthand. \"I'd see customers buy a jacket, and I knew they'd need waterproofing spray or a repair kit, but by the time they left my checkout, it was too late.\" She tried traditional upsell tools, but they felt pushy and killed conversions. She wanted something that felt natural - something that gave customers a voice.",

      meetingTitle: "A Chance Meeting",
      meetingStory: "Paul and Sventje met at a small e-commerce conference in Berlin. Over coffee, Sventje mentioned her frustration. \"What if customers could bid?\" she wondered out loud. \"Let them decide what they're willing to pay. Make it fun, not forceful.\" Paul's eyes lit up. That night, he sketched out the first prototype on a napkin. Three weeks later, they launched the beta version in Sventje's store.",

      resultTitle: "The Results",
      resultStory: "The first month, Sventje added €2,400 in revenue she would have otherwise missed. Customers loved the bidding experience - it felt like a game, not a sales tactic. Word spread. Soon, other shop owners in her network wanted in. That's when Paul and Sventje realized they had something special.",

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
      paulRole: "Mitgründer & Tech-Visionär",
      paulStory: "Paul baute jahrelang E-Commerce-Plattformen für Unternehmenskunden. Er sah, wie sie Tausende investierten, um Traffic zu generieren, nur um zuzusehen, wie Kunden nach dem Checkout verschwanden. \"Wir lösen das schwierigste Problem - Menschen zum Kauf zu bewegen\", sagte er oft, \"aber dann lassen wir sie einfach... gehen.\" Diese Verschwendung frustrierte ihn. Er wusste, es musste einen besseren Weg geben.",

      sventjeTitle: "Das ist Sventje",
      sventjeRole: "Mitgründerin & Kundenverfechterin",
      sventjeStory: "Sventje führte einen kleinen Online-Shop für nachhaltige Outdoor-Ausrüstung. Sie erlebte dasselbe Problem am eigenen Leib. \"Ich sah Kunden eine Jacke kaufen, und ich wusste, sie würden Imprägnierungsspray oder ein Reparaturset brauchen, aber sobald sie meinen Checkout verlassen hatten, war es zu spät.\" Sie probierte traditionelle Upsell-Tools aus, aber die fühlten sich aufdringlich an und töteten Konversionen. Sie wollte etwas Natürliches - etwas, das Kunden eine Stimme gab.",

      meetingTitle: "Eine zufällige Begegnung",
      meetingStory: "Paul und Sventje trafen sich auf einer kleinen E-Commerce-Konferenz in Berlin. Bei einem Kaffee erwähnte Sventje ihre Frustration. \"Was, wenn Kunden bieten könnten?\", überlegte sie laut. \"Lass sie entscheiden, was sie bereit sind zu zahlen. Mach es spielerisch, nicht zwingend.\" Pauls Augen leuchteten auf. An jenem Abend skizzierte er den ersten Prototyp auf einer Serviette. Drei Wochen später starteten sie die Beta-Version in Sventjes Shop.",

      resultTitle: "Die Ergebnisse",
      resultStory: "Im ersten Monat generierte Sventje €2.400 zusätzlichen Umsatz, den sie sonst verpasst hätte. Kunden liebten das Bieterlebnis - es fühlte sich wie ein Spiel an, nicht wie eine Verkaufstaktik. Es sprach sich herum. Bald wollten andere Shop-Besitzer in ihrem Netzwerk auch mitmachen. Da erkannten Paul und Sventje, dass sie etwas Besonderes hatten.",

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

          {/* Meeting Story */}
          <div className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.meetingTitle}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.meetingStory}
            </p>
          </div>

          {/* Results */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.resultTitle}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.resultStory}
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
