import { Link } from 'react-router-dom'
import PricingSection from '../components/landing/PricingSection'
import NewsletterStrip from '../components/landing/NewsletterStrip'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-gray-900 dark:text-white">Privara</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 mb-6">
          HIPAA Compliance for Health Tech Startups
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight sm:text-6xl">
          Get HIPAA compliant<br />in hours, not months
        </h1>
        <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Privara runs a 40-question risk assessment, scores your compliance posture with AI,
          generates policy documents, and produces a shareable audit report — all in one place.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 shadow-sm"
          >
            Start free assessment
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything you need to pass a HIPAA audit
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Risk Assessment', desc: '40-question assessment across 5 HIPAA domains — takes 15 minutes.' },
              { title: 'AI Compliance Score', desc: 'Claude AI scores your responses and identifies gaps by severity.' },
              { title: 'Policy Generator', desc: 'Auto-generate Privacy Policy, Security Policy, and Incident Response Plan.' },
              { title: 'Gap Analysis', desc: 'Prioritized list of compliance gaps with actionable remediation steps.' },
              { title: 'Remediation Tracker', desc: 'Track which gaps are open, in progress, or resolved.' },
              { title: 'Shareable Audit Report', desc: 'Send a professional compliance report to partners, investors, or auditors.' },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Newsletter */}
      <NewsletterStrip />

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-6 text-center text-sm text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} Privara. Built for health tech startups.
      </footer>
    </div>
  )
}
