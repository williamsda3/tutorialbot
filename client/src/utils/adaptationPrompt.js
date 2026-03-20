const TONE_MAP = {
  beginner: `Guidance style — BEGINNER:
- Warm, encouraging tone. Normalize getting stuck and celebrate small wins.
- Explain the "why" behind each instruction — not just what to do, but why it matters.
- Provide complete, near-copy-paste code snippets with line-by-line explanation.
- Keep instructions granular and sequential — don't skip steps or assume knowledge.
- After each major instruction, check in: suggest they try it and come back with questions.`,

  intermediate: `Guidance style — INTERMEDIATE:
- Collaborative, peer-to-peer tone.
- Focus on best practices, patterns, and clean code — not just getting it to work.
- Provide partial code snippets showing the approach; let them fill in the details.
- When multiple valid approaches exist, present options and let them decide.
- Push toward understanding trade-offs, not just following instructions.`,

  advanced: `Guidance style — ADVANCED:
- Direct and concise. Skip basics, focus on what's non-obvious.
- Discuss architecture decisions, trade-offs, and edge cases.
- Minimal code — pseudocode or pattern sketches only.
- Push on production concerns: scalability, error handling, failure modes.
- Frame everything through the lens of interview readiness and portfolio impact.`,
}

export function buildAdaptationSection(profile) {
  if (!profile?.experience_level) return ''

  const level = profile.experience_level
  const comfort = profile.comfort_preference || 'achievable'

  let section = '\n\n' + (TONE_MAP[level] || TONE_MAP.beginner)

  if (comfort === 'stretching') {
    section += '\n- The user wants to be stretched. Introduce new concepts and suggest stretch goals beyond the basics.'
  } else {
    section += '\n- The user prefers achievable tasks. Build confidence with proven, well-documented approaches.'
  }

  if (profile.experience_detail) {
    section += `\n- Specific background: ${profile.experience_detail}`
  }

  return section
}
