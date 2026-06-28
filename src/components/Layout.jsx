import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, FileText, LayoutDashboard, LogOut, Sprout, FolderOpen, LayoutTemplate } from 'lucide-react'
import { getLPTemplate, getLASTemplate } from '../lib/templateStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generate/lesson-plan', icon: BookOpen, label: 'Lesson Plan' },
  { to: '/generate/las', icon: FileText, label: 'Activity Sheet' },
  { to: '/templates', icon: LayoutTemplate, label: 'My Templates' },
  { to: '/documents', icon: FolderOpen, label: 'My Documents' },
]

export default function Layout({ children, session }) {
  const navigate = useNavigate()
  const hasLPTemplate = !!getLPTemplate()
  const hasLASTemplate = !!getLASTemplate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 228, background: 'var(--leaf-dark)', color: 'white',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 40, height: 40, background: 'rgba(200,151,58,0.2)',
              border: '1.5px solid var(--grain)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <line x1="12" y1="22" x2="12" y2="10" stroke="#C8973A" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 16 Q7 12 7 6 Q12 8 12 16Z" fill="#4CAF64"/>
                <path d="M12 13 Q17 9 17 3 Q12 6 12 13Z" fill="#A5D6A7"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1, fontFamily: 'Lora, serif', letterSpacing: '0.04em', color: '#C8973A' }}>
                BINHI
              </div>
              <div style={{ fontSize: 9.5, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
                Lesson Generator
              </div>
            </div>
          </div>
          <p style={{ fontSize: 10, opacity: 0.45, marginTop: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
            Maria Cristina P. Belcar Agricultural High School
          </p>
        </div>

        {/* Template status badge */}
        {(hasLPTemplate || hasLASTemplate) && (
          <div style={{ margin: '12px 12px 0', background: 'rgba(200,151,58,0.15)', border: '1px solid rgba(200,151,58,0.3)', borderRadius: 8, padding: '8px 12px' }}>
            <p style={{ fontSize: 10.5, color: '#C8973A', fontWeight: 600, marginBottom: 3 }}>📄 Custom Templates Active</p>
            <p style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.4 }}>
              {hasLPTemplate && hasLASTemplate ? 'LP + LAS templates loaded'
                : hasLPTemplate ? 'LP template loaded'
                : 'LAS template loaded'}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px' }}>
          <p style={{ fontSize: 9.5, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '6px 10px 8px', marginBottom: 2 }}>
            Menu
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              borderRadius: 8, marginBottom: 3, fontSize: 13.5, fontWeight: 500,
              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--grain)' : '3px solid transparent',
              transition: 'all 0.15s'
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '14px 14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session?.user?.email}
          </p>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: 'rgba(255,255,255,0.7)', padding: '7px 12px',
            borderRadius: 7, fontSize: 13, width: '100%', cursor: 'pointer'
          }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 228, flex: 1, minHeight: '100vh', background: 'var(--paper)' }}>
        {children}
      </main>
    </div>
  )
}
