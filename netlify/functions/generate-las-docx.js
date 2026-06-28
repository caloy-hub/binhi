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

function sectionHeader(text, pts='') {
  const cols = pts ? [W-1800, 1800] : [W]
  return new Table({ width: FULL, columnWidths: cols, rows: [new TableRow({ children: [
    new TableCell({ borders, width: { size: cols[0], type: WidthType.DXA }, margins: cellPad,
      shading: { fill: '1B5E2A', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 22, color: 'FFFFFF', font: 'Arial' })] })]
    }),
    ...(pts ? [new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, margins: cellPad,
      shading: { fill: '1B5E2A', type: ShadingType.CLEAR },
      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: pts, bold: true, size: 20, color: 'FFFFFF', font: 'Arial' })] })]
    })] : [])
  ]})]})
}

function contentBox(text) {
  const lines = String(text||'').split('\n')
  const paragraphs = lines.map(line => {
    const t = line.trim()
    if (!t) return para('')
    const isBullet = /^[-•*]\s/.test(t) || /^\d+\.\s/.test(t) || /^[A-Z]\.\s/.test(t)
    return new Paragraph({ spacing: { before: 40, after: 40 }, indent: isBullet ? { left: 360 } : {}, children: [run(t)] })
  })
  return new Table({ width: FULL, columnWidths: [W], rows: [new TableRow({ children: [
    new TableCell({ borders, width: FULL, margins: cellPad, children: paragraphs })
  ]})]})
}

function buildLASDoc(d) {
  return new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [bold('MARIA CRISTINA P. BELCAR AGRICULTURAL HIGH SCHOOL', 22)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [run('Maria Cristina, Davao del Norte', { italics: true })] }),

        new Table({ width: FULL, columnWidths: [W], rows: [new TableRow({ children: [
          new TableCell({ borders, width: FULL, margins: cellPad,
            shading: { fill: '1B5E2A', type: ShadingType.CLEAR },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LEARNING ACTIVITY SHEET', bold: true, size: 26, color: 'FFFFFF', font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${d.subject}  –  ${d.term||'First Term'}, Week ${d.week}`, bold: true, size: 22, color: 'FFFFFF', font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.title||'', italics: true, size: 20, color: 'FFFFFF', font: 'Arial' })] }),
            ]
          })
        ]})]}) ,

        new Table({ width: FULL, columnWidths: [1800, W-1800], rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [bold('Name')] })] }),
            new TableCell({ borders, width: { size: W-1800, type: WidthType.DXA }, margins: cellPad, children: [para('_______________________________________')] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [bold('Grade & Section')] })] }),
            new TableCell({ borders, width: { size: W-1800, type: WidthType.DXA }, margins: cellPad, children: [para(`${d.gradeLevel||'Grade ___'} – ___________________`)] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [bold('Date')] })] }),
            new TableCell({ borders, width: { size: W-1800, type: WidthType.DXA }, margins: cellPad, children: [para('_______________')] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [bold('Total Score')] })] }),
            new TableCell({ borders, width: { size: W-1800, type: WidthType.DXA }, margins: cellPad, children: [para(`_______ / ${d.totalPoints||50} points`)] }),
          ]}),
        ]}),

        para(d.generalDirections||'Directions: Read each item carefully and answer all parts completely.', { before: 80, after: 80 }),

        sectionHeader('PART A.  ' + (d.partATitle||'Multiple Choice – Concept Check'), `${d.partAPoints||10} points`),
        para(d.partADirections||'Directions: Choose the letter of the correct answer. Write your answer on the blank before each number.', { before: 60, after: 40 }),
        contentBox(d.partA||''),

        sectionHeader('PART B.  ' + (d.partBTitle||'Computation – Direct Application'), `${d.partBPoints||20} points`),
        para(d.partBDirections||'Directions: Solve for the indicated missing part(s). Show your complete solution. Round final answers to two decimal places.', { before: 60, after: 40 }),
        contentBox(d.partB||''),
        sectionHeader('Scoring Rubric for Part B'),
        contentBox(d.partBRubric||''),

        sectionHeader('PART C.  ' + (d.partCTitle||'Word Problem Solving – Real-Life Application'), `${d.partCPoints||20} points`),
        para(d.partCDirections||'Directions: Read each problem carefully. Show a labeled diagram and your complete solution. Box your final answer with the correct unit.', { before: 60, after: 40 }),
        contentBox(d.partC||''),
        sectionHeader('Scoring Rubric for Part C'),
        contentBox(d.partCRubric||''),

        sectionHeader('Overall Score Summary'),
        new Table({ width: FULL, columnWidths: [5000, 2000, W-7000], rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 5000, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'C8E6C9', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [bold('Part')] })] }),
            new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'C8E6C9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [bold('Possible Points')] })] }),
            new TableCell({ borders, width: { size: W-7000, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'C8E6C9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [bold('Score')] })] }),
          ]}),
          ...['A', 'B', 'C'].map((p, i) => {
            const titles  = [d.partATitle||'Multiple Choice', d.partBTitle||'Computation', d.partCTitle||'Word Problem Solving']
            const points  = [d.partAPoints||10, d.partBPoints||20, d.partCPoints||20]
            return new TableRow({ children: [
              new TableCell({ borders, width: { size: 5000, type: WidthType.DXA }, margins: cellPad, children: [para(`${p}. ${titles[i]}`)] }),
              new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, margins: cellPad, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(String(points[i]))] })] }),
              new TableCell({ borders, width: { size: W-7000, type: WidthType.DXA }, margins: cellPad, children: [para(' ')] }),
            ]})
          }),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 5000, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [bold('TOTAL')] })] }),
            new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [bold(String(d.totalPoints||50))] })] }),
            new TableCell({ borders, width: { size: W-7000, type: WidthType.DXA }, margins: cellPad, shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }, children: [para(' ')] }),
          ]}),
        ]}),
      ]
    }]
  })
}

async function callDeepSeek(form) {
  const prompt = `You are a DepEd MATATAG curriculum specialist for Maria Cristina P. Belcar Agricultural High School (an agricultural school in Davao del Norte).

Generate a complete Learning Activity Sheet (LAS) and return ONLY a valid JSON object (no markdown, no code fences):
{
  "title": "[engaging student-friendly title for the LAS]",
  "subject": "${form.subject}",
  "term": "${form.term||'First Term'}",
  "week": "${form.week}",
  "gradeLevel": "${form.gradeLevel}",
  "totalPoints": 50,
  "generalDirections": "[general directions for the whole LAS]",
  "partATitle": "Multiple Choice – Concept Check",
  "partAPoints": 10,
  "partADirections": "Directions: Choose the letter of the correct answer. Write your answer on the blank before each number.",
  "partA": "[10 multiple choice items numbered 1-10, each with A/B/C/D choices, all using Davao City / agricultural context. Format:\\n_____ 1. [question]\\nA. [choice]\\nB. [choice]\\nC. [choice]\\nD. [choice]\\n\\n_____ 2. ...]",
  "partBTitle": "Computation – Direct Application",
  "partBPoints": 20,
  "partBDirections": "Directions: Solve for the indicated missing part(s). Show your complete solution in the space provided. Round final answers to two decimal places.",
  "partB": "[4 computation problems (5 pts each) with space for solutions, using Davao City / agricultural context]",
  "partBRubric": "[5-row scoring rubric table as text: 5 pts, 4 pts, 3 pts, 2 pts, 1 pt, 0 pts with descriptions]",
  "partCTitle": "Word Problem Solving – Real-Life Application",
  "partCPoints": 20,
  "partCDirections": "Directions: Read each problem carefully. Show a labeled diagram and your complete solution. Box your final answer with the correct unit.",
  "partC": "[2 word problems (10 pts each) set in Davao City agricultural context with space for solutions]",
  "partCRubric": "[scoring rubric with criteria: Diagram & Labeling, Case/Concept Identification, Solution Process, Final Answer & Accuracy — rated Excellent/Satisfactory/Developing/Beginning]"
}

Subject: ${form.subject}
Grade Level: ${form.gradeLevel}
Quarter: ${form.quarter}
Week: ${form.week}
Learning Competency: ${form.competency}
Activity Type: ${form.activityType||'worksheet'}
${form.additionalNotes ? 'Special Instructions: ' + form.additionalNotes : ''}

All scenarios must use Philippine / Davao City / agricultural context. Make all items specific and educationally sound.`

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat', max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message||'DeepSeek error') }
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const form = JSON.parse(event.body)
    const d    = await callDeepSeek(form)
    const doc  = buildLASDoc(d)
    const buf  = await Packer.toBuffer(doc)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="LAS_${(form.subject||'').replace(/\s+/g,'_')}_Q${form.quarter}_W${form.week}.docx"`,
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
