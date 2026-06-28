// netlify/functions/generate-lesson-plan.js
// Secure serverless function — ANTHROPIC_API_KEY never reaches the browser

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    const {
      gradeLevel, subject, quarter, week,
      durationMinutes, competency, approach,
      additionalNotes, teacherName, school
    } = JSON.parse(event.body)

    const systemPrompt = `You are an expert Filipino curriculum writer and master teacher with deep expertise in the DepEd MATATAG Curriculum (K-10) and the Senior High School curriculum. You produce detailed, classroom-ready lesson plans that strictly follow the DepEd Lesson Plan format and are aligned to the MATATAG curriculum competencies.

Your lesson plans must:
- Use proper DepEd LP format with all required parts
- Be written in a mix of Filipino and English as appropriate for the subject
- Include real, practical learning activities — not generic placeholders
- Follow the 4As or specified approach in the procedure
- Include differentiated instruction hints (for advanced and struggling learners)
- Reference actual DepEd-approved learning resources when possible
- Be realistic for the given time duration
- Include values integration aligned to the Whole Child approach of MATATAG

Always output a complete, print-ready lesson plan.`

    const userPrompt = `Generate a complete, detailed MATATAG-aligned Lesson Plan with the following specifications:

TEACHER: ${teacherName || '[Teacher Name]'}
SCHOOL: ${school || '[School Name]'}
GRADE LEVEL: ${gradeLevel}
SUBJECT: ${subject}
QUARTER: ${quarter}
WEEK: ${week}
DURATION: ${durationMinutes} minutes
LEARNING COMPETENCY: ${competency}
INSTRUCTIONAL APPROACH: ${approach || '4As (Activity, Analysis, Abstraction, Application)'}
${additionalNotes ? `ADDITIONAL NOTES: ${additionalNotes}` : ''}

Generate the lesson plan following this exact DepEd format:

---
LESSON PLAN

I. OBJECTIVES
   A. Content Standard
   B. Performance Standard
   C. Learning Competency (with MATATAG code)
   D. Learning Objectives (by the end of the lesson, learners will be able to...)
      1. Knowledge
      2. Skills
      3. Attitude/Values

II. CONTENT
    Topic/Subject Matter (specific topic within the competency)

III. LEARNING RESOURCES
     A. References (DepEd Materials, textbooks with page numbers)
     B. Other Learning Resources (charts, videos, manipulatives, etc.)

IV. PROCEDURES (following the ${approach || '4As'} approach)
    A. Reviewing Previous Lesson / Presenting the New Lesson (5-10 mins)
    B. Establishing Purpose / Motivation
    C. Presenting Examples / Lesson Proper (detailed, step-by-step)
    D. Discussing Concepts and Practicing New Skills
    E. Finding Practical Applications / Generalization
    F. Evaluating Learning (with actual assessment items — minimum 5 questions/items)
    G. Additional Activities for Application or Remediation

V. REMARKS
   (Space for teacher's notes on lesson delivery)

VI. REFLECTION
    A. Number of learners who earned 80% in the evaluation
    B. Number of learners who require additional activities for remediation
    C. Did the remedial lessons work?
    D. Number of learners who continue to require remediation
    E. Which of my teaching strategies worked well?
    F. What difficulties did I encounter?
    G. What innovation or localized materials did I use?

---
Make the lesson plan detailed, practical, and immediately usable in a Philippine classroom. Include specific examples, actual questions, and realistic activities. Use Filipino/English appropriately for the subject ${subject}.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Claude API error')
    }

    const data = await response.json()
    const generatedText = data.content[0].text

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, text: generatedText })
    }
  } catch (err) {
    console.error('generate-lesson-plan error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
