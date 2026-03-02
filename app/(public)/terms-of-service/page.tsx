'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  const [lang, setLang] = useState<'en' | 'de'>('en')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            myBidly
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('de')}
              className={`px-3 py-1 rounded ${lang === 'de' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              DE
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {lang === 'en' ? <EnglishTerms /> : <GermanTerms />}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2026 myBidly - A Next Commerce Company</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy-policy" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
            <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function EnglishTerms() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: March 2, 2026</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <p className="text-sm">
          <strong>Quick Summary:</strong> myBidly is a SaaS platform for bid-based upsells operated by Next Commerce GmbH.
          By using our service, you agree to these terms, including our pricing structure, prohibited products list, and liability limitations.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Preamble</h2>
        <p>
          These Terms of Service ("Terms") govern your use of myBidly, a software-as-a-service platform operated by
          <strong> Next Commerce GmbH</strong>, Ahornweg 5, 97990 Weikersheim, Germany ("we", "us", "our", "Next Commerce").
        </p>
        <p className="mt-2">
          myBidly provides e-commerce merchants with bid-based upsell functionality on thank-you pages. By registering an account,
          you ("Merchant", "you") agree to be bound by these Terms and our{' '}
          <Link href="/privacy-policy" className="text-purple-600 hover:underline">Privacy Policy</Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§1 Services</h2>
        <p><strong>1.1 Platform Services</strong></p>
        <p>Next Commerce provides a software platform ("myBidly") that enables merchants to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Create and manage product offers with bid-based pricing</li>
          <li>Embed widgets on their e-commerce thank-you pages</li>
          <li>Accept customer bids and payments via Stripe</li>
          <li>Track analytics and bid performance</li>
        </ul>

        <p className="mt-4"><strong>1.2 Business Model</strong></p>
        <p>
          myBidly operates as a <strong>SaaS platform</strong>. Merchants connect their own Stripe accounts to receive payments directly.
          Platform fees are automatically deducted via Stripe's application fee mechanism.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§2 Registration & Account</h2>
        <p><strong>2.1 Eligibility</strong></p>
        <p>You must be at least 18 years old and legally able to enter into contracts to use myBidly.</p>

        <p className="mt-4"><strong>2.2 Account Accuracy</strong></p>
        <p>You are responsible for maintaining accurate account information and securing your login credentials.</p>

        <p className="mt-4"><strong>2.3 Stripe Account Required</strong></p>
        <p>
          To accept customer payments, you must connect a Stripe account. You agree to Stripe's terms and understand that
          Stripe processes all payments independently.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§3 Prohibited Products</h2>
        <p>You may NOT use myBidly to sell or promote the following products or services:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Weapons & Ammunition:</strong> Firearms, explosives, knives, pepper spray, etc.</li>
          <li><strong>Illegal Drugs & Substances:</strong> Narcotics, prescription drugs without prescription, drug paraphernalia</li>
          <li><strong>Counterfeit & Pirated Goods:</strong> Fake branded items, pirated software, unauthorized replicas</li>
          <li><strong>Adult Content & Services:</strong> Pornography, escort services, sexual wellness products (case-by-case)</li>
          <li><strong>Tobacco & E-Cigarettes:</strong> Cigarettes, cigars, vaping products, tobacco accessories</li>
          <li><strong>Gambling & Lotteries:</strong> Online casinos, betting services, lottery tickets</li>
          <li><strong>Cryptocurrency & Financial Services:</strong> Crypto mining equipment, unregulated financial advice, pyramid schemes</li>
          <li><strong>Stolen Goods:</strong> Items obtained illegally or without proper ownership</li>
          <li><strong>Hazardous Materials:</strong> Toxic chemicals, radioactive materials, biological hazards</li>
          <li><strong>Discriminatory Content:</strong> Hate speech, racist imagery, products promoting violence</li>
          <li><strong>Animals & Animal Products:</strong> Live animals, ivory, endangered species products</li>
          <li><strong>Medical Devices & Prescription Items:</strong> Unlicensed medical equipment, prescription medications</li>
        </ul>
        <p className="mt-4">
          This list is not exhaustive. Next Commerce reserves the right to prohibit any product or service at our discretion,
          particularly if it violates EU law, payment processor terms, or ethical standards.
        </p>
        <p className="mt-2">
          <strong>Reference:</strong> See also Next Commerce Terms of Service{' '}
          <a href="https://next-commerce.io/terms-of-services" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            § 3 (Prohibited Articles)
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§4 Fees & Payment</h2>
        <p><strong>4.1 Pricing Plans</strong></p>
        <p>myBidly offers two pricing plans:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Pay-As-You-Go (PAYG):</strong> A percentage-based platform fee plus a fixed fee per successful transaction.
            Current rates are displayed during registration and in your dashboard.
          </li>
          <li>
            <strong>Premium Plan:</strong> A fixed monthly subscription fee with no per-transaction platform fees.
            You still pay Stripe's payment processing fees (~2.3%). Current rates are displayed during registration and in your dashboard.
          </li>
        </ul>
        <p className="mt-4">
          <strong>Note:</strong> Pricing is subject to change with 30 days' notice. All prices are shown in EUR and exclude VAT,
          which will be added where applicable according to EU tax regulations.
        </p>

        <p className="mt-4"><strong>4.2 Payment Collection</strong></p>
        <p>
          Platform fees are automatically deducted from each transaction via Stripe's <code>application_fee_amount</code> mechanism.
          Premium subscription fees are billed monthly via Stripe.
        </p>

        <p className="mt-4"><strong>4.3 Refund Fees & Chargeback Fees</strong></p>
        <p>
          Processing fees may apply for refunds and chargebacks to cover administrative and payment processor costs.
          Current fees are displayed in our FAQ and dashboard.
        </p>

        <p className="mt-4"><strong>4.4 14-Day Withdrawal Right (Widerufsrecht)</strong></p>
        <p>
          In compliance with EU consumer protection law, customer payments may be held for up to 14 days to accommodate
          the statutory withdrawal period. You agree to fulfill orders promptly and handle customer cancellations in accordance
          with EU law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§5 Liability Limitations</h2>
        <p><strong>5.1 Platform Liability</strong></p>
        <p>
          Next Commerce provides the myBidly platform "as is" without warranties of any kind. To the maximum extent permitted
          by law, we exclude all liability for:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Direct, indirect, incidental, or consequential damages</li>
          <li>Loss of profits, revenue, or data</li>
          <li>Service interruptions or technical failures</li>
          <li>Third-party actions (including Stripe, hosting providers, or customers)</li>
        </ul>

        <p className="mt-4"><strong>5.2 Exceptions</strong></p>
        <p>
          Nothing in these Terms excludes liability for death or personal injury caused by our negligence, fraud,
          or any other liability that cannot be excluded under German or EU law.
        </p>

        <p className="mt-4"><strong>5.3 Cap on Liability</strong></p>
        <p>
          Where liability cannot be excluded, our total liability is limited to the fees you paid to Next Commerce
          in the 12 months preceding the claim.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§6 Merchant Responsibilities</h2>
        <p><strong>6.1 Order Fulfillment</strong></p>
        <p>You are solely responsible for:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Shipping products to customers promptly</li>
          <li>Providing accurate product descriptions and images</li>
          <li>Maintaining adequate stock levels</li>
          <li>Handling customer service inquiries</li>
          <li>Processing returns and refunds in accordance with EU law</li>
        </ul>

        <p className="mt-4"><strong>6.2 Compliance</strong></p>
        <p>
          You must comply with all applicable laws, including EU consumer protection laws, GDPR, and VAT regulations.
          You are responsible for obtaining any necessary licenses or permits for your business.
        </p>

        <p className="mt-4"><strong>6.3 Product Quality</strong></p>
        <p>
          You warrant that all products offered via myBidly are legal, authentic, and as described.
          You are solely responsible for product liability claims.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§7 Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Next Commerce GmbH, its officers, employees, and affiliates from any claims,
          damages, or expenses (including legal fees) arising from:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Your breach of these Terms</li>
          <li>Your violation of any law or regulation</li>
          <li>Product liability claims related to your products</li>
          <li>Customer disputes arising from your business practices</li>
          <li>Intellectual property infringement claims</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§8 Data & Privacy</h2>
        <p>
          Our collection and use of your personal data is governed by our{' '}
          <Link href="/privacy-policy" className="text-purple-600 hover:underline">Privacy Policy</Link>,
          which forms part of these Terms. By using myBidly, you consent to our data processing practices as described therein.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§9 Termination</h2>
        <p><strong>9.1 By You</strong></p>
        <p>You may terminate your account at any time by contacting us at info@next-commerce.io.</p>

        <p className="mt-4"><strong>9.2 By Us</strong></p>
        <p>We may suspend or terminate your account if you:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Breach these Terms</li>
          <li>Sell prohibited products</li>
          <li>Engage in fraudulent activity</li>
          <li>Accumulate excessive chargebacks or customer complaints</li>
        </ul>

        <p className="mt-4"><strong>9.3 Effect of Termination</strong></p>
        <p>
          Upon termination, you will no longer be able to accept bids. Outstanding payments and fees will be processed
          according to Stripe's standard procedures.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§10 Governing Law & Dispute Resolution</h2>
        <p><strong>10.1 Governing Law</strong></p>
        <p>
          These Terms are governed by the laws of the Federal Republic of Germany, excluding conflict of law provisions.
          EU regulations apply where relevant.
        </p>

        <p className="mt-4"><strong>10.2 Jurisdiction</strong></p>
        <p>
          Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Germany.
          For consumer contracts, mandatory consumer protection laws of your country of residence may apply.
        </p>

        <p className="mt-4"><strong>10.3 EU Online Dispute Resolution</strong></p>
        <p>
          The EU provides an online dispute resolution platform at{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            https://ec.europa.eu/consumers/odr
          </a>. We are not obligated to participate in alternative dispute resolution procedures.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§11 Contact & Support</h2>
        <p><strong>Next Commerce GmbH</strong></p>
        <p>Ahornweg 5<br />97990 Weikersheim<br />Germany</p>
        <p className="mt-2">
          Email: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a>
        </p>
        <p className="mt-4">
          For technical support, email:{' '}
          <a href="mailto:support@mybidly.io" className="text-purple-600 hover:underline">support@mybidly.io</a>
        </p>
      </section>

      <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mt-8">
        <p className="text-sm text-gray-700">
          <strong>Additional Terms:</strong> Your use of myBidly is also subject to the{' '}
          <a href="https://next-commerce.io/terms-of-services" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            Next Commerce General Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            Stripe's Terms of Service
          </a>.
        </p>
      </div>
    </div>
  )
}

function GermanTerms() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Allgemeine Geschäftsbedingungen</h1>
      <p className="text-sm text-gray-500 mb-8">Letzte Aktualisierung: 2. März 2026</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <p className="text-sm">
          <strong>Kurzzusammenfassung:</strong> myBidly ist eine SaaS-Plattform für gebotsbasierte Upsells, betrieben von der Next Commerce GmbH.
          Durch die Nutzung unseres Dienstes stimmen Sie diesen Bedingungen zu, einschließlich unserer Preisstruktur, der Liste verbotener Produkte und Haftungsbeschränkungen.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Präambel</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen („AGB") regeln Ihre Nutzung von myBidly, einer Software-as-a-Service-Plattform,
          die von der <strong>Next Commerce GmbH</strong>, Ahornweg 5, 97990 Weikersheim, Deutschland („wir", „uns", „unser", „Next Commerce") betrieben wird.
        </p>
        <p className="mt-2">
          myBidly bietet E-Commerce-Händlern gebotsbasierte Upsell-Funktionen auf Danke-Seiten. Durch die Registrierung eines Kontos
          stimmen Sie („Händler", „Sie") diesen AGB und unserer{' '}
          <Link href="/privacy-policy" className="text-purple-600 hover:underline">Datenschutzerklärung</Link> zu.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§1 Leistungen</h2>
        <p><strong>1.1 Plattform-Dienste</strong></p>
        <p>Next Commerce stellt eine Software-Plattform („myBidly") bereit, die Händlern ermöglicht:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Produktangebote mit gebotsbasierter Preisgestaltung zu erstellen und zu verwalten</li>
          <li>Widgets auf ihren E-Commerce-Danke-Seiten einzubetten</li>
          <li>Kundengebote und Zahlungen über Stripe anzunehmen</li>
          <li>Analysen und Gebotsleistung zu verfolgen</li>
        </ul>

        <p className="mt-4"><strong>1.2 Geschäftsmodell</strong></p>
        <p>
          myBidly arbeitet als <strong>SaaS-Plattform</strong>. Händler verbinden ihre eigenen Stripe-Konten, um Zahlungen direkt zu erhalten.
          Plattformgebühren werden automatisch über Stripes Application-Fee-Mechanismus abgezogen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§2 Registrierung & Konto</h2>
        <p><strong>2.1 Berechtigung</strong></p>
        <p>Sie müssen mindestens 18 Jahre alt sein und rechtlich in der Lage sein, Verträge abzuschließen, um myBidly zu nutzen.</p>

        <p className="mt-4"><strong>2.2 Kontorichtigkeit</strong></p>
        <p>Sie sind dafür verantwortlich, genaue Kontoinformationen zu pflegen und Ihre Anmeldedaten zu sichern.</p>

        <p className="mt-4"><strong>2.3 Stripe-Konto erforderlich</strong></p>
        <p>
          Um Kundenzahlungen zu akzeptieren, müssen Sie ein Stripe-Konto verbinden. Sie stimmen den Bedingungen von Stripe zu
          und verstehen, dass Stripe alle Zahlungen unabhängig verarbeitet.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§3 Verbotene Produkte</h2>
        <p>Sie dürfen myBidly NICHT verwenden, um folgende Produkte oder Dienstleistungen zu verkaufen oder zu bewerben:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Waffen & Munition:</strong> Schusswaffen, Sprengstoffe, Messer, Pfefferspray usw.</li>
          <li><strong>Illegale Drogen & Substanzen:</strong> Betäubungsmittel, verschreibungspflichtige Medikamente ohne Rezept, Drogenutensilien</li>
          <li><strong>Gefälschte & Raubkopierte Waren:</strong> Gefälschte Markenartikel, Raubkopien von Software, nicht autorisierte Repliken</li>
          <li><strong>Erwachseneninhalte & Dienstleistungen:</strong> Pornografie, Escort-Services, Sexuell ausgerichtete Produkte (Einzelfallprüfung)</li>
          <li><strong>Tabak & E-Zigaretten:</strong> Zigaretten, Zigarren, Vaping-Produkte, Tabakzubehör</li>
          <li><strong>Glücksspiel & Lotterien:</strong> Online-Casinos, Wettdienste, Lotterielose</li>
          <li><strong>Kryptowährung & Finanzdienstleistungen:</strong> Crypto-Mining-Equipment, unregulierte Finanzberatung, Schneeballsysteme</li>
          <li><strong>Gestohlene Waren:</strong> Illegal erworbene Gegenstände oder ohne ordnungsgemäßen Eigentumsnachweis</li>
          <li><strong>Gefährliche Materialien:</strong> Giftige Chemikalien, radioaktive Materialien, biologische Gefahren</li>
          <li><strong>Diskriminierende Inhalte:</strong> Hassreden, rassistische Bilder, Produkte, die Gewalt fördern</li>
          <li><strong>Tiere & Tierprodukte:</strong> Lebende Tiere, Elfenbein, Produkte gefährdeter Arten</li>
          <li><strong>Medizinische Geräte & Verschreibungspflichtige Artikel:</strong> Unlizenzierte medizinische Geräte, verschreibungspflichtige Medikamente</li>
        </ul>
        <p className="mt-4">
          Diese Liste ist nicht erschöpfend. Next Commerce behält sich das Recht vor, jedes Produkt oder jede Dienstleistung nach eigenem Ermessen zu verbieten,
          insbesondere wenn es gegen EU-Recht, die Bedingungen von Zahlungsdienstleistern oder ethische Standards verstößt.
        </p>
        <p className="mt-2">
          <strong>Referenz:</strong> Siehe auch Next Commerce AGB{' '}
          <a href="https://next-commerce.io/terms-of-services" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            § 3 (Verbotene Artikel)
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§4 Gebühren & Zahlung</h2>
        <p><strong>4.1 Preispläne</strong></p>
        <p>myBidly bietet zwei Preispläne an:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Pay-As-You-Go (PAYG):</strong> Eine prozentuale Plattformgebühr plus eine feste Gebühr pro erfolgreicher Transaktion.
            Die aktuellen Tarife werden während der Registrierung und in Ihrem Dashboard angezeigt.
          </li>
          <li>
            <strong>Premium-Plan:</strong> Eine feste monatliche Abonnementgebühr ohne Plattformgebühren pro Transaktion.
            Sie zahlen weiterhin Stripe-Zahlungsabwicklungsgebühren (~2,3%). Die aktuellen Tarife werden während der Registrierung und in Ihrem Dashboard angezeigt.
          </li>
        </ul>
        <p className="mt-4">
          <strong>Hinweis:</strong> Die Preise können sich mit einer Frist von 30 Tagen ändern. Alle Preise werden in EUR angezeigt und verstehen sich
          ohne Mehrwertsteuer, die gegebenenfalls gemäß den EU-Steuervorschriften hinzugefügt wird.
        </p>

        <p className="mt-4"><strong>4.2 Zahlungseinzug</strong></p>
        <p>
          Plattformgebühren werden automatisch von jeder Transaktion über Stripes <code>application_fee_amount</code>-Mechanismus abgezogen.
          Premium-Abonnementgebühren werden monatlich über Stripe abgerechnet.
        </p>

        <p className="mt-4"><strong>4.3 Rückerstattungs- und Chargeback-Gebühren</strong></p>
        <p>
          Für Rückerstattungen und Chargebacks können Bearbeitungsgebühren anfallen, um Verwaltungs- und Zahlungsdienstleisterkosten zu decken.
          Die aktuellen Gebühren werden in unseren FAQ und im Dashboard angezeigt.
        </p>

        <p className="mt-4"><strong>4.4 14-tägiges Widerrufsrecht</strong></p>
        <p>
          In Übereinstimmung mit dem EU-Verbraucherschutzrecht können Kundenzahlungen bis zu 14 Tage zurückgehalten werden,
          um der gesetzlichen Widerrufsfrist Rechnung zu tragen. Sie verpflichten sich, Bestellungen unverzüglich zu erfüllen
          und Kundenstornierungen gemäß EU-Recht zu bearbeiten.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§5 Haftungsbeschränkungen</h2>
        <p><strong>5.1 Plattformhaftung</strong></p>
        <p>
          Next Commerce stellt die myBidly-Plattform „wie besehen" ohne jegliche Gewährleistung zur Verfügung.
          Im maximal gesetzlich zulässigen Umfang schließen wir jegliche Haftung aus für:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Direkte, indirekte, zufällige oder Folgeschäden</li>
          <li>Verlust von Gewinnen, Einnahmen oder Daten</li>
          <li>Dienstunterbrechungen oder technische Ausfälle</li>
          <li>Handlungen Dritter (einschließlich Stripe, Hosting-Anbieter oder Kunden)</li>
        </ul>

        <p className="mt-4"><strong>5.2 Ausnahmen</strong></p>
        <p>
          Nichts in diesen AGB schließt die Haftung für Tod oder Personenschäden aus, die durch unsere Fahrlässigkeit, Betrug
          oder eine andere Haftung verursacht werden, die nach deutschem oder EU-Recht nicht ausgeschlossen werden kann.
        </p>

        <p className="mt-4"><strong>5.3 Haftungsobergrenze</strong></p>
        <p>
          Wenn die Haftung nicht ausgeschlossen werden kann, ist unsere Gesamthaftung auf die Gebühren begrenzt,
          die Sie in den 12 Monaten vor dem Anspruch an Next Commerce gezahlt haben.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§6 Händlerpflichten</h2>
        <p><strong>6.1 Auftragsabwicklung</strong></p>
        <p>Sie sind allein verantwortlich für:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Den unverzüglichen Versand von Produkten an Kunden</li>
          <li>Die Bereitstellung genauer Produktbeschreibungen und Bilder</li>
          <li>Die Aufrechterhaltung ausreichender Lagerbestände</li>
          <li>Die Bearbeitung von Kundendienstanfragen</li>
          <li>Die Bearbeitung von Retouren und Rückerstattungen gemäß EU-Recht</li>
        </ul>

        <p className="mt-4"><strong>6.2 Compliance</strong></p>
        <p>
          Sie müssen alle anwendbaren Gesetze einhalten, einschließlich EU-Verbraucherschutzgesetze, DSGVO und Mehrwertsteuervorschriften.
          Sie sind dafür verantwortlich, alle erforderlichen Lizenzen oder Genehmigungen für Ihr Unternehmen zu erhalten.
        </p>

        <p className="mt-4"><strong>6.3 Produktqualität</strong></p>
        <p>
          Sie garantieren, dass alle über myBidly angebotenen Produkte legal, authentisch und wie beschrieben sind.
          Sie sind allein verantwortlich für Produkthaftungsansprüche.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§7 Freistellung</h2>
        <p>
          Sie verpflichten sich, Next Commerce GmbH, ihre leitenden Angestellten, Mitarbeiter und verbundenen Unternehmen von allen Ansprüchen,
          Schäden oder Kosten (einschließlich Anwaltskosten) freizustellen, die sich ergeben aus:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Ihrem Verstoß gegen diese AGB</li>
          <li>Ihrer Verletzung von Gesetzen oder Vorschriften</li>
          <li>Produkthaftungsansprüchen im Zusammenhang mit Ihren Produkten</li>
          <li>Kundenstreitigkeiten, die sich aus Ihren Geschäftspraktiken ergeben</li>
          <li>Ansprüchen wegen Verletzung geistigen Eigentums</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§8 Daten & Datenschutz</h2>
        <p>
          Die Erhebung und Verwendung Ihrer personenbezogenen Daten unterliegt unserer{' '}
          <Link href="/privacy-policy" className="text-purple-600 hover:underline">Datenschutzerklärung</Link>,
          die Teil dieser AGB ist. Durch die Nutzung von myBidly stimmen Sie unseren Datenverarbeitungspraktiken zu, wie darin beschrieben.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§9 Kündigung</h2>
        <p><strong>9.1 Durch Sie</strong></p>
        <p>Sie können Ihr Konto jederzeit kündigen, indem Sie uns unter info@next-commerce.io kontaktieren.</p>

        <p className="mt-4"><strong>9.2 Durch uns</strong></p>
        <p>Wir können Ihr Konto sperren oder kündigen, wenn Sie:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Diese AGB verletzen</li>
          <li>Verbotene Produkte verkaufen</li>
          <li>Betrügerische Aktivitäten ausüben</li>
          <li>Übermäßige Chargebacks oder Kundenbeschwerden anhäufen</li>
        </ul>

        <p className="mt-4"><strong>9.3 Wirkung der Kündigung</strong></p>
        <p>
          Nach der Kündigung können Sie keine Gebote mehr annehmen. Ausstehende Zahlungen und Gebühren werden
          gemäß den Standardverfahren von Stripe verarbeitet.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§10 Anwendbares Recht & Streitbeilegung</h2>
        <p><strong>10.1 Anwendbares Recht</strong></p>
        <p>
          Diese AGB unterliegen den Gesetzen der Bundesrepublik Deutschland unter Ausschluss kollisionsrechtlicher Bestimmungen.
          EU-Vorschriften gelten, soweit relevant.
        </p>

        <p className="mt-4"><strong>10.2 Gerichtsstand</strong></p>
        <p>
          Alle Streitigkeiten aus diesen AGB unterliegen der ausschließlichen Zuständigkeit der deutschen Gerichte.
          Für Verbraucherverträge können zwingende Verbraucherschutzgesetze Ihres Wohnsitzlandes gelten.
        </p>

        <p className="mt-4"><strong>10.3 EU-Online-Streitbeilegung</strong></p>
        <p>
          Die EU stellt eine Online-Streitbeilegungsplattform zur Verfügung unter{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            https://ec.europa.eu/consumers/odr
          </a>. Wir sind nicht verpflichtet, an alternativen Streitbeilegungsverfahren teilzunehmen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§11 Kontakt & Support</h2>
        <p><strong>Next Commerce GmbH</strong></p>
        <p>Ahornweg 5<br />97990 Weikersheim<br />Deutschland</p>
        <p className="mt-2">
          E-Mail: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a>
        </p>
        <p className="mt-4">
          Für technischen Support, E-Mail:{' '}
          <a href="mailto:support@mybidly.io" className="text-purple-600 hover:underline">support@mybidly.io</a>
        </p>
      </section>

      <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mt-8">
        <p className="text-sm text-gray-700">
          <strong>Zusätzliche Bedingungen:</strong> Ihre Nutzung von myBidly unterliegt auch den{' '}
          <a href="https://next-commerce.io/terms-of-services" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            Allgemeinen Geschäftsbedingungen von Next Commerce
          </a>{' '}
          und den{' '}
          <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            Nutzungsbedingungen von Stripe
          </a>.
        </p>
      </div>
    </div>
  )
}
