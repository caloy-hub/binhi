// Generates LP content via DeepSeek then builds a .docx matching the ILAW template
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType
} = require('docx')

const W       = 9360
const FULL    = { size: W, type: WidthType.DXA }
const border  = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellPad = { top: 100, bottom: 100, left: 120, right: 120 }

const bold = (text, size=20) => new TextRun({ text: String(text||''), bold: true, size, font: 'Arial' })
const run  = (text, opts={}) => new TextRun({ text: String(text||''), font: 'Arial', size: 20, ...opts })
const para = (children, opts={}) => new Paragraph({
  alignment: opts.align || AlignmentType.LEFT,
  spacing: { before: opts.before||40, after: opts.after||40 },
  children: Array.isArray(children) ? children : [run(children||'')]
})

function sectionHeader(text) {
  return new Table({ width: FULL, columnWidths: [W], rows: [new TableRow({ children: [
    new TableCell({ borders, width: FULL, margins: cellPad,
      shading: { fill: '1B5E2A', type: ShadingType.CLEAR },
      children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: 22, color: 'FFFFFF', font: 'Arial' })]
      })]
    })
  ]})]})
}

function subHeader(text) {
  return new Table({ width: FULL, columnWidths: [W], rows: [new TableRow({ children: [
    new TableCell({ borders, width: FULL, margins: cellPad,
      shading: { fill: 'C8E6C9', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [bold(text)] })]
    })
  ]})]})
}

function contentCell(paragraphs) {
  return new Table({ width: FULL, columnWidths: [W], rows: [new TableRow({ children: [
    new TableCell({ borders, width: FULL, margins: cellPad, children: paragraphs })
  ]})]})
}

function textToParagraphs(text) {
  if (!text) return [para('')]
  return String(text).split('\n').map(line => {
    const t = line.trim()
    if (!t) return para('')
    const isBullet = /^[-•*]\s/.test(t)
    return new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: isBullet ? { left: 360 } : {},
      children: [run(isBullet ? t.replace(/^[-•*]\s/, '• ') : t)]
    })
  })
}

function metaRow(label, value) {
  return new TableRow({ children: [
    new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, margins: cellPad,
      shading: { fill: 'E8F5E9', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [bold(label)] })] }),
    new TableCell({ borders, width: { size: W-2400, type: WidthType.DXA }, margins: cellPad,
      children: [para(value||'')] })
  ]})
}

function reflectionRow(q) {
  return new TableRow({ children: [
    new TableCell({ borders, width: { size: 4200, type: WidthType.DXA }, margins: cellPad,
      shading: { fill: 'E8F5E9', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [bold(q)] })] }),
    new TableCell({ borders, width: { size: W-4200, type: WidthType.DXA }, margins: cellPad,
      children: [para(' ')] })
  ]})
}

function buildLPDoc(d) {
  const sessions = (d.sessions_content || '').split('---SESSION---').map((s, i) => {
    const lines = s.trim().split('\n')
    const title = lines[0] || `Session ${i+1}`
    const body  = lines.slice(1).join('\n').trim()
    return [subHeader(title), contentCell(textToParagraphs(body))]
  }).flat()

  return new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{
      properties: { page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }},
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [bold('DEPARTMENT OF EDUCATION', 24)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [bold('Region XI – Davao Region', 20)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [bold('MARIA CRISTINA P. BELCAR AGRICULTURAL HIGH SCHOOL', 22)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [bold('ILAW LESSON PLAN', 28)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [run('(Intentions • Learning Experiences • Assessment • Ways Forward)', { italics: true, size: 18 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [bold(d.subject||'', 22)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [bold(`${d.term||'First Term'} – Week ${d.week||'__'}`, 20)] }),

        new Table({ width: FULL, columnWidths: [2400, W-2400], rows: [
          metaRow('Strand / Domain', d.strand),
          metaRow('Learning Competency', d.competency),
          metaRow('Number of Sessions', d.numSessions || `5 sessions × ${d.duration||60} minutes`),
          metaRow('Contextualization', d.contextualization),
          metaRow('Learner Proficiency Level', d.proficiency || 'Approaching Proficiency to Developing'),
        ]}),
        para(' ', { before: 60, after: 40 }),

        new Table({ width: FULL, columnWidths: [W/2, W/2], rows: [new TableRow({ children: [
          new TableCell({ borders, width: { size: W/2, type: WidthType.DXA }, margins: cellPad,
            children: [para([bold('Prepared by: '), run(d.teacherName||'[Teacher Name]')]), para([run(d.teacherPosition||'Teacher I', { italics: true })])] }),
          new TableCell({ borders, width: { size: W/2, type: WidthType.DXA }, margins: cellPad,
            children: [para([bold('Submitted to: '), run(d.principal||'[Principal Name]')]), para([run(d.principalPosition||'Principal II', { italics: true })])] }),
        ]})]})
        , para(' '),

        sectionHeader('I.  INTENTIONS'),
        subHeader('Content Standard'), contentCell(textToParagraphs(d.contentStandard)),
        subHeader('Performance Standard'), contentCell(textToParagraphs(d.performanceStandard)),
        subHeader(`Learning Competency (MATATAG Three-Term BOW, ${d.term||'First Term'}, Week ${d.week||'__'})`),
        contentCell(textToParagraphs(d.competency)),
        subHeader('Unpacked Learning Objectives'),
        contentCell([
          new Paragraph({ children: [bold('Knowledge (Cognitive)')], spacing: { before: 60, after: 40 } }),
          ...textToParagraphs(d.knowledgeObjectives),
          new Paragraph({ children: [bold('Skills (Psychomotor)')], spacing: { before: 60, after: 40 } }),
          ...textToParagraphs(d.skillsObjectives),
          new Paragraph({ children: [bold('Attitude (Affective)')], spacing: { before: 60, after: 40 } }),
          ...textToParagraphs(d.attitudeObjectives),
        ]),
        subHeader('Learner Context'), contentCell(textToParagraphs(d.learnerContext)),
        subHeader('Learning Resources'), contentCell(textToParagraphs(d.learningResources)),
        subHeader('Opportunities for Integration'), contentCell(textToParagraphs(d.integration)),
        para(' '),

        sectionHeader('II.  LEARNING EXPERIENCES'),
        subHeader(`Instructional Strategy: ${d.approach || "4A's (Activity – Analysis – Abstraction – Application)"}`),
        contentCell(textToParagraphs(d.strategyRationale)),
        ...sessions,
        para(' '),

        sectionHeader('III.  ASSESSMENT'),
        subHeader('Formative Assessment (Conducted Throughout the Week)'), contentCell(textToParagraphs(d.formativeAssessment)),
        subHeader('Summative Assessment'), contentCell(textToParagraphs(d.summativeAssessment)),
        subHeader('Accommodations and Support'),
        contentCell([
          new Paragraph({ children: [bold('For Learners Needing Additional Support (Developing Level)')], spacing: { before: 60, after: 40 } }),
          ...textToParagraphs(d.supportDeveloping),
          new Paragraph({ children: [bold('For Learners Ready for Extension (Approaching Proficiency to Proficient Level)')], spacing: { before: 60, after: 40 } }),
          ...textToParagraphs(d.supportExtension),
        ]),
        para(' '),

        sectionHeader('IV.  WAYS FORWARD'),
        subHeader('Remediation'), contentCell(textToParagraphs(d.remediation)),
        subHeader('Enrichment'), contentCell(textToParagraphs(d.enrichment)),
        subHeader('Extended Learning Opportunities'), contentCell(textToParagraphs(d.extendedLearning)),
        subHeader('Teacher Reflection'),
        new Table({ width: FULL, columnWidths: [4200, W-4200], rows: [
          reflectionRow('What worked well this week?'),
          reflectionRow('What did not work as expected?'),
          reflectionRow('What will I change for the next teaching of this competency?'),
          reflectionRow('What do learners want to explore further?'),
        ]}),
        para(' '),
        subHeader('AI Declaration (per DepEd Order No. 3, s. 2026)'),
        contentCell([para('This ILAW lesson plan was drafted with the assistance of BINHI (Building Instruction through Narrated and Harmonized Intelligence). The content, contextualization, instructional decisions, and final pedagogical judgments were reviewed, validated, and adapted by the preparing teacher prior to classroom use and submission.')]),
      ]
    }]
  })
}

// ── DeepSeek prompt ───────────────────────────────────────────────────────
async function callDeepSeek(form) {
  const prompt = `You are an expert Filipino MATATAG curriculum writer. Generate a complete ILAW Lesson Plan for Maria Cristina P. Belcar Agricultural High School.

Return ONLY a valid JSON object with these exact keys (no markdown, no code fences, just raw JSON):
{
  "subject": "${form.subject}",
  "term": "${form.term || 'First Term'}",
  "week": "${form.week}",
  "strand": "[strand/domain for this subject]",
  "competency": "${form.competency}",
  "duration": ${form.durationMinutes || 60},
  "numSessions": "5 sessions × ${form.durationMinutes || 60} minutes (Monday to Friday)",
  "contextualization": "[Davao City / local agricultural context relevant to this topic]",
  "proficiency": "Approaching Proficiency to Developing (DepEd Proficiency Descriptors)",
  "teacherName": "${form.teacherName || '[Teacher Name]'}",
  "teacherPosition": "${form.teacherPosition || 'Teacher I'}",
  "principal": "${form.principal || '[Principal Name]'}",
  "principalPosition": "${form.principalPosition || 'Principal II'}",
  "contentStandard": "[content standard for this competency]",
  "performanceStandard": "[performance standard]",
  "knowledgeObjectives": "[3-4 bullet points starting with - ]",
  "skillsObjectives": "[3-4 bullet points starting with - ]",
  "attitudeObjectives": "[2-3 bullet points starting with - ]",
  "learnerContext": "[2-3 paragraph learner context for ${form.gradeLevel} students at MCPBAHS, agricultural school setting]",
  "learningResources": "[bullet list of DepEd materials, tools, references]",
  "integration": "[subject integration opportunities with agriculture, community context]",
  "approach": "${form.approach || "4A's (Activity – Analysis – Abstraction – Application)"}",
  "strategyRationale": "[2-3 sentences explaining why this approach fits the learners]",
  "sessions_content": "SESSION 1 (${form.durationMinutes || 60} minutes) – [title]\\n[full session content with A. Pre-Lesson, B. Activity, C. Analysis, D. Abstraction, E. Application]\\n---SESSION---\\nSESSION 2 (${form.durationMinutes || 60} minutes) – [title]\\n[full session content]\\n---SESSION---\\nSESSION 3 (${form.durationMinutes || 60} minutes) – [title]\\n[full session content]",
  "formativeAssessment": "[formative assessment strategies used each session]",
  "summativeAssessment": "The attached Learning Activity Sheet (LAS) for Week ${form.week} serves as the summative assessment.",
  "supportDeveloping": "[bullet list of accommodations for struggling learners]",
  "supportExtension": "[bullet list of extension activities for advanced learners]",
  "remediation": "[remediation plan for learners below 75%]",
  "enrichment": "[enrichment task for mastery learners]",
  "extendedLearning": "[home/community-based extended learning suggestions]"
}

Subject: ${form.subject}
Grade Level: ${form.gradeLevel}
Quarter: ${form.quarter}
Week: ${form.week}
Learning Competency: ${form.competency}
${form.additionalNotes ? 'Additional Notes: ' + form.additionalNotes : ''}

Use agricultural and Davao City context throughout. Make all content detailed and classroom-ready.`

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message || 'DeepSeek error') }
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const form = JSON.parse(event.body)
    const d    = await callDeepSeek(form)
    const doc  = buildLPDoc(d)
    const buf  = await Packer.toBuffer(doc)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="ILAW_LP_${(form.subject||'').replace(/\s+/g,'_')}_Q${form.quarter}_W${form.week}.docx"`,
        'Access-Control-Allow-Origin': '*'
      },
      body: buf.toString('base64'),
      isBase64Encoded: true
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }) }
  }
}
