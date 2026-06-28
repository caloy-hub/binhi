// MATATAG Curriculum Constants
// 3-Term (Quarter) System for JHS and SHS

export const GRADE_LEVELS = [
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',   // JHS
  'Grade 11', 'Grade 12'                           // SHS
]

export const JHS_SUBJECTS = [
  'Filipino',
  'English',
  'Mathematics',
  'Science',
  'Araling Panlipunan',
  'Edukasyon sa Pagpapakatao (EsP)',
  'Technology and Livelihood Education (TLE)',
  'Music, Arts, Physical Education and Health (MAPEH)',
  'Computer Science'
]

export const SHS_CORE_SUBJECTS = [
  'Oral Communication',
  'Reading and Writing',
  'Komunikasyon at Pananaliksik',
  'Pagbasa at Pagsusuri',
  'General Mathematics',
  'Statistics and Probability',
  'Earth and Life Science',
  'Physical Science',
  'Introduction to Philosophy',
  'Personal Development',
  'Understanding Culture Society and Politics',
  'Media and Information Literacy'
]

export const SHS_TRACKS = {
  'Academic': {
    'STEM': ['Pre-Calculus', 'Basic Calculus', 'General Biology 1', 'General Biology 2', 'General Chemistry 1', 'General Chemistry 2', 'General Physics 1', 'General Physics 2'],
    'ABM': ['Business Mathematics', 'Fundamentals of Accountancy Business and Management 1', 'Fundamentals of Accountancy Business and Management 2', 'Business Finance', 'Organization and Management', 'Applied Economics'],
    'HUMSS': ['Creative Writing', 'Introduction to World Religions and Belief Systems', 'Disciplines and Ideas in the Social Sciences', 'Community Engagement Solidarity and Citizenship'],
    'GAS': ['Empowerment Technologies', 'Entrepreneurship']
  },
  'TVL': ['Cookery', 'Bread and Pastry Production', 'Computer Systems Servicing', 'Electrical Installation and Maintenance'],
  'Sports': ['Sports'],
  'Arts and Design': ['Arts and Design']
}

export const QUARTERS = [
  { value: 1, label: 'Quarter 1 (Term 1)' },
  { value: 2, label: 'Quarter 2 (Term 2)' },
  { value: 3, label: 'Quarter 3 (Term 3)' }
]

export const WEEKS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `Week ${i + 1}`
}))

export const DURATION_OPTIONS = [
  { value: 45, label: '45 minutes (Standard)' },
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes (Double period)' }
]

export const ACTIVITY_TYPES = [
  { value: 'worksheet', label: 'Worksheet / Exercises' },
  { value: 'performance_task', label: 'Performance Task' },
  { value: 'formative', label: 'Formative Assessment' },
  { value: 'summative', label: 'Summative Assessment' },
  { value: 'enrichment', label: 'Enrichment Activity' },
  { value: 'remediation', label: 'Remediation Activity' }
]

export const APPROACHES = [
  '4As (Activity, Analysis, Abstraction, Application)',
  '5Es (Engage, Explore, Explain, Elaborate, Evaluate)',
  'Inquiry-Based Learning',
  'Problem-Based Learning',
  'Direct Instruction',
  'Cooperative Learning',
  'Project-Based Learning'
]

// Get subjects by grade level
export function getSubjectsByGrade(grade) {
  if (['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(grade)) {
    return JHS_SUBJECTS
  }
  return [...SHS_CORE_SUBJECTS, ...Object.values(SHS_TRACKS.Academic).flat(), ...SHS_TRACKS.TVL]
}
