import { getLASTemplate } from './templateStore'

export async function generateLAS(form) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  const template = getLASTemplate()

  const activityTypeDescriptions = {
    worksheet: 'a structured worksheet with exercises and questions',
    performance_task: 'a performance task with rubric for output-based assessment',
    formative: 'a formative assessment to check learning mid-lesson',
    summative: 'a summative assessment covering the full competency',
    enrichment: 'an enrichment activity for advanced learners',
    remediation: 'a remediation activity for learners who need extra support'
  }

  const systemPrompt = `You are a DepEd curriculum specialist creating Learning Activity Sheets (LAS) for Filipino students.

Your LAS must:
- Be aligned to the MATATAG curriculum competency
- Be student-friendly with clear, simple directions
- Use age-appropriate language for the grade level
- Include real-world, Philippine-context examples
- Be print-ready with proper sections
- Provide an answer key when applicable
- Use Filipino or English appropriately based on the subject`

  const templateInstruction = template
    ? `IMPORTANT: You must follow this EXACT template format provided by the teacher's school.
Keep all section headings, labels, fill-in blanks, borders (===, ---), and structure exactly as shown.
Only fill in the content — do not change the format, remove sections, or add new sections.

HERE IS THE TEMPLATE TO FOLLOW:
===START OF TEMPLATE===
${template}
===END OF TEMPLATE===

Now fill in the above template with the following activity details:`
    : `Generate the LAS following the standard DepEd format with these sections:
- Header (School, Teacher, Name, Section, Date)
- Title
- MELC / Learning Competency
- Learning Objectives
- Background Information for Learners
- Key Vocabulary
- Activity 1 (Remembering/Understanding)
- Activity 2 (Applying/Analyzing)
- Activity 3 (Evaluating/Creating)
- Reflection
- Scoring Guide
- Answer Key (Teacher's Copy)`

  const userPrompt = `${templateInstruction}

SCHOOL: ${form.school || 'Maria Cristina P. Belcar Agricultural High School'}
TEACHER: ${form.teacherName || '[Teacher Name]'}
GRADE LEVEL: ${form.gradeLevel}
SUBJECT: ${form.subject}
QUARTER: ${form.quarter} | WEEK: ${form.week}
LEARNING COMPETENCY: ${form.competency}
ACTIVITY TYPE: ${activityTypeDescriptions[form.activityType] || form.activityType}
${form.additionalNotes ? `SPECIAL INSTRUCTIONS: ${form.additionalNotes}` : ''}

Generate a complete, print-ready LAS with actual activities, questions, and an answer key. Use Philippine context in examples.`

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
