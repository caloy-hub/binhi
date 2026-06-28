import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import GenerateLessonPlan from './pages/GenerateLessonPlan'
import GenerateLAS from './pages/GenerateLAS'
import MyDocuments from './pages/MyDocuments'
import TemplateManager from './pages/TemplateManager'
import Layout from './components/Layout'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--leaf-light)', borderTopColor: 'var(--leaf)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Loading BINHI...</p>
    </div>
  )

  if (!session) return <AuthPage />

  return (
    <Layout session={session}>
      <Routes>
        <Route path="/" element={<Dashboard session={session} />} />
        <Route path="/generate/lesson-plan" element={<GenerateLessonPlan session={session} />} />
        <Route path="/generate/las" element={<GenerateLAS session={session} />} />
        <Route path="/documents" element={<MyDocuments session={session} />} />
        <Route path="/templates" element={<TemplateManager />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
