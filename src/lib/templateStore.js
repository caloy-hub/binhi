// Template storage — saves extracted DOCX text as templates
// stored in localStorage so they persist across sessions

const LP_KEY = 'binhi_lp_template'
const LAS_KEY = 'binhi_las_template'

export function saveLPTemplate(text) {
  localStorage.setItem(LP_KEY, text)
}

export function saveLASTemplate(text) {
  localStorage.setItem(LAS_KEY, text)
}

export function getLPTemplate() {
  return localStorage.getItem(LP_KEY) || null
}

export function getLASTemplate() {
  return localStorage.getItem(LAS_KEY) || null
}

export function clearLPTemplate() {
  localStorage.removeItem(LP_KEY)
}

export function clearLASTemplate() {
  localStorage.removeItem(LAS_KEY)
}
