// netlify/functions/generate-las.js
// Generates Learning Activity Sheets (LAS) aligned to MATATAG curriculum

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
      competency, activityType, school,
      teacherName, additionalNotes
    } = JSON.parse(event.body)

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
- Be aligned to the MATATAG curriculum competency provided
- Be student-friendly with clear, simple directions
- Use age-appropriate language for the grade level
- Include real-world, Philippine-context examples and scenarios
- Have a proper header following DepEd LAS format
- Include all required sections: Background Information, Directions, Activity/Tasks, and Assessment
- Be print-ready (formatted clearly with proper sections)
- Provide an answer key (marked separately) when applicable
- Use Filipino or English appropriately based on the subject`

    const userPrompt = `Create a complete, print-ready Learning Activity Sheet (LAS) with these specifications:

SCHOOL: ${school || '[School Name]'}
TEACHER: ${teacherName || '[Teacher Name]'}
GRADE LEVEL: ${gradeLevel}
SUBJECT: ${subject}
QUARTER: ${quarter} | WEEK: ${week}
LEARNING COMPETENCY: ${competency}
ACTIVITY TYPE: ${activityTypeDescriptions[activityType] || activityType}
${additionalNotes ? `SPECIAL INSTRUCTIONS: ${additionalNotes}` : ''}

Format the LAS exactly as follows:

---
LEARNING ACTIVITY SHEET
${subject} | ${gradeLevel} | Quarter ${quarter} – Week ${week}

SCHOOL: _____________________________ TEACHER: _____________________________
NAME: _____________________________ SECTION: _____ DATE: _________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TITLE — Make it engaging and student-friendly]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOST ESSENTIAL LEARNING COMPETENCY (MELC):
[State the competency]

LEARNING OBJECTIVES:
After completing this activity, you should be able to:
1. [Knowledge objective]
2. [Skills objective]
3. [Values/Attitude objective]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BACKGROUND INFORMATION FOR LEARNERS
[Write 2-4 paragraphs of content input — the mini-lesson students need to complete the activities. Use simple, clear language. Include examples with Philippine context.]

KEY VOCABULARY:
[List 4-6 key terms with simple definitions]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVITY 1 — [Name] (Remembering/Understanding)
DIRECTIONS: [Clear, simple instructions]
[Include actual content — questions, items, blanks to fill, etc. Minimum 5 items]

ACTIVITY 2 — [Name] (Applying/Analyzing)  
DIRECTIONS: [Clear, simple instructions]
[More complex activity. Real-life or Philippine-context scenarios.]

ACTIVITY 3 — [Name] (Evaluating/Creating OR Performance Task)
DIRECTIONS: [Clear, simple instructions]  
[Highest-order thinking activity. Output-based if applicable.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REFLECTION
Complete this sentence: "I learned that _________________________ because _________________________."

What part of this activity was most challenging for you? ________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RUBRIC / SCORING GUIDE:
[Include a scoring guide appropriate for ${activityType}]

Total Points: _____ / _____ Score: _____ Remarks: _______

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANSWER KEY (Teacher's Copy — Do Not Distribute)
Activity 1: [Answers]
Activity 2: [Answers/Sample Responses]
Activity 3: [Rubric indicators / Sample output]
---

Make all activities realistic, engaging, and rooted in Philippine context. For ${subject}, use appropriate language and examples that Filipino ${gradeLevel} students can relate to.`

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
    console.error('generate-las error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
