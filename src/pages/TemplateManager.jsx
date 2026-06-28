import { useState, useRef } from 'react'
import mammoth from 'mammoth'
import {
  saveLPTemplate, saveLASTemplate,
  getLPTemplate, getLASTemplate,
  clearLPTemplate, clearLASTemplate
} from '../lib/templateStore'
import { Upload, Trash2, CheckCircle, BookOpen, FileText, Eye, EyeOff } from 'lucide-react'

export default function TemplateManager() {
  const [lpTemplate, setLpTemplate] = useState(getLPTemplate())
  const [lasTemplate, setLasTemplate] = useState(getLASTemplate())
  const [lpLoading, setLpLoading] = useState(false)
  const [lasLoading, setLasLoading] = useState(false)
  const [lpError, setLpError] = useState(null)
  const [lasError, setLasError] = useState(null)
  const [showLpPreview, setShowLpPreview] = useState(false)
  const [showLasPreview, setShowLasPreview] = useState(false)

  const lpRef = useRef()
  const lasRef = useRef()

  const extractDocx = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result
          const result = await mammoth.extractRawText({ arrayBuffer })
          resolve(result.value)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleLPUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.docx')) {
      setLpError('Please upload a .docx file only.')
      return
    }
    setLpLoading(true)
    setLpError(null)
    try {
      const text = await extractDocx(file)
      if (!text || text.trim().length < 50) {
        setLpError('The document appears to be empty or unreadable. Please try a different file.')
        setLpLoading(false)
        return
      }
      saveLPTemplate(text)
      setLpTemplate(text)
    } catch (err) {
      setLpError('Failed to read the document. Make sure it is a valid .docx file.')
    }
    setLpLoading(false)
    e.target.value = ''
  }

  const handleLASUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.docx')) {
      setLasError('Please upload a .docx file only.')
      return
    }
    setLasLoading(true)
    setLasError(null)
    try {
      const text = await extractDocx(file)
      if (!text || text.trim().length < 50) {
        setLasError('The document appears to be empty or unreadable. Please try a different file.')
        setLasLoading(false)
        return
      }
      saveLASTemplate(text)
      setLasTemplate(text)
    } catch (err) {
      setLasError('Failed to read the document. Make sure it is a valid .docx file.')
    }
    setLasLoading(false)
    e.target.value = ''
  }

  const handleClearLP = () => {
    if (!confirm('Remove the Lesson Plan template? DeepSeek will use the default format.')) return
    clearLPTemplate()
    setLpTemplate(null)
    setShowLpPreview(false)
  }

  const handleClearLAS = () => {
    if (!confirm('Remove the Activity Sheet template? DeepSeek will use the default format.')) return
    clearLASTemplate()
    setLasTemplate(null)
    setShowLasPreview(false)
  }

  return (
    <div style={{ padding: '36px 52px', maxWidth: 860 }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>My Templates</h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        Upload your school's official DepEd Word templates (.docx). DeepSeek will read the structure
        and always generate content that follows your exact format — headings, sections, labels, and layout.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Lesson Plan Template */}
        <TemplateCard
          icon={BookOpen}
          color="var(--leaf)"
          bg="var(--leaf-light)"
          title="Lesson Plan Template"
          description="Your school's official LP format. DeepSeek will fill in all sections following this exact structure."
          template={lpTemplate}
          loading={lpLoading}
          error={lpError}
          showPreview={showLpPreview}
          onTogglePreview={() => setShowLpPreview(p => !p)}
          onUploadClick={() => lpRef.current.click()}
          onClear={handleClearLP}
          inputRef={lpRef}
          onFileChange={handleLPUpload}
          uploadLabel="Upload LP Template (.docx)"
        />

        {/* LAS Template */}
        <TemplateCard
          icon={FileText}
          color="var(--grain-dark)"
          bg="var(--grain-light)"
          title="Learning Activity Sheet Template"
          description="Your school's official LAS format. DeepSeek will fill in all sections following this exact structure."
          template={lasTemplate}
          loading={lasLoading}
          error={lasError}
          showPreview={showLasPreview}
          onTogglePreview={() => setShowLasPreview(p => !p)}
          onUploadClick={() => lasRef.current.click()}
          onClear={handleClearLAS}
          inputRef={lasRef}
          onFileChange={handleLASUpload}
          uploadLabel="Upload LAS Template (.docx)"
        />
      </div>

      {/* How it works */}
      <div style={{
        marginTop: 40, background: 'var(--leaf-light)',
        border: '1px solid #B8DFC0', borderLeft: '4px solid var(--leaf)',
        borderRadius: 10, padding: '18px 22px'
      }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--leaf-dark)', marginBottom: 10 }}>
          🌱 How template matching works
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            '1. Upload your school\'s .docx template above',
            '2. BINHI reads and saves the structure of your template',
            '3. When you generate a Lesson Plan or LAS, DeepSeek is given your template\'s exact format',
            '4. DeepSeek fills in all the content while preserving your headings, labels, and section order',
            '5. The output will match your template — ready to copy into your Word document'
          ].map(s => (
            <p key={s} style={{ fontSize: 13.5, color: 'var(--leaf-dark)', lineHeight: 1.6 }}>{s}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

function TemplateCard({
  icon: Icon, color, bg, title, description,
  template, loading, error, showPreview,
  onTogglePreview, onUploadClick, onClear,
  inputRef, onFileChange, uploadLabel
}) {
  return (
    <div style={{
      background: 'white', border: '1.5px solid var(--border)',
      borderRadius: 14, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16, borderBottom: template ? '1px solid var(--border)' : 'none' }}>
        <div style={{ width: 46, height: 46, background: bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{title}</p>
            {template && (
              <span style={{ background: 'var(--success-light)', color: 'var(--success)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={11} /> Template loaded
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.55 }}>{description}</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="file"
          accept=".docx"
          ref={inputRef}
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
        <button
          onClick={onUploadClick}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: color, color: 'white', border: 'none',
            borderRadius: 8, padding: '9px 16px', fontSize: 13,
            fontWeight: 600, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer'
          }}
        >
          <Upload size={14} />
          {loading ? 'Reading template...' : (template ? 'Replace Template' : uploadLabel)}
        </button>

        {template && (
          <>
            <button
              onClick={onTogglePreview}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'var(--paper-dark)', color: 'var(--ink-muted)',
                border: '1.5px solid var(--border)', borderRadius: 8,
                padding: '9px 14px', fontSize: 13, fontWeight: 600
              }}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Hide Preview' : 'Preview Template'}
            </button>
            <button
              onClick={onClear}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'none', color: 'var(--error)',
                border: '1.5px solid #F5C6C2', borderRadius: 8,
                padding: '9px 14px', fontSize: 13, fontWeight: 600
              }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '0 24px 16px', background: 'var(--error-light)', border: '1px solid #F5C6C2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {/* Preview */}
      {template && showPreview && (
        <div style={{
          margin: '0 24px 20px',
          background: 'var(--paper)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '20px 22px',
          fontFamily: 'Courier New, monospace', fontSize: 12.5,
          lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--ink)',
          maxHeight: 360, overflowY: 'auto'
        }}>
          {template.substring(0, 2000)}{template.length > 2000 ? '\n\n... (truncated for preview)' : ''}
        </div>
      )}

      {/* Empty state */}
      {!template && !loading && (
        <div style={{
          margin: '0 24px 20px', border: '2px dashed var(--border)',
          borderRadius: 10, padding: '28px 20px', textAlign: 'center',
          color: 'var(--ink-faint)'
        }}>
          <Upload size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p style={{ fontSize: 13.5, marginBottom: 4 }}>No template uploaded yet</p>
          <p style={{ fontSize: 12 }}>DeepSeek will use the default MATATAG format</p>
        </div>
      )}
    </div>
  )
}
