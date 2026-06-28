import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('Maria Cristina P. Belcar Agricultural High School')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const getErrorMessage = (err) => {
    if (!err) return null
    if (typeof err === 'string') return err
    if (err?.message) return err.message
    if (err?.error_description) return err.error_description
    return 'Something went wrong. Please try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(getErrorMessage(error))
      } else {
        if (!email || !password) {
          setError('Please fill in your email and password.')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.')
          setLoading(false)
          return
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, school }
          }
        })
        if (error) {
          setError(getErrorMessage(error))
        } else if (data?.user) {
          setMessage('Account created! Check your email to confirm, or sign in now if email confirmation is disabled.')
        } else {
          setMessage('Check your email to confirm your account!')
        }
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }

    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--paper)' }}>

      {/* Left — brand panel */}
      <div style={{
        flex: 1, background: 'var(--leaf-dark)', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', padding: '60px 56px',
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(200,151,58,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(76,175,100,0.1)', pointerEvents: 'none' }} />

        <div style={{ marginBottom: 32 }}>
          <svg viewBox="0 0 56 56" width="56" height="56">
            <rect width="56" height="56" rx="14" fill="rgba(200,151,58,0.15)" stroke="rgba(200,151,58,0.4)" strokeWidth="1.5"/>
            <line x1="28" y1="46" x2="28" y2="22" stroke="#C8973A" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M28 34 Q18 28 18 16 Q28 20 28 34Z" fill="#4CAF64"/>
            <path d="M28 29 Q38 23 38 11 Q28 16 28 29Z" fill="#A5D6A7"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: 'Lora, serif', fontSize: 42, fontWeight: 700, color: '#C8973A', marginBottom: 4, letterSpacing: '0.05em' }}>
          BINHI
        </h1>
        <p style={{ fontSize: 13, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>
          Building Instruction through Narrated and Harmonized Intelligence
        </p>
        <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
          AI-powered lesson plans and learning activity sheets — aligned to the DepEd MATATAG curriculum, grown for Filipino teachers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {[
            '🌱  MATATAG 3-term curriculum aligned',
            '📋  Full DepEd Lesson Plan format',
            '📄  Learning Activity Sheets (LAS)',
            '🌾  Grades 7–12 · JHS & SHS coverage',
            '🖨️  Print-ready · Save & manage docs'
          ].map(f => (
            <p key={f} style={{ fontSize: 13.5, opacity: 0.75 }}>{f}</p>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: 12, opacity: 0.4, fontStyle: 'italic' }}>
            Maria Cristina P. Belcar Agricultural High School
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        width: 460, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 52px', background: 'white'
      }}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 26, marginBottom: 6 }}>
          {mode === 'login' ? 'Maligayang pagbabalik' : 'Sumali sa BINHI'}
        </h2>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 30 }}>
          {mode === 'login'
            ? 'Sign in to your teacher account.'
            : 'Create your free teacher account.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <>
              <Field
                label="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Juan dela Cruz"
              />
              <Field
                label="School"
                value={school}
                onChange={e => setSchool(e.target.value)}
                placeholder="School name"
              />
            </>
          )}

          <Field
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="teacher@deped.gov.ph"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />

          {/* Error message */}
          {error && (
            <div style={{
              background: 'var(--error-light)',
              border: '1px solid #F5C6C2',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--error)',
              lineHeight: 1.5
            }}>
              {error}
            </div>
          )}

          {/* Success message */}
          {message && (
            <div style={{
              background: 'var(--success-light)',
              border: '1px solid #A8D9BC',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--success)',
              lineHeight: 1.5
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--leaf-mid)' : 'var(--leaf)',
              color: 'white',
              border: 'none',
              borderRadius: 9,
              padding: '13px 20px',
              fontWeight: 700,
              fontSize: 15,
              marginTop: 4,
              opacity: loading ? 0.8 : 1,
              transition: 'background 0.15s'
            }}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={{ marginTop: 26, fontSize: 14, color: 'var(--ink-muted)', textAlign: 'center' }}>
          {mode === 'login' ? "Wala pang account? " : 'May account na? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
              setMessage(null)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--leaf)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            {mode === 'login' ? 'Mag-sign up' : 'Mag-sign in'}
          </button>
        </p>

        <p style={{ marginTop: 40, fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', lineHeight: 1.6 }}>
          BINHI · Maria Cristina P. Belcar Agricultural High School<br />
          Powered by Anthropic Claude AI
        </p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          padding: '10px 13px',
          border: '1.5px solid var(--border)',
          borderRadius: 8,
          fontSize: 14,
          outline: 'none',
          color: 'var(--ink)',
          background: 'var(--paper)',
          transition: 'border-color 0.15s'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--leaf)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
