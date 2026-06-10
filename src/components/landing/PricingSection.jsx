import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const TIERS = [
  {
    name: 'Starter',
    subtitle: 'For pre-seed startups just getting compliant',
    monthly: 99,
    annual: 79,
    cta: 'Get started',
    ctaTo: '/signup',
    ctaStyle: 'outline',
    badge: null,
    included: [
      '1 HIPAA risk assessment',
      'AI compliance score',
      'Gap analysis report',
      '3 generated policy documents',
      'Shareable report link',
    ],
    excluded: [
      'BAA tracker',
      'Staff training module',
      'Unlimited re-assessments',
    ],
  },
  {
    name: 'Growth',
    subtitle: 'For seed-stage startups closing enterprise deals',
    monthly: 299,
    annual: 239,
    cta: 'Start free trial',
    ctaTo: '/signup?plan=growth',
    ctaStyle: 'solid',
    badge: '14-day free trial',
    popular: true,
    included: [
      'Everything in Starter',
      'Unlimited re-assessments',
      'BAA tracker (up to 25 vendors)',
      'Remediation tracker',
      'Staff training module',
      'Priority email support',
    ],
    excluded: [
      'Custom policy templates',
      'API access',
    ],
  },
  {
    name: 'Scale',
    subtitle: 'For Series A+ teams with compliance requirements',
    monthly: 599,
    annual: 479,
    cta: 'Talk to us',
    ctaTo: 'mailto:hello@privara.io?subject=Scale plan enquiry',
    ctaStyle: 'outline',
    badge: null,
    included: [
      'Everything in Growth',
      'Unlimited BAA tracking',
      'Custom policy templates',
      'API access',
      'Up to 5 team seats',
      'Slack support channel',
      'Onboarding call',
      'Quarterly compliance review',
    ],
    excluded: [],
  },
]

const AUDIT_PREP = {
  name: 'Audit Prep Package',
  subtitle: 'A one-time document bundle for due diligence — no subscription needed',
  price: 499,
  cta: 'Get the Audit Prep Package',
  ctaTo: 'mailto:hello@privara.io?subject=Audit Prep Package ($499 one-time)',
  included: [
    'Full HIPAA risk assessment',
    'AI compliance score & gap analysis',
    'All generated policy documents',
    'Remediation tracker access',
    'Shareable audit report link',
    'One-time payment — no recurring billing',
  ],
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="py-24 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Replace $15,000 compliance consultants with a $299/mo subscription. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(a => !a)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                annual ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              aria-label="Toggle annual billing"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  annual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
              Annual
            </span>
            {annual && (
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl bg-white dark:bg-gray-900 p-8 ${
                tier.popular
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'border border-gray-100 dark:border-gray-700'
              }`}
            >
              {/* Most popular badge */}
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                </div>
              )}

              {/* Tier name + subtitle */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tier.name}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tier.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mt-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-medium text-gray-900 dark:text-white">
                    ${annual ? tier.annual : tier.monthly}
                  </span>
                  <span className="mb-1 text-sm text-gray-500 dark:text-gray-400">/mo</span>
                </div>
                {annual && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Billed annually</p>
                )}
                {tier.badge && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {tier.badge}
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6">
                {tier.ctaTo.startsWith('mailto:') ? (
                  <a
                    href={tier.ctaTo}
                    className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`}
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <Link
                    to={tier.ctaTo}
                    className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                      tier.ctaStyle === 'solid'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-gray-100 dark:border-gray-800" />

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {tier.included.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
                {tier.excluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <X size={16} className="mt-0.5 shrink-0 text-gray-300 dark:text-gray-600" />
                    <span className="text-sm text-gray-400 dark:text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* One-time Audit Prep Package */}
        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-dashed border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-8 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{AUDIT_PREP.name}</h3>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                One-time
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{AUDIT_PREP.subtitle}</p>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {AUDIT_PREP.included.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check size={16} className="mt-0.5 shrink-0 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 sm:mt-0 flex flex-col items-center gap-3 shrink-0">
            <div className="text-4xl font-medium text-gray-900 dark:text-white">${AUDIT_PREP.price}</div>
            <a
              href={AUDIT_PREP.ctaTo}
              className="block w-full whitespace-nowrap rounded-lg bg-blue-500 px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              {AUDIT_PREP.cta}
            </a>
          </div>
        </div>

        {/* Enterprise callout */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need more than 5 seats or a custom contract?{' '}
            <a href="mailto:hello@privara.io?subject=Enterprise pricing" className="font-medium text-blue-500 hover:text-blue-600">
              Contact us for enterprise pricing →
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
