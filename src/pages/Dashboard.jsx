import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, FileText, ChevronRight, Clock, Sprout } from 'lucide-react'

const QUOTES = [
  '"Ang bawat aralin, isang binhi ng kaalaman na itatanim sa isipan ng bawat mag-aaral."',
  '"Plant the lesson. Watch the learner grow."',
  '"Ang punong malalim ang ugat ay hindi matitinag ng bagyo."',
  '"A teacher plants seeds of knowledge that grow forever."',
]

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [recent, setRecent] = useState({ lessonPlans: [], activitySheets: [] })
  const [counts, setCounts] = useState({ lp: 0, las: 0 })
  const [profile, setProfile] = useState(null)
  const quote = QUOTES[new Date().getDay() % QUOTES.length]

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const uid = session.user.id
    const [{ data: lps }, { data: las }, { data: prof }] = await Promise.all([
      supabase.from('lesson_plans').select('id,title,subject,grade_level,quarter,week,created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(3),
      supabase.from('activity_sheets').select('id,title,subject,grade_level,quarter,week,created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(3),
      supabase.from('profiles').select('*').eq('id', uid).single()
    ])
    setRecent({ lessonPlans: lps || [], activitySheets: las || [] })
    setProfile(prof)

    const [{ count: lpCount }, { count: lasCount }] = await Promise.all([
      supabase.from('lesson_plans').select('*', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('activity_sheets').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    ])
    setCounts({ lp: lpCount || 0, las: lasCount || 0 })
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Magandang umaga'
    if (h < 18) return 'Magandang hapon'
    return 'Magandang gabi'
  }

  const allRecent = [
    ...recent.lessonPlans.map(d => ({ ...d, type: 'LP' })),
    ...recent.activitySheets.map(d => ({ ...d, type: 'LAS' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  return (
    <div style={{ padding: '40px 52px', maxWidth: 920 }}>

      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ color: 'var(--grain-dark)', fontWeight: 700, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
          {greeting()}, Guro 🌱
        </p>
        <h1 style={{ fontSize: 30, marginBottom: 6 }}>
          {profile?.full_name || 'Welcome to BINHI'}
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14.5 }}>
          {profile?.school || 'Maria Cristina P. Belcar Agricultural High School'}
        </p>
      </div>

      {/* Quote banner */}
      <div style={{
        background: 'var(--leaf-light)', border: '1px solid #B8DFC0',
        borderLeft: '4px solid var(--leaf)', borderRadius: 10,
        padding: '14px 20px', marginBottom: 32, marginTop: 24
      }}>
        <p style={{ fontSize: 13.5, color: 'var(--leaf-dark)', fontStyle: 'italic', lineHeight: 1.6 }}>
          {quote}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
        <StatCard icon={BookOpen} color="var(--leaf)" bg="var(--leaf-light)" label="Lesson Plans Created" value={counts.lp} />
        <StatCard icon={FileText} color="var(--grain-dark)" bg="var(--grain-light)" label="Activity Sheets Created" value={counts.las} />
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Generate New</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        <ActionCard
          icon={BookOpen}
          title="Lesson Plan"
          description="Full DepEd-format lesson plan — Objectives, Procedure, Evaluation, and Reflection — aligned to MATATAG competencies."
          color="var(--leaf)"
          bg="var(--leaf-light)"
          onClick={() => navigate('/generate/lesson-plan')}
        />
        <ActionCard
          icon={FileText}
          title="Learning Activity Sheet"
          description="Student-ready LAS with background information, tiered activities, rubric, and answer key. Print-ready."
          color="var(--grain-dark)"
          bg="var(--grain-light)"
          onClick={() => navigate('/generate/las')}
        />
      </div>

      {/* Recent documents */}
      {allRecent.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18 }}>Recent Documents</h2>
            <button onClick={() => navigate('/documents')} style={{
              background: 'none', border: 'none', color: 'var(--leaf)', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
            }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {allRecent.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                background: 'white', borderRadius: 10, border: '1px solid var(--border)'
              }}>
                <span style={{
                  background: doc.type === 'LP' ? 'var(--leaf-light)' : 'var(--grain-light)',
                  color: doc.type === 'LP' ? 'var(--leaf-dark)' : 'var(--grain-dark)',
                  padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700, flexShrink: 0
                }}>{doc.type}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.title || `${doc.subject} — Q${doc.quarter} W${doc.week}`}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <Clock size={12} />
                  {new Date(doc.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allRecent.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 24px', border: '2px dashed var(--border)', borderRadius: 16,
          color: 'var(--ink-faint)', gap: 12, textAlign: 'center'
        }}>
          <Sprout size={36} color="var(--leaf-mid)" />
          <p style={{ fontSize: 15, fontWeight: 500 }}>No documents yet — plant your first one.</p>
          <p style={{ fontSize: 13 }}>Click "Lesson Plan" or "Activity Sheet" above to generate your first document.</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, color, bg, label, value }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 46, height: 46, background: bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Lora, serif', color: 'var(--ink)' }}>{value}</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{label}</p>
      </div>
    </div>
  )
}

function ActionCard({ icon: Icon, title, description, color, bg, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'white', border: '1.5px solid var(--border)', borderRadius: 14,
      padding: '22px 22px', textAlign: 'left', cursor: 'pointer',
      display: 'flex', gap: 16, transition: 'all 0.15s', outline: 'none'
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.background = bg }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'white' }}>
      <div style={{ width: 46, height: 46, background: bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 5 }}>{title}</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{description}</p>
      </div>
    </button>
  )
}
