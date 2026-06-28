import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { generateLAS } from '../lib/generateLAS'
import { GRADE_LEVELS, QUARTERS, WEEKS, ACTIVITY_TYPES, getSubjectsByGrade } from '../data/curriculum'
import { Wand2, Printer, Save, ChevronDown } from 'lucide-react'

export default function GenerateLAS({ session }) {
  const [form, setForm] = useState({
    gradeLevel: 'Grade 7', subject: '', quarter: 1, week: 1,
    activityType: 'worksheet', competency: '',
    additionalNotes: '', teacherName: '',
    school: 'Maria Cristina P. Belcar Agricultural High School'
  })
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const printRef = useRef()

  const subjects = getSubjectsByGrade(form.gradeLevel)
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleGenerate = async () => {
    if (!form.subject || !form.competency) {
      setError('Please fill in Subject and Learning Competency.')
      return
    }
    setLoading(true)
    setError(null)
    setOutput(null)
    setSaved(false)
    try {
      const text = await generateLAS(form)
      setOutput(text)
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!output) return
    const { error } = await supabase.from('activity_sheets').insert({
      user_id: session.user.id,
      grade_level: form.gradeLevel,
      subject: form.subject,
      quarter: form.quarter,
      week: form.week,
      activity_type: form.activityType,
      learning_competency: form.competency,
      generated_text: output,
      title: `${form.subject} LAS Q${form.quarter} W${form.week} — ${form.gradeLevel}`
    })
    if (!error) setSaved(true)
    else setError('Failed to save. Check your Supabase connection.')
  }

  const handlePrint = () => window.print()

  return (
    <div style={{ padding: '36px 48px', maxWidth: 1100, display: 'flex', gap: 32 }}>
      <div style={{ width: 340, flexShrink: 0 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Activity Sheet (LAS)</h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginBottom: 24 }}>
          Generate a print-ready Learning Activity Sheet with tiered activities, rubric, and answer key.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SelectField label="Grade Level" value={form.gradeLevel}
            onChange={v => { set('gradeLevel', v); set('subject', '') }}
            options={GRADE_LEVELS.map(g => ({ value: g, label: g }))} />

          <SelectField label="Subject" value={form.subject}
            onChange={v => set('subject', v)}
            options={subjects.map(s => ({ value: s, label: s }))}
            placeholder="Select subject..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectField label="Quarter" value={form.quarter}
              onChange={v => set('quarter', Number(v))}
              options={QUARTERS.map(q => ({ value: q.value, label: q.label }))} />
            <SelectField label="Week" value={form.week}
              onChange={v => set('week', Number(v))}
              options={WEEKS.map(w => ({ value: w.value, label: w.label }))} />
          </div>

          <SelectField label="Activity Type" value={form.activityType}
            onChange={v => set('activityType', v)}
            options={ACTIVITY_TYPES.map(a => ({ value: a.value, label: a.label }))} />

          <TextArea label="Learning Competency (MELC)" value={form.competency}
            onChange={v => set('competency', v)}
            placeholder="e.g. Describes well-defined sets and subsets (M7Q1W1)"
            rows={3} />

          <TextInput label="Teacher's Name (optional)" value={form.teacherName}
            onChange={v => set('teacherName', v)} placeholder="Juan dela Cruz" />

          <TextInput label="School" value={form.school}
            onChange={v => set('school', v)}
            placeholder="Maria Cristina P. Belcar Agricultural High School" />

          <TextArea label="Additional Instructions (optional)" value={form.additionalNotes}
            onChange={v => set('additionalNotes', v)}
            placeholder="e.g. Include agricultural context examples..." rows={2} />

          {error && (
            <div style={{ background: 'var(--error-light)', border: '1px solid #F5C6C2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading} style={{
            background: loading ? 'var(--grain)' : 'var(--grain-dark)',
            color: 'white', border: 'none', borderRadius: 9,
            padding: '12px 18px', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginTop: 4, opacity: loading ? 0.8 : 1
          }}>
            <Wand2 size={16} />
            {loading ? 'Generating with Claude AI...' : 'Generate Activity Sheet'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {!output && !loading && (
          <div style={{
            height: 400, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            border: '2px dashed var(--border)', borderRadius: 16,
            color: 'var(--ink-faint)', gap: 12
          }}>
            <Wand2 size={36} color="var(--grain)" />
            <p style={{ fontSize: 15 }}>Your Learning Activity Sheet will appear here.</p>
            <p style={{ fontSize: 13 }}>Fill in the details and click Generate.</p>
          </div>
        )}

        {loading && (
          <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '3px solid var(--grain-light)', borderTopColor: 'var(--grain)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--ink-muted)' }}>Claude is creating your activity sheet...</p>
            <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>This usually takes 20–40 seconds.</p>
          </div>
        )}

        {output && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }} className="no-print">
              <button onClick={handleSave} disabled={saved} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: saved ? 'var(--success-light)' : 'white',
                color: saved ? 'var(--success)' : 'var(--ink)',
                border: '1.5px solid ' + (saved ? 'var(--success)' : 'var(--border)'),
                borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600
              }}>
                <Save size={14} /> {saved ? 'Saved!' : 'Save to My Documents'}
              </button>
              <button onClick={handlePrint} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'var(--grain-dark)', color: 'white', border: 'none',
                borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600
              }}>
                <Printer size={14} /> Print / Download PDF
              </button>
            </div>

            <div ref={printRef} className="print-area" style={{
              background: 'white', border: '1px solid var(--border)', borderRadius: 12,
              padding: '32px 36px', fontFamily: 'Courier New, monospace', fontSize: 13,
              lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--ink)',
              maxHeight: '75vh', overflowY: 'auto'
            }}>
              {output}
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
        <select value={value} onChange={e => onChange(e.target.value)} style={{
          width: '100%', padding: '9px 32px 9px 12px',
          border: '1.5px solid var(--border)', borderRadius: 8,
          fontSize: 14, background: 'white', appearance: 'none', color: 'var(--ink)'
        }}>
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
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--ink)' }} />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical', color: 'var(--ink)', lineHeight: 1.55 }} />
    </div>
  )
}
