'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
          {lang === 'en' ? <EnglishPrivacyPolicy /> : <GermanPrivacyPolicy />}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2026 myBidly - A Next Commerce Company</p>
          <div className="mt-2 space-x-4">
            <Link href="/terms-of-service" className="text-purple-600 hover:underline">
              Terms of Service
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

function EnglishPrivacyPolicy() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: March 2, 2026</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <p className="text-sm">
          <strong>Quick Summary:</strong> We collect only the data necessary to provide myBidly services. Your data is processed
          in compliance with GDPR. You have full control over your data with rights to access, correct, delete, and port your information.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
        <p>
          Next Commerce GmbH ("we", "us", "our") operates myBidly and takes the protection of your personal data very seriously.
          We process your personal data in accordance with the EU General Data Protection Regulation (GDPR), the German Federal
          Data Protection Act (BDSG), and other applicable data protection laws.
        </p>
        <p className="mt-2">
          This Privacy Policy explains what data we collect, how we use it, who we share it with, and your rights regarding your personal data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data Controller & Contact</h2>
        <p>The responsible party for data processing on this website is:</p>
        <div className="bg-gray-50 p-4 rounded mt-2">
          <p><strong>Next Commerce GmbH</strong></p>
          <p>Ahornweg 5</p>
          <p>97990 Weikersheim</p>
          <p>Germany</p>
          <p className="mt-2">Email: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a></p>
        </div>
        <p className="mt-4">
          The responsible party is the natural or legal person who alone or jointly with others determines the purposes and means
          of the processing of personal data (e.g. names, email addresses, etc.).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data We Collect</h2>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.1 Merchant Account Data</h3>
        <p>When you register as a merchant, we collect:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Email address (for login and communication)</li>
          <li>Password (encrypted)</li>
          <li>Shop name and business information</li>
          <li>Stripe account details (account ID, onboarding status)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.2 Customer Bid Data</h3>
        <p>When end-customers place bids through your widget, we collect:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Customer name and email address</li>
          <li>Shipping address</li>
          <li>Bid amount</li>
          <li>Payment information (processed by Stripe, not stored by us)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.3 Technical Data</h3>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>IP address (for security and fraud prevention)</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Session cookies (for authentication)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Data</h2>
        <p>We process your personal data for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Service Delivery:</strong> To provide myBidly platform functionality and process bids</li>
          <li><strong>Payment Processing:</strong> To facilitate payments via Stripe (legal basis: contract fulfillment)</li>
          <li><strong>Communication:</strong> To send order confirmations, bid notifications, and account updates</li>
          <li><strong>Customer Support:</strong> To respond to your inquiries and provide technical assistance</li>
          <li><strong>Security:</strong> To prevent fraud, abuse, and unauthorized access</li>
          <li><strong>Legal Compliance:</strong> To comply with tax, accounting, and regulatory requirements</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Storage Duration</h2>
        <p>We store your personal data only as long as necessary for the purposes outlined above:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Account Data:</strong> Until you delete your account, plus 30 days for backup</li>
          <li><strong>Bid Transaction Data:</strong> 10 years for accounting and tax compliance</li>
          <li><strong>Email Communications:</strong> 2 years or until you request deletion</li>
          <li><strong>Technical Logs:</strong> 90 days for security purposes</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Sharing & Third-Party Services</h2>
        <p>We share your data with the following third parties to provide our services:</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">6.1 Stripe (Payment Processing)</h3>
        <p>
          We use Stripe for payment processing. Stripe processes payment data according to their{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            Privacy Policy
          </a>. Stripe is PCI-DSS Level 1 certified.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">6.2 Email Service (Resend)</h3>
        <p>We use Resend to send transactional emails (bid confirmations, order notifications). Resend processes data in accordance with GDPR.</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">6.3 Hosting Provider (Vercel)</h3>
        <p>
          Our platform is hosted on Vercel. Server locations are in the EU. Vercel complies with GDPR and has appropriate
          data processing agreements in place.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">6.4 Database (Supabase/PostgreSQL)</h3>
        <p>Customer and bid data is stored in a PostgreSQL database hosted within the EU with encryption at rest and in transit.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies & Tracking</h2>
        <p>We use the following cookies:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Session Cookies:</strong> Essential for login and authentication (expires when browser closes)</li>
          <li><strong>Language Preference:</strong> Stores your selected language (EN/DE)</li>
        </ul>
        <p className="mt-2">
          We do NOT use third-party tracking cookies, advertising cookies, or analytics tools that track you across websites.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. SSL/TLS Encryption</h2>
        <p>
          This website uses SSL/TLS encryption for security reasons and to protect the transmission of confidential content,
          such as orders or inquiries you send to us as the site operator. You can recognize an encrypted connection by the
          browser address line changing from "http://" to "https://" and by the lock icon in your browser.
        </p>
        <p className="mt-2">
          When SSL/TLS encryption is activated, the data you transmit to us cannot be read by third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Rights Under GDPR</h2>
        <p>You have the following rights regarding your personal data:</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.1 Right to Access (Art. 15 GDPR)</h3>
        <p>You can request a copy of all personal data we hold about you.</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.2 Right to Rectification (Art. 16 GDPR)</h3>
        <p>You can correct inaccurate or incomplete data.</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.3 Right to Deletion (Art. 17 GDPR)</h3>
        <p>
          You can request deletion of your data, unless we are required to retain it for legal reasons
          (e.g., tax compliance, ongoing contracts).
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.4 Right to Data Portability (Art. 20 GDPR)</h3>
        <p>
          You have the right to receive your data in a structured, commonly used, and machine-readable format
          (e.g., CSV, JSON) and transfer it to another provider.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.5 Right to Withdraw Consent (Art. 7 GDPR)</h3>
        <p>
          You can withdraw your consent to data processing at any time by sending an email to{' '}
          <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a>.
          The withdrawal does not affect the lawfulness of processing based on consent before its withdrawal.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.6 Right to Object (Art. 21 GDPR)</h3>
        <p>
          You can object to processing of your data for direct marketing purposes at any time.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.7 Right to Lodge a Complaint (Art. 77 GDPR)</h3>
        <p>
          If you believe we have violated data protection laws, you can file a complaint with the competent supervisory authority.
          The supervisory authority responsible for data protection issues is the State Data Protection Officer of the federal state
          where our company is based. A list of data protection officers and their contact details can be found at:{' '}
          <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            https://www.bfdi.bund.de
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your data, including:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Encryption in transit (SSL/TLS) and at rest (database encryption)</li>
          <li>Secure authentication with encrypted passwords (bcrypt)</li>
          <li>Regular security audits and vulnerability scanning</li>
          <li>Access controls and role-based permissions</li>
          <li>Automated backups with encryption</li>
        </ul>
        <p className="mt-4">
          <strong>Important:</strong> We note that data transmission over the Internet (e.g., via email) may have security gaps.
          Complete protection of data from access by third parties is not possible.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Objection to Advertising Emails</h2>
        <p>
          The use of contact data published within the framework of the imprint obligation to send unsolicited advertising
          and information materials is hereby expressly prohibited. The operators of these pages expressly reserve the right
          to take legal action in the event of unsolicited sending of advertising information, such as spam emails.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Unsolicited Personal Data</h2>
        <p>
          All personal data provided to us unsolicited (e.g., applications, cover letters with personal data) will not be
          stored or otherwise processed by us but will be immediately and irrevocably deleted without notification to the sender.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Data Protection Officer</h2>
        <p>
          The legally required data protection officer is <strong>Next Commerce GmbH</strong>.
        </p>
        <p className="mt-2">
          Contact: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
          We will notify you of significant changes via email or by posting a notice on our website.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded mt-2">
          <p><strong>Next Commerce GmbH</strong></p>
          <p>Ahornweg 5, 97990 Weikersheim, Germany</p>
          <p>Email: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a></p>
        </div>
      </section>
    </div>
  )
}

function GermanPrivacyPolicy() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
      <p className="text-sm text-gray-500 mb-8">Letzte Aktualisierung: 2. März 2026</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <p className="text-sm">
          <strong>Kurzzusammenfassung:</strong> Wir erheben nur die Daten, die zur Bereitstellung der myBidly-Dienste erforderlich sind.
          Ihre Daten werden DSGVO-konform verarbeitet. Sie haben die volle Kontrolle über Ihre Daten mit Rechten auf Zugriff,
          Berichtigung, Löschung und Datenübertragbarkeit.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Einleitung</h2>
        <p>
          Die Next Commerce GmbH („wir", „uns", „unser") betreibt myBidly und nimmt den Schutz Ihrer persönlichen Daten sehr ernst.
          Wir verarbeiten Ihre personenbezogenen Daten im Einklang mit der EU-Datenschutz-Grundverordnung (DSGVO),
          dem Bundesdatenschutzgesetz (BDSG) und anderen anwendbaren Datenschutzgesetzen.
        </p>
        <p className="mt-2">
          Diese Datenschutzerklärung erläutert, welche Daten wir erheben, wie wir sie verwenden, an wen wir sie weitergeben
          und welche Rechte Sie bezüglich Ihrer personenbezogenen Daten haben.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Allgemeine Hinweise und Pflichtinformationen</h2>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Datenschutz</h3>
        <p>
          Der/die Verantwortliche nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
          vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
        </p>
        <p className="mt-2">
          Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten,
          mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir
          erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
        </p>
        <p className="mt-2">
          Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken
          aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Hinweis zur verantwortlichen Stelle</h3>
        <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
        <div className="bg-gray-50 p-4 rounded mt-2">
          <p><strong>Next Commerce GmbH</strong></p>
          <p>Ahornweg 5</p>
          <p>97990 Weikersheim</p>
          <p>Deutschland</p>
          <p className="mt-2">E-Mail: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a></p>
        </div>
        <p className="mt-4">
          Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke
          und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
        <p>
          Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte
          Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns (info@next-commerce.io).
          Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
        <p>
          Im Falle datenschutzrechtlicher Verstöße steht dem Betroffenen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
          Zuständige Aufsichtsbehörde in datenschutzrechtlichen Fragen ist der Landesdatenschutzbeauftragte des Bundeslandes, in dem
          unser Unternehmen seinen Sitz hat. Eine Liste der Datenschutzbeauftragten sowie deren Kontaktdaten können folgendem Link
          entnommen werden:{' '}
          <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html
          </a>.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Recht auf Datenübertragbarkeit</h3>
        <p>
          Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten,
          an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte
          Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar ist.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">SSL- bzw. TLS-Verschlüsselung</h3>
        <p>
          Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen
          oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung
          erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol
          in Ihrer Browserzeile.
        </p>
        <p className="mt-2">
          Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Auskunft, Sperrung, Löschung</h3>
        <p>
          Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre
          gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht
          auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten
          können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Widerspruch gegen Werbe-Mails</h3>
        <p>
          Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich
          angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen. Die Betreiber der Seiten behalten sich
          ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-E-Mails, vor.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Löschung unaufgefordert zur Verfügung gestellter personenbezogener Daten</h3>
        <p>
          Alle uns unaufgefordert zur Verfügung gestellten personenbezogenen Daten (z.B. Bewerbungen, Anschreiben mit personenbezogenen Daten)
          werden von uns nicht gespeichert oder anderweitig verarbeitet sondern sofort und ohne Rückmeldung an den Absender unwiderruflich gelöscht.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Datenschutzbeauftragter</h2>
        <p>
          Gesetzlich vorgeschriebener Datenschutzbeauftragter ist die <strong>Next Commerce GmbH</strong>.
        </p>
        <p className="mt-2">
          Kontakt: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Welche Daten wir erheben</h2>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">4.1 Händler-Kontodaten</h3>
        <p>Bei der Registrierung als Händler erheben wir:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>E-Mail-Adresse (für Anmeldung und Kommunikation)</li>
          <li>Passwort (verschlüsselt)</li>
          <li>Shop-Name und Geschäftsinformationen</li>
          <li>Stripe-Kontodetails (Konto-ID, Onboarding-Status)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">4.2 Kunden-Gebotsdaten</h3>
        <p>Wenn Endkunden Gebote über Ihr Widget abgeben, erheben wir:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Kundenname und E-Mail-Adresse</li>
          <li>Lieferadresse</li>
          <li>Gebotsbetrag</li>
          <li>Zahlungsinformationen (verarbeitet von Stripe, nicht von uns gespeichert)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">4.3 Technische Daten</h3>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>IP-Adresse (für Sicherheit und Betrugsprävention)</li>
          <li>Browsertyp und -version</li>
          <li>Geräteinformationen</li>
          <li>Sitzungs-Cookies (für Authentifizierung)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Zweck der Datenverarbeitung</h2>
        <p>Wir verarbeiten Ihre personenbezogenen Daten zu folgenden Zwecken:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Leistungserbringung:</strong> Bereitstellung der myBidly-Plattform und Verarbeitung von Geboten</li>
          <li><strong>Zahlungsabwicklung:</strong> Abwicklung von Zahlungen über Stripe (Rechtsgrundlage: Vertragserfüllung)</li>
          <li><strong>Kommunikation:</strong> Versand von Auftragsbestätigungen, Gebotsbenachrichtigungen und Konto-Updates</li>
          <li><strong>Kundensupport:</strong> Beantwortung Ihrer Anfragen und technische Unterstützung</li>
          <li><strong>Sicherheit:</strong> Verhinderung von Betrug, Missbrauch und unbefugtem Zugriff</li>
          <li><strong>Rechtliche Compliance:</strong> Erfüllung steuerlicher, buchhalterischer und regulatorischer Anforderungen</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Speicherdauer</h2>
        <p>Wir speichern Ihre personenbezogenen Daten nur so lange, wie für die oben genannten Zwecke erforderlich:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Kontodaten:</strong> Bis Sie Ihr Konto löschen, plus 30 Tage für Backup</li>
          <li><strong>Gebots-Transaktionsdaten:</strong> 10 Jahre für Buchhaltung und Steuer-Compliance</li>
          <li><strong>E-Mail-Kommunikation:</strong> 2 Jahre oder bis Sie die Löschung beantragen</li>
          <li><strong>Technische Logs:</strong> 90 Tage für Sicherheitszwecke</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Datenweitergabe & Drittanbieter</h2>
        <p>Wir geben Ihre Daten an folgende Dritte weiter, um unsere Dienste bereitzustellen:</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">7.1 Stripe (Zahlungsabwicklung)</h3>
        <p>
          Wir nutzen Stripe für die Zahlungsabwicklung. Stripe verarbeitet Zahlungsdaten gemäß ihrer{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
            Datenschutzerklärung
          </a>. Stripe ist PCI-DSS Level 1 zertifiziert.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">7.2 E-Mail-Dienst (Resend)</h3>
        <p>Wir nutzen Resend zum Versand von Transaktions-E-Mails (Gebotsbestätigungen, Bestellbenachrichtigungen). Resend verarbeitet Daten DSGVO-konform.</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">7.3 Hosting-Anbieter (Vercel)</h3>
        <p>
          Unsere Plattform wird auf Vercel gehostet. Serverstandorte befinden sich in der EU. Vercel erfüllt die DSGVO und
          hat entsprechende Datenverarbeitungsvereinbarungen abgeschlossen.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">7.4 Datenbank (Supabase/PostgreSQL)</h3>
        <p>Kunden- und Gebotsdaten werden in einer PostgreSQL-Datenbank gespeichert, die innerhalb der EU gehostet wird, mit Verschlüsselung im Ruhezustand und während der Übertragung.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies & Tracking</h2>
        <p>Wir verwenden folgende Cookies:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Sitzungs-Cookies:</strong> Erforderlich für Anmeldung und Authentifizierung (läuft ab, wenn Browser geschlossen wird)</li>
          <li><strong>Sprachpräferenz:</strong> Speichert Ihre gewählte Sprache (DE/EN)</li>
        </ul>
        <p className="mt-2">
          Wir verwenden KEINE Drittanbieter-Tracking-Cookies, Werbe-Cookies oder Analysetools, die Sie websiteübergreifend verfolgen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Ihre Rechte gemäß DSGVO</h2>
        <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.1 Recht auf Auskunft (Art. 15 DSGVO)</h3>
        <p>Sie können eine Kopie aller personenbezogenen Daten anfordern, die wir über Sie gespeichert haben.</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.2 Recht auf Berichtigung (Art. 16 DSGVO)</h3>
        <p>Sie können unrichtige oder unvollständige Daten korrigieren lassen.</p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.3 Recht auf Löschung (Art. 17 DSGVO)</h3>
        <p>
          Sie können die Löschung Ihrer Daten beantragen, sofern wir nicht gesetzlich verpflichtet sind, diese aufzubewahren
          (z.B. Steuer-Compliance, laufende Verträge).
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.4 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
        <p>
          Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format (z.B. CSV, JSON) zu erhalten
          und an einen anderen Anbieter zu übertragen.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.5 Recht auf Widerruf der Einwilligung (Art. 7 DSGVO)</h3>
        <p>
          Sie können Ihre Einwilligung zur Datenverarbeitung jederzeit durch eine E-Mail an{' '}
          <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a> widerrufen.
          Der Widerruf berührt nicht die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.6 Recht auf Widerspruch (Art. 21 DSGVO)</h3>
        <p>
          Sie können jederzeit der Verarbeitung Ihrer Daten für Direktmarketingzwecke widersprechen.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">9.7 Recht auf Beschwerde (Art. 77 DSGVO)</h3>
        <p>
          Wenn Sie der Ansicht sind, dass wir gegen Datenschutzgesetze verstoßen haben, können Sie eine Beschwerde bei der zuständigen Aufsichtsbehörde einreichen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Datensicherheit</h2>
        <p>Wir setzen geeignete technische und organisatorische Maßnahmen zum Schutz Ihrer Daten um, einschließlich:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Verschlüsselung während der Übertragung (SSL/TLS) und im Ruhezustand (Datenbankverschlüsselung)</li>
          <li>Sichere Authentifizierung mit verschlüsselten Passwörtern (bcrypt)</li>
          <li>Regelmäßige Sicherheitsaudits und Schwachstellenscanning</li>
          <li>Zugriffskontrollen und rollenbasierte Berechtigungen</li>
          <li>Automatisierte Backups mit Verschlüsselung</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren, um Änderungen in unseren Praktiken oder gesetzlichen
          Anforderungen widerzuspiegeln. Wir werden Sie über wesentliche Änderungen per E-Mail oder durch einen Hinweis auf unserer
          Website informieren.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Kontakt</h2>
        <p>
          Wenn Sie Fragen zu dieser Datenschutzerklärung haben oder Ihre Rechte ausüben möchten, kontaktieren Sie uns bitte unter:
        </p>
        <div className="bg-gray-50 p-4 rounded mt-2">
          <p><strong>Next Commerce GmbH</strong></p>
          <p>Ahornweg 5, 97990 Weikersheim, Deutschland</p>
          <p>E-Mail: <a href="mailto:info@next-commerce.io" className="text-purple-600 hover:underline">info@next-commerce.io</a></p>
        </div>
      </section>
    </div>
  )
}
