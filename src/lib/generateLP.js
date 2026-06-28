import { getLPTemplate } from './templateStore'

export async function generateLessonPlan(form) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  const template = getLPTemplate()

  const systemPrompt = `You are an expert Filipino curriculum writer and master teacher with deep expertise in the DepEd MATATAG Curriculum and Senior High School curriculum. You produce detailed, classroom-ready lesson plans aligned to MATATAG curriculum competencies.

Your lesson plans must:
- Be written in a mix of Filipino and English appropriate for the subject
- Include real, practical learning activities — not generic placeholders
- Follow the specified instructional approach
- Include differentiated instruction hints
- Be realistic for the given time duration
- Include values integration aligned to the Whole Child approach of MATATAG
- Always output a complete, print-ready lesson plan`

  const templateInstruction = template
    ? `IMPORTANT: You must follow this EXACT template format provided by the teacher's school. 
Keep all section headings, labels, Roman numerals, and structure exactly as shown.
Only fill in the content — do not change the format, remove sections, or add new sections.

HERE IS THE TEMPLATE TO FOLLOW:
===START OF TEMPLATE===
${template}
===END OF TEMPLATE===

Now fill in the above template with the following lesson details:`
    : `Generate the lesson plan following the standard DepEd MATATAG format with these sections:
I. OBJECTIVES (Content Standard, Performance Standard, Learning Competency, Learning Objectives)
II. CONTENT (Topic/Subject Matter)
III. LEARNING RESOURCES (References, Other Materials)
IV. PROCEDURES (Review, Motivation, Lesson Proper, Practice, Generalization, Evaluation, Remediation)
V. REMARKS
VI. REFLECTION`

  const userPrompt = `${templateInstruction}

TEACHER: ${form.teacherName || '[Teacher Name]'}
SCHOOL: ${form.school || 'Maria Cristina P. Belcar Agricultural High School'}
GRADE LEVEL: ${form.gradeLevel}
SUBJECT: ${form.subject}
QUARTER: ${form.quarter}
WEEK: ${form.week}
DURATION: ${form.durationMinutes} minutes
LEARNING COMPETENCY: ${form.competency}
INSTRUCTIONAL APPROACH: ${form.approach || '4As (Activity, Analysis, Abstraction, Application)'}
${form.additionalNotes ? `ADDITIONAL NOTES: ${form.additionalNotes}` : ''}

Generate a complete, detailed, print-ready lesson plan. Include actual questions and activities — not placeholders.`

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 4000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!response.ok) {
    const err = await response.json()
    console.error('DeepSeek error:', err)
    throw new Error(err?.error?.message || 'DeepSeek API error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}
