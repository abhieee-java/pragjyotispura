import { useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import ParticleButton, { type ParticleButtonStatus } from '@/components/kokonutui/particle-button'
import './waitlist.css'
import './earth-motion'

function WaitlistForm() {
  const [status, setStatus] = useState<ParticleButtonStatus>('idle')
  const [message, setMessage] = useState('')

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'pending') return

    const form = event.currentTarget
    const email = new FormData(form).get('email')
    setStatus('pending')
    setMessage('')
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      })
      const result = await response.json()
      setStatus(response.ok ? 'success' : 'error')
      setMessage(result.message)
      if (response.ok) form.reset()
    } catch {
      setStatus('error')
      setMessage('Could not save your signup. Please try again.')
    }
  }

  return (
    <form onSubmit={join}>
      <label className="sr-only" htmlFor="email">Email address</label>
      <div className="row">
        <input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email" maxLength={254} required
          onChange={() => {
            if (status !== 'pending') {
              setStatus('idle')
              setMessage('')
            }
          }}
        />
        <ParticleButton type="submit" disabled={status === 'pending'} status={status}
          pendingLabel="Joining…" successLabel="You’re on the list" errorLabel="Try again"
        >
          Get notified
        </ParticleButton>
      </div>
      <p className="note" role="status">{message || 'Get an email when we launch.'}</p>
    </form>
  )
}

createRoot(document.getElementById('waitlist-form')!).render(<WaitlistForm />)
