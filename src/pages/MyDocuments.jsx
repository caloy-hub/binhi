import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { BookOpen, FileText, Trash2, Printer, Search, ChevronDown } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

export default function MyDocuments({ session }) {
  const [tab, setTab] = useState('lesson_plans')
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [selected, setSelected] = useState(null)
  const printRef = useRef()

  useEffect(() => { loadDocs() }, [tab])

  const loadDocs = async () => {
    setLoading(true)
    setSelected(null)
    const table = tab === 'lesson_plans' ? 'lesson_plans' : 'activity_sheets'
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    const table = tab === 'lesson_plans' ? 'lesson_plans' : 'activity_sheets'
    await supabase.from(table).delete().eq('id', id)
    setDocs(d => d.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const filtered = docs.filter(d => {
    const matchSearch = !search || (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.subject || '').toLowerCase().includes(search.toLowerCase())
    const matchGrade = !filterGrade || d.grade_level === filterGrade
    return matchSearch && matchGrade
  })

  const grades = [...new Set(docs.map(d => d.grade_level).filter(Boolean))]

  return (
    <div style={{ padding: '36px 48px', maxWidth: 1200, display: 'flex', gap: 28, height: 'calc(100vh - 0px)' }}>
      {/* Left: list */}
      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 style={{ fontSize: 24, marginBottom: 0 }}>My Documents</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--paper-dark)', borderRadius: 9, padding: 3 }}>
          {[
            { key: 'lesson_plans', icon: BookOpen, label: 'Lesson Plans' },
            { key: 'activity_sheets', icon: FileText, label: 'Activity Sheets' }
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 10px', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? 'var(--ink)' : 'var(--ink-muted)',
              boxShadow: tab === t.key ? 'var(--shadow)' : 'none', transition: 'all 0.15s'
            }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
          </div>
          {grades.length > 1 && (
            <div style={{ position: 'relative' }}>
              <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{
                padding: '8px 28px 8px 10px', border: '1.5px solid var(--border)', borderRadius: 8,
                fontSize: 13, background: 'white', appearance: 'none'
              }}>
                <option value="">All grades</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-faint)' }} />
            </div>
          )}
        </div>

        {/* Doc list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading && <p style={{ color: 'var(--ink-muted)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>Loading...</p>}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-faint)' }}>
              <p style={{ fontSize: 15, marginBottom: 6 }}>No documents yet.</p>
              <p style={{ fontSize: 13 }}>Generate your first {tab === 'lesson_plans' ? 'lesson plan' : 'activity sheet'} to get started.</p>
            </div>
          )}
          {filtered.map(doc => (
            <div key={doc.id} onClick={() => setSelected(doc)} style={{
              padding: '12px 14px', background: selected?.id === doc.id ? 'var(--sky-light)' : 'white',
              border: '1.5px solid ' + (selected?.id === doc.id ? 'var(--leaf)' : 'var(--border)'),
              borderRadius: 10, cursor: 'pointer', transition: 'all 0.12s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.title || `${doc.subject} Q${doc.quarter} W${doc.week}`}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    {doc.grade_level} · Q{doc.quarter} W{doc.week} · {doc.subject}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 3 }}>
                    {new Date(doc.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button onClick={e => { e.stopPropagation(); handleDelete(doc.id) }} style={{
                  background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer',
                  padding: 4, borderRadius: 5, marginLeft: 8, flexShrink: 0
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-faint)'}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: preview */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!selected ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed var(--border)', borderRadius: 16, color: 'var(--ink-faint)', gap: 10
          }}>
            <BookOpen size={32} />
            <p style={{ fontSize: 15 }}>Select a document to preview it.</p>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 17, marginBottom: 2 }}>{selected.title}</h2>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                  {selected.grade_level} · {selected.subject} · Quarter {selected.quarter}, Week {selected.week}
                </p>
              </div>
              <button onClick={handlePrint} style={{
                display: 'flex', alignItems: 'center', gap: 7, background: 'var(--leaf)',
                color: 'white', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600
              }}>
                <Printer size={14} /> Print / PDF
              </button>
            </div>

            {/* Document preview */}
            <div ref={printRef} style={{
              flex: 1, background: 'white', border: '1px solid var(--border)', borderRadius: 12,
              padding: '32px 36px', overflowY: 'auto',
              fontFamily: tab === 'lesson_plans' ? 'Georgia, serif' : 'Courier New, monospace',
              fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--ink)'
            }}>
              {selected.generated_text || 'No content available.'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
