import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { GRADE_LEVELS, QUARTERS, WEEKS, DURATION_OPTIONS, APPROACHES, getSubjectsByGrade } from '../data/curriculum'
import { Wand2, Download, Save, ChevronDown, FileText } from 'lucide-react'

export default function GenerateLessonPlan({ session }) {
  const [form, setForm] = useState({
    gradeLevel: 'Grade 7', subject: '', quarter: 1, week: 1,
    durationMinutes: 60, competency: '',
    approach: "4A's (Activity – Analysis – Abstraction – Application)",
    additionalNotes: '', teacherName: '', teacherPosition: 'Teacher I',
    principal: '', principalPosition: 'Principal II',
    term: 'First Term',
    school: 'Maria Cristina P. Belcar Agricultural High School'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [saved, setSaved]   = useState(false)
  const [docxBlob, setDocxBlob] = useState(null)
  const [previewText, setPreviewText] = useState(null)

  const subjects = getSubjectsByGrade(form.gradeLevel)
  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); setDocxBlob(null) }

  const handleGenerate = async () => {
    if (!form.subject || !form.competency) { setError('Please fill in Subject and Learning Competency.'); return }
    setLoading(true); setError(null); setDocxBlob(null); setPreviewText(null); setSaved(false)
    try {
      const res = await fetch('/.netlify/functions/generate-lp-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }
      const blob = await res.blob()
      setDocxBlob(blob)
      setPreviewText(`✅ Lesson Plan generated successfully!\n\nSubject: ${form.subject}\nGrade Level: ${form.gradeLevel}\nQuarter ${form.quarter}, Week ${form.week}\n\nClick "Download .docx" to get your file — it will open in Microsoft Word with the exact ILAW template format including all tables, borders, and formatting.`)
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.')
    }
    setLoading(false)
  }

  const handleDownload = () => {
    if (!docxBlob) return
    const url = URL.createObjectURL(docxBlob)
    const a   = document.createElement('a')
    a.href = url
    a.download = `ILAW_LP_${form.subject.replace(/\s+/g,'_')}_Q${form.quarter}_W${form.week}.docx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!previewText) return
    const { error } = await supabase.from('lesson_plans').insert({
      user_id: session.user.id,
      grade_level: form.gradeLevel, subject: form.subject,
      quarter: form.quarter, week: form.week,
      duration_minutes: form.durationMinutes,
      most_essential_lc: form.competency,
      generated_text: previewText,
      title: `${form.subject} Q${form.quarter} W${form.week} — ${form.gradeLevel}`
    })
    if (!error) setSaved(true)
    else setError('Failed to save record.')
  }

  return (
    <div style={{ padding: '36px 48px', maxWidth: 1100, display: 'flex', gap: 32 }}>
      {/* Form */}
      <div style={{ width: 340, flexShrink: 0 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>ILAW Lesson Plan</h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginBottom: 8 }}>
          Generates a <strong>.docx</strong> file matching your school's exact ILAW template — tables, borders, green headers, and all.
        </p>
        <div style={{ background: 'var(--leaf-light)', border: '1px solid #B8DFC0', borderRadius: 8, padding: '9px 13px', marginBottom: 20, fontSize: 12.5, color: 'var(--leaf-dark)' }}>
          🌱 Output opens directly in Microsoft Word
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <SelectField label="Grade Level" value={form.gradeLevel} onChange={v => { set('gradeLevel', v); set('subject', '') }} options={GRADE_LEVELS.map(g => ({ value: g, label: g }))} />
          <SelectField label="Subject" value={form.subject} onChange={v => set('subject', v)} options={subjects.map(s => ({ value: s, label: s }))} placeholder="Select subject..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectField label="Quarter" value={form.quarter} onChange={v => set('quarter', Number(v))} options={QUARTERS.map(q => ({ value: q.value, label: q.label }))} />
            <SelectField label="Week" value={form.week} onChange={v => set('week', Number(v))} options={WEEKS.map(w => ({ value: w.value, label: w.label }))} />
          </div>
          <SelectField label="Term" value={form.term} onChange={v => set('term', v)}
            options={[{ value: 'First Term', label: 'First Term' }, { value: 'Second Term', label: 'Second Term' }, { value: 'Third Term', label: 'Third Term' }]} />
          <SelectField label="Duration" value={form.durationMinutes} onChange={v => set('durationMinutes', Number(v))} options={DURATION_OPTIONS.map(d => ({ value: d.value, label: d.label }))} />
          <SelectField label="Approach" value={form.approach} onChange={v => set('approach', v)} options={APPROACHES.map(a => ({ value: a, label: a }))} />
          <TextArea label="Learning Competency (MELC)" value={form.competency} onChange={v => set('competency', v)} placeholder="e.g. Apply laws of cosines in solving oblique triangles" rows={3} />
          <TextInput label="Teacher's Name" value={form.teacherName} onChange={v => set('teacherName', v)} placeholder="Juan dela Cruz" />
          <TextInput label="Teacher's Position" value={form.teacherPosition} onChange={v => set('teacherPosition', v)} placeholder="Teacher I" />
          <TextInput label="Principal's Name" value={form.principal} onChange={v => set('principal', v)} placeholder="Maria Santos" />
          <TextInput label="Principal's Position" value={form.principalPosition} onChange={v => set('principalPosition', v)} placeholder="Principal II" />
          <TextArea label="Additional Notes (optional)" value={form.additionalNotes} onChange={v => set('additionalNotes', v)} placeholder="e.g. Focus on agricultural applications..." rows={2} />

          {error && <div style={{ background: 'var(--error-light)', border: '1px solid #F5C6C2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--error)' }}>{error}</div>}

          <button onClick={handleGenerate} disabled={loading} style={{
            background: loading ? 'var(--leaf-mid)' : 'var(--leaf)', color: 'white', border: 'none',
            borderRadius: 9, padding: '12px 18px', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
            opacity: loading ? 0.8 : 1
          }}>
            <Wand2 size={16} />
            {loading ? 'DeepSeek is generating...' : 'Generate ILAW Lesson Plan (.docx)'}
          </button>
        </div>
      </div>

      {/* Output */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!docxBlob && !loading && (
          <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: 16, color: 'var(--ink-faint)', gap: 12 }}>
            <FileText size={40} color="var(--leaf-mid)" />
            <p style={{ fontSize: 15 }}>Your ILAW Lesson Plan .docx will appear here.</p>
            <p style={{ fontSize: 13 }}>Fill in the form and click Generate.</p>
          </div>
        )}

        {loading && (
          <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, border: '3px solid var(--leaf-light)', borderTopColor: 'var(--leaf)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--ink-muted)', fontWeight: 600 }}>DeepSeek is writing your lesson plan...</p>
            <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>Building structured content + formatting into Word document.</p>
            <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>This takes 30–60 seconds.</p>
          </div>
        )}

        {docxBlob && (
          <div>
            {/* Action bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={handleDownload} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--leaf)', color: 'white', border: 'none',
                borderRadius: 9, padding: '11px 20px', fontSize: 14, fontWeight: 700
              }}>
                <Download size={16} /> Download .docx
              </button>
              <button onClick={handleSave} disabled={saved} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: saved ? 'var(--success-light)' : 'white',
                color: saved ? 'var(--success)' : 'var(--ink)',
                border: '1.5px solid ' + (saved ? 'var(--success)' : 'var(--border)'),
                borderRadius: 9, padding: '11px 16px', fontSize: 14, fontWeight: 600
              }}>
                <Save size={14} /> {saved ? 'Saved to My Documents!' : 'Save Record'}
              </button>
            </div>

            {/* Preview card */}
            <div style={{ background: 'white', border: '1.5px solid var(--leaf)', borderRadius: 14, padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, background: 'var(--leaf-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} color="var(--leaf)" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>ILAW Lesson Plan — {form.subject}</p>
                  <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{form.gradeLevel} · {form.term} · Quarter {form.quarter}, Week {form.week}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Format', 'Microsoft Word (.docx) — ILAW Template'],
                  ['Sections', 'I. Intentions · II. Learning Experiences · III. Assessment · IV. Ways Forward'],
                  ['Approach', form.approach],
                  ['Competency', form.competency],
                  ['School', form.school],
                  ['Prepared by', `${form.teacherName || '[Teacher Name]'} · ${form.teacherPosition}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-muted)', width: 100, flexShrink: 0 }}>{label}</span>
                    <span style={{ color: 'var(--ink)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--leaf-light)', borderRadius: 9, fontSize: 13, color: 'var(--leaf-dark)', lineHeight: 1.6 }}>
                🌱 <strong>Download complete.</strong> Open the .docx in Microsoft Word — your ILAW template format is preserved: dark green section headers, two-column tables, bordered cells, Arial font, and all ILAW sections (Intentions, Learning Experiences, Assessment, Ways Forward).
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '9px 32px 9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'white', appearance: 'none', color: 'var(--ink)' }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-faint)' }} />
      </div>
    </div>
  )
}
function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--ink)' }} />
    </div>
  )
}
function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical', color: 'var(--ink)', lineHeight: 1.55 }} />
    </div>
  )
}
