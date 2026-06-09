import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewsletterStrip() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    const { error } = await supabase
      .from('email_signups')
      .insert({ email: email.trim().toLowerCase(), source: 'newsletter' })

    if (error && error.code === '23505') {
      // Duplicate — treat as success so we don't leak whether email exists
      setStatus('success')
      return
    }

    if (error) {
      setStatus('error')
      return
    }

    setStatus('success')
    setEmail('')
  }

  return (
    <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Get HIPAA compliance tips for health tech founders
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Practical guides on HIPAA audits, BAAs, and security policies. No spam.
        </p>

        {status === 'success' ? (
          <p className="mt-6 text-sm font-medium text-green-600 dark:text-green-400">
            You're in — we'll be in touch.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@healthtech.com"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-2 text-xs text-red-500">Something went wrong — please try again.</p>
        )}
      </div>
    </section>
  )
}
